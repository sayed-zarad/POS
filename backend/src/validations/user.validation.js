const { z } = require("zod");

const userIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const userQuerySchema = z
  .object({
    search: z.string().trim().optional(),
    role: z.enum(["ADMIN", "CASHIER"]).optional(),
    isActive: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.enum(["name", "email", "role", "createdAt", "updatedAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict();

const createUserSchema = z
  .object({
    name: z.string().trim().min(2, "Name must contain at least 2 characters"),
    email: z.string().trim().email("A valid email is required"),
    password: z.string().min(8, "Password must contain at least 8 characters"),
    role: z.enum(["ADMIN", "CASHIER"]).default("CASHIER"),
    isActive: z.boolean().optional().default(true),
  })
  .strict();

const updateUserSchema = z
  .object({
    name: z.string().trim().min(2, "Name must contain at least 2 characters").optional(),
    email: z.string().trim().email("A valid email is required").optional(),
    password: z.string().min(8, "Password must contain at least 8 characters").or(z.literal("")).optional(),
    role: z.enum(["ADMIN", "CASHIER"]).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

module.exports = {
  createUserSchema,
  updateUserSchema,
  userIdParamsSchema,
  userQuerySchema,
};
