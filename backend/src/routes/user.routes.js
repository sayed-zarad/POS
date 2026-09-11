const express = require("express");
const userController = require("../controllers/user.controller");
const authenticate = require("../middleware/authentication.middleware");
const authorize = require("../middleware/authorization.middleware");
const validate = require("../middleware/validation.middleware");
const {
  createUserSchema,
  updateUserSchema,
  userIdParamsSchema,
  userQuerySchema,
} = require("../validations/user.validation");

const router = express.Router();

router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/", validate(userQuerySchema, "query"), userController.listUsers);
router.get("/:id", validate(userIdParamsSchema, "params"), userController.getUser);
router.post("/", validate(createUserSchema), userController.createUser);
router.put(
  "/:id",
  validate(userIdParamsSchema, "params"),
  validate(updateUserSchema),
  userController.updateUser
);
router.delete(
  "/:id",
  validate(userIdParamsSchema, "params"),
  userController.deleteUser
);

module.exports = router;
