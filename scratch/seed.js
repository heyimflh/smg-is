const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      username: 'hawari',
      name: 'Hawari',
      passwordHash: hash,
      role: 'admin',
      isActive: true
    }
  });
  console.log('Admin user "hawari" created!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
