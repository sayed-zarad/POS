const express = require("express");
const categoryController = require("../controllers/category.controller");
const authenticate = require("../middleware/authentication.middleware");
const authorize = require("../middleware/authorization.middleware");
const validate = require("../middleware/validation.middleware");
const {
  categoryBodySchema,
  categoryIdParamsSchema,
  categoryQuerySchema,
} = require("../validations/category.validation");

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  validate(categoryQuerySchema, "query"),
  categoryController.listCategories,
);
router.get(
  "/:id",
  validate(categoryIdParamsSchema, "params"),
  categoryController.getCategory,
);
router.post(
  "/",
  authorize("ADMIN"),
  validate(categoryBodySchema),
  categoryController.createCategory,
);
router.put(
  "/:id",
  authorize("ADMIN"),
  validate(categoryIdParamsSchema, "params"),
  validate(categoryBodySchema),
  categoryController.updateCategory,
);
router.delete(
  "/:id",
  authorize("ADMIN"),
  validate(categoryIdParamsSchema, "params"),
  categoryController.deleteCategory,
);

module.exports = router;
