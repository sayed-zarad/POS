const express = require("express");
const authController = require("./auth.controller");
const authenticate = require("../middleware/authentication.middleware");
const authorize = require("../middleware/authorization.middleware");
const validate = require("../middleware/validation.middleware");
const {
  loginSchema,
  registerSchema,
} = require("../validations/auth.validation");

const router = express.Router();

router.post("/login", validate(loginSchema), authController.login);
router.post(
  "/register",
  authenticate,
  authorize("ADMIN"),
  validate(registerSchema),
  authController.register,
);
router.get("/me", authenticate, authController.me);

module.exports = router;
