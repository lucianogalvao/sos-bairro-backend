import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  const prisma = new PrismaService();
  await prisma.$connect();

  try {
    const email = process.env.ADMIN_EMAIL ?? 'admin@sosbairro.com';
    const name = process.env.ADMIN_NAME ?? 'Admin Master';
    const password = process.env.ADMIN_PASSWORD ?? 'sos@1234';

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: { name, role: Role.ADMIN, passwordHash },
      create: { name, email, role: Role.ADMIN, passwordHash },
      select: { id: true, name: true, email: true, role: true },
    });

    console.log('✅ Admin criado/atualizado:', user);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('❌ Erro:', e);
  process.exit(1);
});
