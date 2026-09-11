const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

const passwordRounds = 12;

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    salesCount: user._count?.sales ?? 0,
  };
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

async function listUsers({
  search,
  role,
  isActive,
  page = 1,
  limit = 20,
  sortBy = "createdAt",
  sortOrder = "desc",
}) {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));

  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (typeof isActive === "boolean") {
    where.isActive = isActive;
  }

  const skip = (pageNum - 1) * limitNum;

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: {
          select: { sales: true },
        },
      },
    }),
  ]);

  return {
    data: users.map(toPublicUser),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: { sales: true },
      },
    },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return toPublicUser(user);
}

async function createUser({ name, email, password, role = "CASHIER", isActive = true }) {
  const normalizedEmail = normalizeEmail(email);
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existingUser) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, passwordRounds);
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
      isActive,
    },
    include: {
      _count: {
        select: { sales: true },
      },
    },
  });

  return toPublicUser(user);
}

async function updateUser(id, { name, email, password, role, isActive }, currentUserId) {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // Prevent admin from deactivating their own logged-in account
  if (id === currentUserId && isActive === false) {
    const error = new Error("You cannot deactivate your own logged-in account");
    error.statusCode = 400;
    throw error;
  }

  const data = {};

  if (name !== undefined) {
    data.name = name.trim();
  }

  if (email !== undefined) {
    const normalizedEmail = normalizeEmail(email);
    if (normalizedEmail !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
      });

      if (emailTaken) {
        const error = new Error("Email is already in use by another user");
        error.statusCode = 409;
        throw error;
      }
      data.email = normalizedEmail;
    }
  }

  if (password && password.trim().length >= 8) {
    data.passwordHash = await bcrypt.hash(password.trim(), passwordRounds);
  }

  if (role !== undefined) {
    data.role = role;
  }

  if (isActive !== undefined) {
    data.isActive = isActive;
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data,
    include: {
      _count: {
        select: { sales: true },
      },
    },
  });

  return toPublicUser(updatedUser);
}

async function deleteUser(id, currentUserId) {
  if (id === currentUserId) {
    const error = new Error("You cannot delete your own logged-in account");
    error.statusCode = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: { sales: true },
      },
    },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // If user has recorded sales, soft-delete by setting isActive to false.
  // If user has no recorded sales, perform a hard delete.
  if (user._count.sales > 0) {
    const softDeleted = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      include: {
        _count: {
          select: { sales: true },
        },
      },
    });
    return {
      message: "User has associated sales records, so the account was deactivated instead of deleted.",
      user: toPublicUser(softDeleted),
      deactivated: true,
    };
  }

  await prisma.user.delete({ where: { id } });

  return {
    message: "User deleted successfully",
    id,
    deleted: true,
  };
}

module.exports = {
  createUser,
  deleteUser,
  getUserById,
  listUsers,
  updateUser,
};
