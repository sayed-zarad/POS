const prisma = require("../config/prisma");

const inventorySelect = {
  id: true,
  productId: true,
  quantity: true,
  product: {
    select: {
      id: true,
      name: true,
      price: true,
      image: true,
      isActive: true,
      category: { select: { id: true, name: true } },
    },
  },
};

function serializeInventory(inventory) {
  return {
    ...inventory,
    quantity: Number(inventory.quantity),
    product: inventory.product
      ? { ...inventory.product, price: Number(inventory.product.price) }
      : undefined,
  };
}

function notFound(message = "Inventory record not found") {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
}

async function listInventory({
  search,
  categoryId,
  lowStock,
  page,
  limit,
  sortOrder,
}) {
  const where = {
    ...(categoryId ? { product: { categoryId } } : {}),
    ...(search
      ? {
          product: {
            ...(categoryId ? { categoryId } : {}),
            name: { contains: search, mode: "insensitive" },
          },
        }
      : {}),
    ...(lowStock ? { quantity: { lte: 10 } } : {}),
  };

  const [inventory, total] = await prisma.$transaction([
    prisma.inventory.findMany({
      where,
      select: inventorySelect,
      orderBy: { quantity: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.inventory.count({ where }),
  ]);

  return {
    data: inventory.map(serializeInventory),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function getInventoryByProductId(productId) {
  const inventory = await prisma.inventory.findUnique({
    where: { productId },
    select: inventorySelect,
  });

  if (!inventory) {
    throw notFound();
  }

  return serializeInventory(inventory);
}

async function increaseProductQuantity(productId, quantity) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  const inventory = await prisma.inventory.upsert({
    where: { productId },
    create: { productId, quantity },
    update: { quantity: { increment: quantity } },
    select: inventorySelect,
  });

  return serializeInventory(inventory);
}

async function setProductQuantity(productId, quantity) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!product) {
    throw notFound("Product not found");
  }

  const inventory = await prisma.inventory.upsert({
    where: { productId },
    create: { productId, quantity },
    update: { quantity },
    select: inventorySelect,
  });

  return serializeInventory(inventory);
}

module.exports = {
  getInventoryByProductId,
  increaseProductQuantity,
  listInventory,
  setProductQuantity,
};
