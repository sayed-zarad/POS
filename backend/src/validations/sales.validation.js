const { z } = require("zod");

const saleItemSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
});

const createSaleBodySchema = z
  .object({
    items: z
      .array(saleItemSchema)
      .min(1, "Sale must have at least one item")
      .refine(
        (items) => {
          const ids = items.map((i) => i.productId);
          return new Set(ids).size === ids.length;
        },
        { message: "Duplicate products are not allowed in the same sale" },
      ),
    discountAmount: z.coerce.number().nonnegative().default(0),
    taxRate: z.coerce.number().min(0).max(1).default(0.14),
  })
  .strict();

const saleIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const saleQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    status: z
      .enum(["PENDING", "COMPLETED", "CANCELLED", "REFUNDED"])
      .optional(),
  })
  .strict();

module.exports = {
  createSaleBodySchema,
  saleIdParamsSchema,
  saleQuerySchema,
};
