const prisma = require("../config/prisma");

const productSelect = {
  id: true,
  name: true,
  categoryId: true,
  price: true,
  image: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: { id: true, name: true },
  },
  inventory: {
    select: { quantity: true },
  },
};

function createNotFoundError(message = "Product not found") {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
}

function serializeProduct(product) {
  return {
    ...product,
    price: Number(product.price),
    inventory: product.inventory
      ? { quantity: Number(product.inventory.quantity) }
      : null,
  };
}

async function listProducts({
  search,
  categoryId,
  isActive,
  page,
  limit,
  sortBy,
  sortOrder,
}) {
  const where = {
    isActive,
    ...(categoryId ? { categoryId } : {}),
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
  };

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      select: productSelect,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data: products.map(serializeProduct),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getProductById(id) {
  const product = await prisma.product.findUnique({
    where: { id },
    select: productSelect,
  });

  if (!product) {
    throw createNotFoundError();
  }

  return serializeProduct(product);
}

async function createProduct({
  name,
  categoryId,
  price,
  image,
  isActive = true,
}) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 400;
    throw error;
  }

  const product = await prisma.product.create({
    data: {
      name,
      categoryId,
      price,
      image,
      isActive,
      inventory: { create: { quantity: 0 } }, // إنشاء record في المخزون تلقائياً
    },
    select: productSelect,
  });

  return serializeProduct(product);
}

async function updateProduct(id, data) {
  await getProductById(id);

  if (data.categoryId !== undefined) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      const error = new Error("Category not found");
      error.statusCode = 400;
      throw error;
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data,
    select: productSelect,
  });

  return serializeProduct(product);
}

async function deactivateProduct(id) {
  await getProductById(id);

  const product = await prisma.product.update({
    where: { id },
    data: { isActive: false },
    select: productSelect,
  });

  return serializeProduct(product);
}

module.exports = {
  createProduct,
  deactivateProduct,
  getProductById,
  listProducts,
  updateProduct,
};
