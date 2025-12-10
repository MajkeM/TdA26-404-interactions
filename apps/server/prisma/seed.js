import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedCourses = [
  {
    title: "Intro to Web Apps",
    shortDescription: "Základní principy webových aplikací.",
    description: "Naučíte se MVC, REST a základy nasazení aplikací.",
  },
  {
    title: "Databases 101",
    shortDescription: "Modelování dat a SQL dotazy.",
    description: "Navrhneme ER diagramy a procvičíme SQL otázky.",
  },
  {
    title: "Node.js Mastery",
    shortDescription: "Backend vývoj v Node.js.",
    description: "Express, middleware, autentizace a testování API.",
  },
];

async function main() {
  await prisma.course.deleteMany();
  await prisma.course.createMany({ data: seedCourses });
  console.log("Seed: kurzy vytvořeny");
}

main()
  .catch((error) => {
    console.error("Seed selhal", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
