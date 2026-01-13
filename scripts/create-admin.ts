import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
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
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
