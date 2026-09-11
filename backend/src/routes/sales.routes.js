const express = require("express");
const salesController = require("../controllers/sales.controller");
const authenticate = require("../middleware/authentication.middleware");
const authorize = require("../middleware/authorization.middleware");
const validate = require("../middleware/validation.middleware");
const {
  createSaleBodySchema,
  saleIdParamsSchema,
  saleQuerySchema,
} = require("../validations/sales.validation");

const router = express.Router();

router.use(authenticate);

// كل المستخدمين (CASHIER + ADMIN) يقدروا يعملوا sale ويشوفوا الـ list
router.post("/", validate(createSaleBodySchema), salesController.createSale);

router.get(
  "/",
  authorize("ADMIN"),
  validate(saleQuerySchema, "query"),
  salesController.listSales,
);

router.get(
  "/:id",
  authorize("ADMIN"),
  validate(saleIdParamsSchema, "params"),
  salesController.getSale,
);

// إلغاء sale — ADMIN فقط
router.patch(
  "/:id/cancel",
  authorize("ADMIN"),
  validate(saleIdParamsSchema, "params"),
  salesController.cancelSale,
);

module.exports = router;
