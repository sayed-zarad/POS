const { z } = require("zod");

const loginSchema = z
  .object({
    email: z.string().trim().email("A valid email is required"),
    password: z.string().min(1, "Password is required"),
  })
  .strict();

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must contain at least 2 characters"),
    email: z.string().trim().email("A valid email is required"),
    password: z.string().min(8, "Password must contain at least 8 characters"),
    role: z.enum(["ADMIN", "CASHIER"]).default("CASHIER"),
  })
  .strict();

module.exports = {
  loginSchema,
  registerSchema,
};
