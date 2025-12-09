import 'dotenv/config';
import { PrismaClient, RiskLevel } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Limpando tabela de categorias...');
  await prisma.occurrenceCategory.deleteMany();

  console.log('🌱 Iniciando seed das categorias de ocorrência...');

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
}

main()
  .catch((error) => {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
