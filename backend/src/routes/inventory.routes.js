const express = require("express");
const inventoryController = require("../controllers/inventory.controller");
const authenticate = require("../middleware/authentication.middleware");
const authorize = require("../middleware/authorization.middleware");
const validate = require("../middleware/validation.middleware");
const {
  inventoryBodySchema,
  inventoryProductParamsSchema,
  inventoryQuerySchema,
  inventorySetBodySchema,
} = require("../validations/inventory.validation");

const router = express.Router();

router.use(authenticate, authorize("ADMIN"));

router.get(
  "/",
  validate(inventoryQuerySchema, "query"),
  inventoryController.listInventory,
);

router.post(
  "/:productId",
  validate(inventoryProductParamsSchema, "params"),
  validate(inventoryBodySchema),
  inventoryController.increaseProductQuantity,
);

router.get(
  "/:productId",
  validate(inventoryProductParamsSchema, "params"),
  inventoryController.getInventory,
);

router.put(
  "/:productId",
  validate(inventoryProductParamsSchema, "params"),
  validate(inventorySetBodySchema),
  inventoryController.setProductQuantity,
);

module.exports = router;
