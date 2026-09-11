const { z } = require("zod");

const categoryIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const categoryQuerySchema = z
  .object({
    search: z.string().trim().optional(),
    isActive: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .default(true),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("name"),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  })
  .strict();

const categoryBodySchema = z
  .object({
    name: z.string().trim().min(2, "Name must contain at least 2 characters"),
    isActive: z.boolean().optional(),
  })
  .strict();

module.exports = {
  categoryBodySchema,
  categoryIdParamsSchema,
  categoryQuerySchema,
};
