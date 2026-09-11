const prisma = require("../config/prisma");

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const saleSelect = {
  id: true,
  userId: true,
  subtotal: true,
  discountAmount: true,
  taxAmount: true,
  totalAmount: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, name: true, email: true } },
  items: {
    select: {
      id: true,
      productId: true,
      quantity: true,
      unitPrice: true,
      discountAmount: true,
      taxAmount: true,
      totalAmount: true,
      product: { select: { id: true, name: true, image: true } },
    },
  },
};

function serializeSale(sale) {
  return {
    ...sale,
    subtotal: Number(sale.subtotal),
    discountAmount: Number(sale.discountAmount),
    taxAmount: Number(sale.taxAmount),
    totalAmount: Number(sale.totalAmount),
    items: sale.items.map((item) => ({
      ...item,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      discountAmount: Number(item.discountAmount),
      taxAmount: Number(item.taxAmount),
      totalAmount: Number(item.totalAmount),
    })),
  };
}

function makeError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// ─────────────────────────────────────────────
// createSale
// ─────────────────────────────────────────────

async function createSale({
  userId,
  items,
  discountAmount = 0,
  taxRate = 0.14,
}) {
  const productIds = items.map((i) => i.productId);

  // 1. جيب المنتجات وتأكد إنهم active
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      price: true,
      isActive: true,
      inventory: { select: { quantity: true } },
    },
  });

  // تحقق إن كل المنتجات موجودة
  if (products.length !== productIds.length) {
    const foundIds = products.map((p) => p.id);
    const missingId = productIds.find((id) => !foundIds.includes(id));
    throw makeError(`Product with id ${missingId} not found`, 404);
  }

  // تحقق إن كل المنتجات active
  const inactiveProduct = products.find((p) => !p.isActive);
  if (inactiveProduct) {
    throw makeError(`Product "${inactiveProduct.name}" is not available`, 400);
  }

  // 2. تحقق من الكمية في المخزون
  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    const product = productMap.get(item.productId);
    const stockQty = product.inventory ? Number(product.inventory.quantity) : 0;

    if (stockQty < item.quantity) {
      throw makeError(
        `Insufficient stock for "${product.name}". Available: ${stockQty}, Requested: ${item.quantity}`,
        400,
      );
    }
  }

  // 3. احسب التوتالات
  let subtotal = 0;

  const saleItemsData = items.map((item) => {
    const product = productMap.get(item.productId);
    const unitPrice = Number(product.price);
    const itemSubtotal = unitPrice * item.quantity;
    subtotal += itemSubtotal;

    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice,
      discountAmount: 0,
      taxAmount: 0, // Tax على مستوى الـ Sale مش الـ item
      totalAmount: itemSubtotal,
    };
  });

  const taxAmount = (subtotal - discountAmount) * taxRate;
  const totalAmount = subtotal - discountAmount + taxAmount;

  // 4. Transaction: أنشئ الـ sale + خصم المخزون
  const sale = await prisma.$transaction(async (tx) => {
    // أنشئ الـ Sale مع الـ items
    const createdSale = await tx.sale.create({
      data: {
        userId,
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        status: "COMPLETED",
        items: { create: saleItemsData },
      },
      select: saleSelect,
    });

    // خصم الكمية من المخزون لكل منتج
    await Promise.all(
      items.map((item) =>
        tx.inventory.update({
          where: { productId: item.productId },
          data: { quantity: { decrement: item.quantity } },
        }),
      ),
    );

    return createdSale;
  });

  return serializeSale(sale);
}

// ─────────────────────────────────────────────
// listSales
// ─────────────────────────────────────────────

async function listSales({ page, limit, sortOrder, status }) {
  const where = {
    ...(status ? { status } : {}),
  };

  const [sales, total] = await prisma.$transaction([
    prisma.sale.findMany({
      where,
      select: saleSelect,
      orderBy: { createdAt: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.sale.count({ where }),
  ]);

  return {
    data: sales.map(serializeSale),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// ─────────────────────────────────────────────
// getSaleById
// ─────────────────────────────────────────────

async function getSaleById(id) {
  const sale = await prisma.sale.findUnique({
    where: { id },
    select: saleSelect,
  });

  if (!sale) {
    throw makeError("Sale not found", 404);
  }

  return serializeSale(sale);
}

// ─────────────────────────────────────────────
// cancelSale — إلغاء البيع وإرجاع الكمية للمخزون
// ─────────────────────────────────────────────

async function cancelSale(id) {
  const sale = await prisma.sale.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      items: { select: { productId: true, quantity: true } },
    },
  });

  if (!sale) {
    throw makeError("Sale not found", 404);
  }

  if (sale.status === "CANCELLED") {
    throw makeError("Sale is already cancelled", 400);
  }

  if (sale.status === "REFUNDED") {
    throw makeError("Sale is already refunded", 400);
  }

  const updatedSale = await prisma.$transaction(async (tx) => {
    // أرجع الكمية للمخزون
    await Promise.all(
      sale.items.map((item) =>
        tx.inventory.update({
          where: { productId: item.productId },
          data: { quantity: { increment: Number(item.quantity) } },
        }),
      ),
    );

    // غير حالة الـ Sale
    return tx.sale.update({
      where: { id },
      data: { status: "CANCELLED" },
      select: saleSelect,
    });
  });

  return serializeSale(updatedSale);
}

module.exports = {
  createSale,
  listSales,
  getSaleById,
  cancelSale,
};
