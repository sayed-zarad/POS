const { z } = require("zod");

const productIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const productQuerySchema = z
  .object({
    search: z.string().trim().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    isActive: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .default(true),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z
      .enum(["name", "price", "createdAt", "updatedAt"])
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict();

const productBodySchema = z
  .object({
    name: z.string().trim().min(2, "Name must contain at least 2 characters"),
    categoryId: z.coerce.number().int().positive(),
    price: z.coerce.number().finite().nonnegative(),
    image: z.string().url().nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

module.exports = {
  productBodySchema,
  productIdParamsSchema,
  productQuerySchema,
};
