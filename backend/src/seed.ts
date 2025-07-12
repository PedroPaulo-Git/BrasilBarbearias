import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.plan.upsert({
    where: { id: 'basic' },
    update: {},
    create: {
      id: 'basic',
      name: 'Básico',
      price: 19.90,
      shopLimit: 1,
    },
  });

  await prisma.plan.upsert({
    where: { id: 'intermediate' },
    update: {},
    create: {
      id: 'intermediate',
      name: 'Intermediário',
      price: 49.90,
      shopLimit: 2,
    },
  });

  await prisma.plan.upsert({
    where: { id: 'advanced' },
    update: {},
    create: {
      id: 'advanced',
      name: 'Avançado',
      price: 79.90,
      shopLimit: 5,
    },
  });

  console.log('Planos seedados com IDs fixos!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 