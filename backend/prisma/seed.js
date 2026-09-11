require("dotenv/config");

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const categories = [
  { name: "الوجبات السريعة" },
  { name: "المشروبات" },
  { name: "الشيبسي" },
  { name: "الحلويات" },
  { name: "المستلزمات المنزلية" },
];

const products = [
  {
    name: "برجر كلاسيك",
    categoryName: "الوجبات السريعة",
    price: 45,
    quantity: 50,
    image: "https://placehold.co/600x400/png?text=Classic+Burger",
  },
  {
    name: "كرواسون",
    categoryName: "الوجبات السريعة",
    price: 18,
    quantity: 35,
    image: "https://placehold.co/600x400/png?text=Croissant",
  },
  {
    name: "بيبسي 330 مل",
    categoryName: "المشروبات",
    price: 12,
    quantity: 100,
    image: "https://placehold.co/600x400/png?text=Pepsi+330ml",
  },
  {
    name: "مياه معدنية 600 مل",
    categoryName: "المشروبات",
    price: 5,
    quantity: 150,
    image: "https://placehold.co/600x400/png?text=Mineral+Water",
  },
  {
    name: "شيبسي بطاطس",
    categoryName: "الشيبسي",
    price: 10,
    quantity: 80,
    image: "https://placehold.co/600x400/png?text=Potato+Chips",
  },
  {
    name: "شوكولاتة",
    categoryName: "الحلويات",
    price: 15,
    quantity: 60,
    image: "https://placehold.co/600x400/png?text=Chocolate",
  },
  {
    name: "عصير مانجو 250 مل",
    categoryName: "المشروبات",
    price: 8,
    quantity: 75,
    image: "https://placehold.co/600x400/png?text=Mango+Juice",
  },
  {
    name: "منظف متعدد الاستخدامات",
    categoryName: "المستلزمات المنزلية",
    price: 35,
    quantity: 25,
    image: "https://placehold.co/600x400/png?text=Multi-Purpose+Cleaner",
  },
];

const users = [
  {
    name: "System Admin",
    email: "admin@pos.local",
    role: "ADMIN",
    password: "Admin123!",
  },
  {
    name: "Main Cashier",
    email: "cashier@pos.local",
    role: "CASHIER",
    password: "Cashier123!",
  },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: { isActive: true },
      create: category,
    });
  }

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 12);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        passwordHash,
        isActive: true,
      },
      create: {
        name: user.name,
        email: user.email,
        role: user.role,
        passwordHash,
      },
    });
  }

  for (const product of products) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { name: product.categoryName },
      select: { id: true },
    });

    const existingProduct = await prisma.product.findFirst({
      where: { name: product.name, categoryId: category.id },
      select: { id: true },
    });

    const productData = {
      name: product.name,
      categoryId: category.id,
      price: product.price,
      image: product.image,
      isActive: true,
    };

    if (existingProduct) {
      await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          ...productData,
          inventory: {
            upsert: {
              create: { quantity: product.quantity },
              update: { quantity: product.quantity },
            },
          },
        },
      });
    } else {
      await prisma.product.create({
        data: {
          ...productData,
          inventory: {
            create: { quantity: product.quantity },
          },
        },
      });
    }
  }

  console.log("Seed completed successfully.");
  console.log(`Created or updated ${categories.length} categories.`);
  console.log(`Created or updated ${products.length} products.`);
  console.log(`Created or updated ${users.length} users.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
