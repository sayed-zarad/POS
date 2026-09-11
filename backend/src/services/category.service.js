const prisma = require("../config/prisma");

const categorySelect = {
  id: true,
  name: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { products: true } },
};

function notFound() {
  const error = new Error("Category not found");
  error.statusCode = 404;
  return error;
}

function handlePrismaError(error) {
  if (error.code === "P2002") {
    const duplicateError = new Error("Category name is already registered");
    duplicateError.statusCode = 409;
    return duplicateError;
  }

  return error;
}

function serializeCategory(category) {
  return {
    ...category,
    productsCount: category._count.products,
    _count: undefined,
  };
}

async function listCategories({
  search,
  isActive,
  page,
  limit,
  sortBy,
  sortOrder,
}) {
  const where = {
    isActive,
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
  };

  const [categories, total] = await prisma.$transaction([
    prisma.category.findMany({
      where,
      select: categorySelect,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.category.count({ where }),
  ]);

  return {
    data: categories.map(serializeCategory),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function getCategoryById(id) {
  const category = await prisma.category.findUnique({
    where: { id },
    select: categorySelect,
  });

  if (!category) {
    throw notFound();
  }

  return serializeCategory(category);
}

async function createCategory({ name, isActive = true }) {
  try {
    const category = await prisma.category.create({
      data: { name, isActive },
      select: categorySelect,
    });

    return serializeCategory(category);
  } catch (error) {
    throw handlePrismaError(error);
  }
}

async function updateCategory(id, data) {
  await getCategoryById(id);

  try {
    const category = await prisma.category.update({
      where: { id },
      data,
      select: categorySelect,
    });

    return serializeCategory(category);
  } catch (error) {
    throw handlePrismaError(error);
  }
}

async function deactivateCategory(id) {
  await getCategoryById(id);

  const category = await prisma.category.update({
    where: { id },
    data: { isActive: false },
    select: categorySelect,
  });

  return serializeCategory(category);
}

module.exports = {
  createCategory,
  deactivateCategory,
  getCategoryById,
  listCategories,
  updateCategory,
};
