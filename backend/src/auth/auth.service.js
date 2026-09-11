const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const passwordRounds = 12;
const allowedRoles = new Set(["ADMIN", "CASHIER"]);

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return process.env.JWT_SECRET;
}

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
}

function createAccessToken(user) {
  return jwt.sign({ sub: String(user.id), role: user.role }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "8h",
  });
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

async function register({ name, email, password, role = "CASHIER" }) {
  if (!allowedRoles.has(role)) {
    const error = new Error("Invalid user role");
    error.statusCode = 400;
    throw error;
  }

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
    },
  });

  return toPublicUser(user);
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
  });

  if (!user || !user.isActive || !user.passwordHash) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  return {
    user: toPublicUser(user),
    accessToken: createAccessToken(user),
  };
}

async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.isActive) {
    const error = new Error("User is not available");
    error.statusCode = 401;
    throw error;
  }

  return toPublicUser(user);
}

module.exports = {
  getCurrentUser,
  login,
  register,
};
