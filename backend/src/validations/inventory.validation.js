const { z } = require("zod");

const inventoryProductParamsSchema = z.object({
  productId: z.coerce.number().int().positive(),
});

const inventoryBodySchema = z
  .object({
    quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  })
  .strict();

const inventorySetBodySchema = z
  .object({
    quantity: z.coerce.number().nonnegative("Quantity cannot be negative"),
  })
  .strict();

const inventoryQuerySchema = z
  .object({
    search: z.string().trim().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    lowStock: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  })
  .strict();

module.exports = {
  inventoryBodySchema,
  inventoryProductParamsSchema,
  inventoryQuerySchema,
  inventorySetBodySchema,
};
