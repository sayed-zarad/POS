const swaggerUi = require("swagger-ui-express");

const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "POS API",
    version: "1.0.0",
    description: "Point-of-sale backend API documentation.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
  ],
  tags: [
    {
      name: "Authentication",
      description: "User authentication and account endpoints",
    },
    {
      name: "Products",
      description: "Product catalog management endpoints",
    },
    {
      name: "Inventory",
      description: "Inventory quantity management endpoints",
    },
    {
      name: "Categories",
      description: "Product category management endpoints",
    },
    {
      name: "Sales",
      description: "Point-of-sale transactions and order management",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "System Admin" },
          email: {
            type: "string",
            format: "email",
            example: "admin@pos.local",
          },
          role: {
            type: "string",
            enum: ["ADMIN", "CASHIER"],
            example: "ADMIN",
          },
          isActive: { type: "boolean", example: true },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        additionalProperties: false,
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "admin@pos.local",
          },
          password: {
            type: "string",
            format: "password",
            example: "Admin123!",
          },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        additionalProperties: false,
        properties: {
          name: { type: "string", minLength: 2, example: "New Cashier" },
          email: {
            type: "string",
            format: "email",
            example: "cashier2@pos.local",
          },
          password: {
            type: "string",
            format: "password",
            minLength: 8,
            example: "Cashier123!",
          },
          role: {
            type: "string",
            enum: ["ADMIN", "CASHIER"],
            default: "CASHIER",
          },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              user: { $ref: "#/components/schemas/User" },
              accessToken: {
                type: "string",
                example: "eyJhbGciOiJIUzI1NiIs...",
              },
            },
          },
        },
      },
      UserResponse: {
        type: "object",
        properties: {
          data: { $ref: "#/components/schemas/User" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string", example: "Authentication required" },
        },
      },
      ValidationErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string", example: "Validation failed" },
          details: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string", example: "email" },
                message: {
                  type: "string",
                  example: "A valid email is required",
                },
              },
            },
          },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "بيبسي 330 مل" },
          categoryId: { type: "integer", example: 2 },
          price: { type: "number", format: "double", example: 12 },
          image: {
            type: "string",
            format: "uri",
            nullable: true,
            example: "https://placehold.co/600x400/png?text=Pepsi+330ml",
          },
          isActive: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          category: {
            type: "object",
            properties: {
              id: { type: "integer", example: 2 },
              name: { type: "string", example: "المشروبات" },
            },
          },
          inventory: {
            nullable: true,
            type: "object",
            properties: {
              quantity: { type: "number", format: "double", example: 100 },
            },
          },
        },
      },
      ProductRequest: {
        type: "object",
        required: ["name", "categoryId", "price"],
        additionalProperties: false,
        properties: {
          name: { type: "string", minLength: 2, example: "بيبسي 330 مل" },
          categoryId: { type: "integer", minimum: 1, example: 2 },
          price: { type: "number", minimum: 0, example: 12 },
          image: {
            type: "string",
            format: "uri",
            nullable: true,
            example: "https://placehold.co/600x400/png?text=Pepsi+330ml",
          },
          isActive: { type: "boolean", default: true, example: true },
        },
      },
      ProductResponse: {
        type: "object",
        properties: {
          data: { $ref: "#/components/schemas/Product" },
        },
      },
      ProductListResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Product" },
          },
          pagination: {
            type: "object",
            properties: {
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 20 },
              total: { type: "integer", example: 8 },
              totalPages: { type: "integer", example: 1 },
            },
          },
        },
      },
      Inventory: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          productId: { type: "integer", example: 12 },
          quantity: { type: "number", format: "double", example: 35 },
          product: { $ref: "#/components/schemas/Product" },
        },
      },
      InventoryResponse: {
        type: "object",
        properties: {
          data: { $ref: "#/components/schemas/Inventory" },
        },
      },
      InventoryListResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Inventory" },
          },
          pagination: {
            type: "object",
            properties: {
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 20 },
              total: { type: "integer", example: 11 },
              totalPages: { type: "integer", example: 1 },
            },
          },
        },
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "integer", example: 2 },
          name: { type: "string", example: "المشروبات" },
          isActive: { type: "boolean", example: true },
          productsCount: { type: "integer", example: 3 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CategoryRequest: {
        type: "object",
        required: ["name"],
        additionalProperties: false,
        properties: {
          name: { type: "string", minLength: 2, example: "المشروبات" },
          isActive: { type: "boolean", default: true, example: true },
        },
      },
      CategoryResponse: {
        type: "object",
        properties: { data: { $ref: "#/components/schemas/Category" } },
      },
      CategoryListResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Category" },
          },
          pagination: {
            type: "object",
            properties: {
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 20 },
              total: { type: "integer", example: 5 },
              totalPages: { type: "integer", example: 1 },
            },
          },
        },
      },
      SaleItem: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          productId: { type: "integer", example: 3 },
          quantity: { type: "number", example: 2 },
          unitPrice: { type: "number", format: "double", example: 12 },
          discountAmount: { type: "number", format: "double", example: 0 },
          taxAmount: { type: "number", format: "double", example: 0 },
          totalAmount: { type: "number", format: "double", example: 24 },
          product: {
            type: "object",
            properties: {
              id: { type: "integer", example: 3 },
              name: { type: "string", example: "بيبسي 330 مل" },
              image: {
                type: "string",
                format: "uri",
                nullable: true,
                example: "https://placehold.co/600x400/png?text=Pepsi",
              },
            },
          },
        },
      },
      Sale: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          userId: { type: "integer", example: 1 },
          subtotal: { type: "number", format: "double", example: 74 },
          discountAmount: { type: "number", format: "double", example: 0 },
          taxAmount: { type: "number", format: "double", example: 10.36 },
          totalAmount: { type: "number", format: "double", example: 84.36 },
          status: {
            type: "string",
            enum: ["PENDING", "COMPLETED", "CANCELLED", "REFUNDED"],
            example: "COMPLETED",
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          user: {
            type: "object",
            properties: {
              id: { type: "integer", example: 1 },
              name: { type: "string", example: "Main Cashier" },
              email: {
                type: "string",
                format: "email",
                example: "cashier@pos.local",
              },
            },
          },
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/SaleItem" },
          },
        },
      },
      CreateSaleRequest: {
        type: "object",
        required: ["items"],
        additionalProperties: false,
        properties: {
          items: {
            type: "array",
            minItems: 1,
            description:
              "List of products and quantities (no duplicate productIds)",
            items: {
              type: "object",
              required: ["productId", "quantity"],
              properties: {
                productId: { type: "integer", minimum: 1, example: 3 },
                quantity: { type: "number", minimum: 0.001, example: 2 },
              },
            },
          },
          discountAmount: {
            type: "number",
            minimum: 0,
            default: 0,
            example: 0,
            description: "Discount applied to the whole sale",
          },
          taxRate: {
            type: "number",
            minimum: 0,
            maximum: 1,
            default: 0.14,
            example: 0.14,
            description: "Tax rate as a decimal (0.14 = 14%)",
          },
        },
      },
      SaleResponse: {
        type: "object",
        properties: { data: { $ref: "#/components/schemas/Sale" } },
      },
      SaleListResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Sale" },
          },
          pagination: {
            type: "object",
            properties: {
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 20 },
              total: { type: "integer", example: 3 },
              totalPages: { type: "integer", example: 1 },
            },
          },
        },
      },
    },
  },
  paths: {
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Log in a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" },
              },
            },
          },
          400: {
            description: "Invalid request body",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationErrorResponse",
                },
              },
            },
          },
          401: {
            description: "Invalid email or password",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a user",
        description: "Requires an authenticated ADMIN user.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "User registered",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserResponse" },
              },
            },
          },
          400: {
            description: "Invalid request body",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationErrorResponse",
                },
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Admin permissions required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          409: {
            description: "Email is already registered",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get the current authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Current user",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserResponse" },
              },
            },
          },
          401: {
            description: "Missing or invalid token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "List products",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Search by product name",
          },
          {
            name: "categoryId",
            in: "query",
            schema: { type: "integer", minimum: 1 },
          },
          {
            name: "isActive",
            in: "query",
            schema: { type: "boolean", default: true },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              enum: ["name", "price", "createdAt", "updatedAt"],
              default: "createdAt",
            },
          },
          {
            name: "sortOrder",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
          },
        ],
        responses: {
          200: {
            description: "Products returned successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductListResponse" },
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Create a product",
        description: "Requires an authenticated ADMIN user.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Product created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductResponse" },
              },
            },
          },
          400: {
            description: "Invalid product data or category not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationErrorResponse",
                },
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Admin permissions required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/products/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer", minimum: 1 },
          example: 1,
        },
      ],
      get: {
        tags: ["Products"],
        summary: "Get a product by ID",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Product returned successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductResponse" },
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Product not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      put: {
        tags: ["Products"],
        summary: "Update a product",
        description: "Requires an authenticated ADMIN user.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Product updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductResponse" },
              },
            },
          },
          400: {
            description: "Invalid product data or category not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationErrorResponse",
                },
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Admin permissions required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Product not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Products"],
        summary: "Deactivate a product",
        description:
          "Soft-deletes the product by setting isActive to false. Requires an authenticated ADMIN user.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Product deactivated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductResponse" },
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Admin permissions required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Product not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/inventory": {
      get: {
        tags: ["Inventory"],
        summary: "List inventory",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          {
            name: "categoryId",
            in: "query",
            schema: { type: "integer", minimum: 1 },
          },
          { name: "lowStock", in: "query", schema: { type: "boolean" } },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
          {
            name: "sortOrder",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"], default: "asc" },
          },
        ],
        responses: {
          200: {
            description: "Inventory returned successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/InventoryListResponse" },
              },
            },
          },
          401: { description: "Authentication required" },
          403: { description: "Admin permissions required" },
        },
      },
    },
    "/api/inventory/{productId}": {
      get: {
        tags: ["Inventory"],
        summary: "Get inventory for a product",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "productId",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          200: {
            description: "Inventory returned successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/InventoryResponse" },
              },
            },
          },
          401: { description: "Authentication required" },
          403: { description: "Admin permissions required" },
          404: { description: "Inventory record not found" },
        },
      },
      post: {
        tags: ["Inventory"],
        summary: "Increase product inventory",
        description:
          "Adds the requested quantity to an existing product inventory. Requires an authenticated ADMIN user.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "productId",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
            example: 8,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["quantity"],
                additionalProperties: false,
                properties: {
                  quantity: {
                    type: "number",
                    minimum: 0,
                    exclusiveMinimum: true,
                    default: 1,
                    example: 1,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Inventory increased",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/InventoryResponse" },
              },
            },
          },
          400: {
            description: "Invalid quantity",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationErrorResponse",
                },
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Admin permissions required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Product not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      put: {
        tags: ["Inventory"],
        summary: "Set product inventory quantity",
        description: "Replaces the current quantity, useful for stocktaking.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "productId",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["quantity"],
                additionalProperties: false,
                properties: {
                  quantity: { type: "number", minimum: 0, example: 30 },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Inventory quantity updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/InventoryResponse" },
              },
            },
          },
          400: { description: "Invalid quantity" },
          401: { description: "Authentication required" },
          403: { description: "Admin permissions required" },
          404: { description: "Product not found" },
        },
      },
    },
    "/api/categories": {
      get: {
        tags: ["Categories"],
        summary: "List categories",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          {
            name: "isActive",
            in: "query",
            schema: { type: "boolean", default: true },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              enum: ["name", "createdAt", "updatedAt"],
              default: "name",
            },
          },
          {
            name: "sortOrder",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"], default: "asc" },
          },
        ],
        responses: {
          200: {
            description: "Categories returned",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CategoryListResponse" },
              },
            },
          },
          401: { description: "Authentication required" },
        },
      },
      post: {
        tags: ["Categories"],
        summary: "Create a category",
        description: "Requires an authenticated ADMIN user.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoryRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Category created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CategoryResponse" },
              },
            },
          },
          400: { description: "Invalid category data" },
          401: { description: "Authentication required" },
          403: { description: "Admin permissions required" },
          409: { description: "Category name already exists" },
        },
      },
    },
    "/api/categories/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer", minimum: 1 },
        },
      ],
      get: {
        tags: ["Categories"],
        summary: "Get a category",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Category returned",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CategoryResponse" },
              },
            },
          },
          401: { description: "Authentication required" },
          404: { description: "Category not found" },
        },
      },
      put: {
        tags: ["Categories"],
        summary: "Update a category",
        description: "Requires an authenticated ADMIN user.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoryRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Category updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CategoryResponse" },
              },
            },
          },
          400: { description: "Invalid category data" },
          401: { description: "Authentication required" },
          403: { description: "Admin permissions required" },
          404: { description: "Category not found" },
          409: { description: "Category name already exists" },
        },
      },
      delete: {
        tags: ["Categories"],
        summary: "Deactivate a category",
        description: "Soft-deletes the category by setting isActive to false.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Category deactivated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CategoryResponse" },
              },
            },
          },
          401: { description: "Authentication required" },
          403: { description: "Admin permissions required" },
          404: { description: "Category not found" },
        },
      },
    },
    "/api/sales": {
      post: {
        tags: ["Sales"],
        summary: "Create a sale",
        description:
          "Creates a completed sale. Validates stock availability for every item, deducts inventory atomically, and calculates subtotal, tax, and total. Available to CASHIER and ADMIN.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateSaleRequest" },
              example: {
                items: [
                  { productId: 1, quantity: 1 },
                  { productId: 3, quantity: 2 },
                ],
                discountAmount: 0,
                taxRate: 0.14,
              },
            },
          },
        },
        responses: {
          201: {
            description: "Sale created successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SaleResponse" },
              },
            },
          },
          400: {
            description:
              "Validation error, insufficient stock, inactive product, or product not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                examples: {
                  insufficientStock: {
                    summary: "Insufficient stock",
                    value: {
                      error:
                        'Insufficient stock for "بيبسي 330 مل". Available: 5, Requested: 10',
                    },
                  },
                  inactiveProduct: {
                    summary: "Inactive product",
                    value: { error: 'Product "كرواسون" is not available' },
                  },
                  validation: {
                    summary: "Validation failed",
                    value: {
                      error: "Validation failed",
                      details: [
                        {
                          field: "items",
                          message: "Sale must have at least one item",
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      get: {
        tags: ["Sales"],
        summary: "List sales",
        description: "Returns a paginated list of sales. Requires ADMIN.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["PENDING", "COMPLETED", "CANCELLED", "REFUNDED"],
            },
            description: "Filter by sale status",
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
          {
            name: "sortOrder",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
          },
        ],
        responses: {
          200: {
            description: "Sales returned successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SaleListResponse" },
              },
            },
          },
          401: { description: "Authentication required" },
          403: { description: "Admin permissions required" },
        },
      },
    },
    "/api/sales/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer", minimum: 1 },
          example: 1,
        },
      ],
      get: {
        tags: ["Sales"],
        summary: "Get a sale by ID",
        description:
          "Returns full sale details including items. Requires ADMIN.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Sale returned successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SaleResponse" },
              },
            },
          },
          401: { description: "Authentication required" },
          403: { description: "Admin permissions required" },
          404: {
            description: "Sale not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/sales/{id}/cancel": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer", minimum: 1 },
          example: 1,
        },
      ],
      patch: {
        tags: ["Sales"],
        summary: "Cancel a sale",
        description:
          "Cancels the sale and restores all item quantities back to inventory. Requires ADMIN.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Sale cancelled and inventory restored",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SaleResponse" },
              },
            },
          },
          400: {
            description: "Sale is already cancelled or refunded",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: { description: "Authentication required" },
          403: { description: "Admin permissions required" },
          404: {
            description: "Sale not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
};

function createModuleDocument({
  title,
  description,
  tagName,
  pathPrefix,
  schemaNames,
}) {
  const document = JSON.parse(JSON.stringify(swaggerDocument));

  document.info = {
    ...document.info,
    title,
    description,
  };
  document.tags = document.tags.filter((tag) => tag.name === tagName);
  document.paths = Object.fromEntries(
    Object.entries(document.paths).filter(([path]) =>
      path.startsWith(pathPrefix),
    ),
  );
  document.components.schemas = Object.fromEntries(
    Object.entries(document.components.schemas).filter(([name]) =>
      schemaNames.includes(name),
    ),
  );

  return document;
}

const authSwaggerDocument = createModuleDocument({
  title: "POS Auth API",
  description: "Authentication and user account API documentation.",
  tagName: "Authentication",
  pathPrefix: "/api/auth",
  schemaNames: [
    "User",
    "LoginRequest",
    "RegisterRequest",
    "LoginResponse",
    "UserResponse",
    "ErrorResponse",
    "ValidationErrorResponse",
  ],
});

const productSwaggerDocument = createModuleDocument({
  title: "POS Product API",
  description: "Product catalog management API documentation.",
  tagName: "Products",
  pathPrefix: "/api/products",
  schemaNames: [
    "Product",
    "ProductRequest",
    "ProductResponse",
    "ProductListResponse",
    "ErrorResponse",
    "ValidationErrorResponse",
  ],
});

const inventorySwaggerDocument = createModuleDocument({
  title: "POS Inventory API",
  description: "Inventory quantity management API documentation.",
  tagName: "Inventory",
  pathPrefix: "/api/inventory",
  schemaNames: [
    "Product",
    "Inventory",
    "InventoryResponse",
    "InventoryListResponse",
    "ErrorResponse",
    "ValidationErrorResponse",
  ],
});

const categorySwaggerDocument = createModuleDocument({
  title: "POS Categories API",
  description: "Product category management API documentation.",
  tagName: "Categories",
  pathPrefix: "/api/categories",
  schemaNames: [
    "Category",
    "CategoryRequest",
    "CategoryResponse",
    "CategoryListResponse",
    "ErrorResponse",
    "ValidationErrorResponse",
  ],
});

const salesSwaggerDocument = createModuleDocument({
  title: "POS Sales API",
  description:
    "Point-of-sale transactions and order management API documentation.",
  tagName: "Sales",
  pathPrefix: "/api/sales",
  schemaNames: [
    "SaleItem",
    "Sale",
    "CreateSaleRequest",
    "SaleResponse",
    "SaleListResponse",
    "ErrorResponse",
    "ValidationErrorResponse",
  ],
});

module.exports = {
  authSwaggerDocument,
  categorySwaggerDocument,
  inventorySwaggerDocument,
  productSwaggerDocument,
  salesSwaggerDocument,
  swaggerDocument,
  swaggerUi,
};
