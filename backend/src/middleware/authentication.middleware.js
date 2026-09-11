const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return process.env.JWT_SECRET;
}

async function authenticate(req, res, next) {
  try {
    const authorization = req.get("authorization");
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const token = authorization.slice("Bearer ".length).trim();
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const payload = jwt.verify(token, getJwtSecret());
    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({ error: "Invalid authentication token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "User is not available" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res
        .status(401)
        .json({ error: "Invalid or expired authentication token" });
    }

    next(error);
  }
}

module.exports = authenticate;
