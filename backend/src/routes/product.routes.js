const express = require("express");
const productController = require("../controllers/product.controller");
const authenticate = require("../middleware/authentication.middleware");
const authorize = require("../middleware/authorization.middleware");
const validate = require("../middleware/validation.middleware");
const {
  productBodySchema,
  productIdParamsSchema,
  productQuerySchema,
} = require("../validations/product.validation");

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  validate(productQuerySchema, "query"),
  productController.listProducts,
);
router.get(
  "/:id",
  validate(productIdParamsSchema, "params"),
  productController.getProduct,
);
router.post(
  "/",
  authorize("ADMIN"),
  validate(productBodySchema),
  productController.createProduct,
);
router.put(
  "/:id",
  authorize("ADMIN"),
  validate(productIdParamsSchema, "params"),
  validate(productBodySchema),
  productController.updateProduct,
);
router.delete(
  "/:id",
  authorize("ADMIN"),
  validate(productIdParamsSchema, "params"),
  productController.deleteProduct,
);

module.exports = router;
