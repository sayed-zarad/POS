require("dotenv/config");

const express = require("express");
const cors = require("cors");
const authRoutes = require("./auth/auth.routes");
const productRoutes = require("./routes/product.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const categoryRoutes = require("./routes/category.routes");
const salesRoutes = require("./routes/sales.routes");
const userRoutes = require("./routes/user.routes");

const {
  authSwaggerDocument,
  inventorySwaggerDocument,
  categorySwaggerDocument,
  productSwaggerDocument,
  salesSwaggerDocument,
  swaggerDocument,
  swaggerUi,
} = require("./config/swagger");

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(
  "/api-docs/auth",
  swaggerUi.serveFiles(authSwaggerDocument),
  swaggerUi.setup(authSwaggerDocument),
);
app.get("/swagger/auth.json", (req, res) => res.json(authSwaggerDocument));
app.use(
  "/api-docs/products",
  swaggerUi.serveFiles(productSwaggerDocument),
  swaggerUi.setup(productSwaggerDocument),
);
app.get("/swagger/products.json", (req, res) =>
  res.json(productSwaggerDocument),
);
app.use(
  "/api-docs/inventory",
  swaggerUi.serveFiles(inventorySwaggerDocument),
  swaggerUi.setup(inventorySwaggerDocument),
);
app.get("/swagger/inventory.json", (req, res) =>
  res.json(inventorySwaggerDocument),
);
app.use(
  "/api-docs/categories",
  swaggerUi.serveFiles(categorySwaggerDocument),
  swaggerUi.setup(categorySwaggerDocument),
);
app.get("/swagger/categories.json", (req, res) =>
  res.json(categorySwaggerDocument),
);
app.use(
  "/api-docs/sales",
  swaggerUi.serveFiles(salesSwaggerDocument),
  swaggerUi.setup(salesSwaggerDocument),
);
app.get("/swagger/sales.json", (req, res) => res.json(salesSwaggerDocument));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/swagger.json", (req, res) => res.json(swaggerDocument));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/users", userRoutes);

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error" : error.message;

  if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({ error: message });
});

module.exports = app;
