import 'dotenv/config';
import {
  PrismaClient,
  OccurrenceStatus,
  RiskLevel,
  Role,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Limpando tabela de ocorrências...');
  await prisma.occurrence.deleteMany();

  console.log('🌱 Limpando tabela de categorias...');
  await prisma.occurrenceCategory.deleteMany();

  console.log('🌱 Limpando tabela de usuários...');
  await prisma.user.deleteMany();

  console.log('👥 Criando usuários (10) ...');

  const defaultPassword = 'sos@1234';
  const defaultHash = await bcrypt.hash(defaultPassword, 10);

  const usersToSeed: Array<{ name: string; email: string; role: Role }> = [
    { name: 'Admin Master', email: 'admin@sosbairro.com', role: Role.ADMIN },
    {
      name: 'Carlos Moderador',
      email: 'carlos@sosbairro.com',
      role: Role.MODERADOR,
    },
    {
      name: 'Ana Moderadora',
      email: 'ana@sosbairro.com',
      role: Role.MODERADOR,
    },

    { name: 'João Silva', email: 'joao@sosbairro.com', role: Role.MORADOR },
    { name: 'Maria Souza', email: 'maria@sosbairro.com', role: Role.MORADOR },
    { name: 'Pedro Lima', email: 'pedro@sosbairro.com', role: Role.MORADOR },
    { name: 'Lucas Rocha', email: 'lucas@sosbairro.com', role: Role.MORADOR },
    {
      name: 'Fernanda Alves',
      email: 'fernanda@sosbairro.com',
      role: Role.MORADOR,
    },
    { name: 'Bruno Costa', email: 'bruno@sosbairro.com', role: Role.MORADOR },
    {
      name: 'Juliana Mendes',
      email: 'juliana@sosbairro.com',
      role: Role.MORADOR,
    },
  ];

  for (const u of usersToSeed) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        passwordHash: defaultHash,
      },
      create: {
        name: u.name,
        email: u.email,
        role: u.role,
        passwordHash: defaultHash,
      },
    });
  }

  console.log('✅ Usuários criados');

  const categories: { title: string; riskLevel: RiskLevel }[] = [
    // 1. Segurança Pública
    { title: 'Assalto / Roubo', riskLevel: 'ALTO' },
    { title: 'Furto', riskLevel: 'MEDIO' },
    { title: 'Arrombamento de residência', riskLevel: 'ALTO' },
    { title: 'Arrombamento de veículo', riskLevel: 'MEDIO' },
    { title: 'Pessoa suspeita', riskLevel: 'MEDIO' },
    { title: 'Veículo suspeito', riskLevel: 'MEDIO' },
    { title: 'Tentativa de invasão', riskLevel: 'ALTO' },
    { title: 'Agressão física', riskLevel: 'ALTO' },
    { title: 'Violência doméstica (mock)', riskLevel: 'ALTO' },
    { title: 'Tráfico de drogas (simulado)', riskLevel: 'ALTO' },
    { title: 'Disparos de arma de fogo (suspeita)', riskLevel: 'ALTO' },

    // 2. Distúrbios e Convivência
    { title: 'Som alto / Perturbação do sossego', riskLevel: 'BAIXO' },
    { title: 'Briga verbal', riskLevel: 'MEDIO' },
    { title: 'Evento irregular na via pública', riskLevel: 'MEDIO' },
    {
      title: 'Comportamento inadequado em praça ou comércio',
      riskLevel: 'BAIXO',
    },

    // 3. Infraestrutura e Iluminação
    {
      title: 'Rua sem iluminação / lâmpada queimada',
      riskLevel: 'MEDIO',
    },
    { title: 'Falha elétrica em poste', riskLevel: 'MEDIO' },
    { title: 'Sinalização danificada', riskLevel: 'BAIXO' },
    { title: 'Buraco na via', riskLevel: 'BAIXO' },
    { title: 'Calçada danificada', riskLevel: 'BAIXO' },
    { title: 'Semáforo com defeito', riskLevel: 'MEDIO' },

    // 4. Meio Ambiente e Clima
    { title: 'Alagamento', riskLevel: 'ALTO' },
    { title: 'Deslizamento', riskLevel: 'ALTO' },
    { title: 'Queda de árvore', riskLevel: 'MEDIO' },
    {
      title: 'Risco estrutural em imóvel abandonado',
      riskLevel: 'ALTO',
    },

    // 5. Ocorrências com Animais
    { title: 'Animal agressivo solto', riskLevel: 'ALTO' },
    { title: 'Animal ferido na via', riskLevel: 'MEDIO' },
    { title: 'Animal peçonhento encontrado', riskLevel: 'ALTO' },
    { title: 'Animal silvestre fora do habitat', riskLevel: 'MEDIO' },

    // 6. Trânsito
    { title: 'Acidente de trânsito', riskLevel: 'ALTO' },
    { title: 'Veículo abandonado', riskLevel: 'MEDIO' },
    { title: 'Obstrução da via', riskLevel: 'MEDIO' },
    { title: 'Estacionamento irregular crítico', riskLevel: 'MEDIO' },
  ];

  await prisma.occurrenceCategory.createMany({
    data: categories,
  });

  console.log('✅ Seed das categorias concluído.');

  const [allCategories, residents, moderators] = await Promise.all([
    prisma.occurrenceCategory.findMany({
      select: { id: true, title: true, riskLevel: true },
      orderBy: { id: 'asc' },
    }),
    prisma.user.findMany({
      where: { role: Role.MORADOR },
      select: { id: true },
    }),
    prisma.user.findMany({
      where: { role: Role.MODERADOR },
      select: { id: true },
    }),
  ]);

  if (allCategories.length === 0) {
    throw new Error('Nenhuma categoria encontrada após o seed.');
  }

  if (residents.length === 0) {
    throw new Error('Nenhum morador encontrado após o seed.');
  }

  if (moderators.length === 0) {
    throw new Error('Nenhum moderador encontrado após o seed.');
  }

  console.log('🚨 Criando ocorrências (30) ...');

  const descriptions = [
    'Relato recebido por moradores: situação observada e registrada no sistema.',
    'Ocorrência reportada com localização aproximada; recomenda-se atenção no entorno.',
    'Registro de evento no bairro; aguardando verificação e atualização de status.',
    'Moradores informaram movimentação incomum; ocorrência cadastrada para análise.',
    'Situação identificada em via pública; equipe de moderação acompanhará o caso.',
    'Registro preventivo para manter histórico e apoiar tomada de decisão.',
    'Ocorrência com evidências (mock) anexadas; verificar detalhes na tela de mapa.',
    'Evento relatado em horário noturno; monitoramento recomendado.',
    'Registro feito para fins de acompanhamento comunitário e estatística do bairro.',
    'Ocorrência comunicada; aguardando validação e eventual resolução.',
  ];

  // distribuição estável: 12 registradas, 10 em análise, 8 resolvidas
  const statusByIndex: OccurrenceStatus[] = [
    ...Array.from({ length: 12 }, () => OccurrenceStatus.REGISTRADA),
    ...Array.from({ length: 10 }, () => OccurrenceStatus.EM_ANALISE),
    ...Array.from({ length: 8 }, () => OccurrenceStatus.RESOLVIDA),
  ];

  const occurrencesData = Array.from({ length: 30 }).map((_, i) => {
    const status = statusByIndex[i] ?? OccurrenceStatus.REGISTRADA;

    // escolhe categoria e morador de forma determinística (sem depender do Math.random)
    const category = allCategories[i % allCategories.length];
    const resident = residents[i % residents.length];

    // moderador apenas quando não está REGISTRADA
    const moderatorId =
      status === OccurrenceStatus.REGISTRADA
        ? null
        : moderators[i % moderators.length].id;

    // espalha datas nos últimos 30 dias
    const daysAgo = 29 - (i % 30);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    // coordenadas próximas (mock) do bairro
    const locationLatitude = -27.45 + ((i % 10) * 0.001 + 0.0003);
    const locationLongitude = -48.51 + ((i % 10) * 0.001 + 0.0007);

    const description = `${category.title}: ${descriptions[i % descriptions.length]}`;

    return {
      description,
      status,
      categoryId: category.id,
      residentId: resident.id,
      moderatorId,
      locationLatitude,
      locationLongitude,
      imageUrl: `https://mock.sos-bairro.local/ocorrencias/oc-${i + 1}.jpg`,
      createdAt,
    };
  });

  await prisma.occurrence.createMany({ data: occurrencesData });

  console.log('✅ Seed das ocorrências concluído.');
}

main()
  .catch((error) => {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
