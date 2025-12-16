/* eslint-disable @typescript-eslint/only-throw-error */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaClient, RiskLevel, Role } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

function expect200or201(res: any) {
  if (![200, 201].includes(res.status)) {
    // eslint-disable-next-line no-throw-literal
    throw `Expected 200 or 201, got ${res.status}. Body: ${JSON.stringify(res.body)}`;
  }
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL (test) não definido. Verifique o .env.test');
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

describe('SOS Bairro Backend (e2e)', () => {
  let app: INestApplication;

  let adminToken = '';
  let moderatorToken = '';
  let residentToken = '';

  let residentId = 0;
  let adminId = 0;
  let moderatorId = 0;

  let categoryId = 0;
  let occurrenceId = 0;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = mod.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();

    await prisma.occurrence.deleteMany();
    await prisma.occurrenceCategory.deleteMany();
    await prisma.user.deleteMany();

    const cat = await prisma.occurrenceCategory.create({
      data: { title: 'Assalto / Roubo', riskLevel: RiskLevel.ALTO },
    });
    categoryId = cat.id;

    const adminHash = await bcrypt.hash('Admin@123', 10);
    const modHash = await bcrypt.hash('Moderador@123', 10);
    const resHash = await bcrypt.hash('Morador@123', 10);

    const admin = await prisma.user.create({
      data: {
        name: 'Admin Master',
        email: 'admin@sosbairro.local',
        passwordHash: adminHash,
        role: Role.ADMIN,
      },
      select: { id: true },
    });
    adminId = admin.id;

    const moderator = await prisma.user.create({
      data: {
        name: 'Moderador',
        email: 'moderador@sosbairro.local',
        passwordHash: modHash,
        role: Role.MODERADOR,
      },
      select: { id: true },
    });
    moderatorId = moderator.id;

    const resident = await prisma.user.create({
      data: {
        name: 'Morador',
        email: 'morador@sosbairro.local',
        passwordHash: resHash,
        role: Role.MORADOR,
      },
      select: { id: true },
    });
    residentId = resident.id;

    {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@sosbairro.local', password: 'Admin@123' })
        .expect(expect200or201);

      adminToken = res.body.token;
      expect(res.body.user.role).toBe('ADMIN');
    }

    {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'moderador@sosbairro.local', password: 'Moderador@123' })
        .expect(expect200or201);

      moderatorToken = res.body.token;
      expect(res.body.user.role).toBe('MODERADOR');
    }

    {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'morador@sosbairro.local', password: 'Morador@123' })
        .expect(expect200or201);

      residentToken = res.body.token;
      expect(res.body.user.role).toBe('MORADOR');
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
    await app.close();
  });

  it('GET /users/my-profile (autenticado) retorna user', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/my-profile')
      .set('Authorization', `Bearer ${residentToken}`)
      .expect(200);

    expect(res.body.email).toBe('morador@sosbairro.local');
    expect(res.body.role).toBe('MORADOR');
  });

  it('GET /users (apenas ADMIN) - morador deve receber 403', async () => {
    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${residentToken}`)
      .expect(403);
  });

  it('GET /users (apenas ADMIN) - admin deve receber 200', async () => {
    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('PATCH /users/:id/role - não permitir promover para ADMIN', async () => {
    await request(app.getHttpServer())
      .patch(`/users/${residentId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'ADMIN' })
      .expect(400);
  });

  it('PATCH /users/:id/role - não permitir alterar role de ADMIN', async () => {
    await request(app.getHttpServer())
      .patch(`/users/${adminId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'MODERADOR' })
      .expect(400);
  });

  it('POST /occurrences (morador autenticado) cria ocorrência', async () => {
    const res = await request(app.getHttpServer())
      .post('/occurrences')
      .set('Authorization', `Bearer ${residentToken}`)
      .send({
        description: 'Roubo na avenida principal.',
        categoryId,
        locationLatitude: -27.4501,
        locationLongitude: -48.5123,
        imageUrl: 'https://mock.sos-bairro.local/oc1.jpg',
      })
      .expect(201);

    occurrenceId = res.body.id;
    expect(res.body.status).toBe('REGISTRADA');
    expect(res.body.category.id).toBe(categoryId);
  });

  it('GET /occurrences lista com paginação', async () => {
    const res = await request(app.getHttpServer())
      .get('/occurrences?page=1&pageSize=10')
      .set('Authorization', `Bearer ${residentToken}`)
      .expect(200);

    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.meta.page).toBe(1);
  });

  it('GET /occurrences/:id detalhe', async () => {
    const res = await request(app.getHttpServer())
      .get(`/occurrences/${occurrenceId}`)
      .set('Authorization', `Bearer ${residentToken}`)
      .expect(200);

    expect(res.body.id).toBe(occurrenceId);
    expect(res.body.category).toBeTruthy();
    expect(res.body.resident).toBeTruthy();
  });

  it('PATCH /occurrences/:id/status - morador deve receber 403', async () => {
    await request(app.getHttpServer())
      .patch(`/occurrences/${occurrenceId}/status`)
      .set('Authorization', `Bearer ${residentToken}`)
      .send({ status: 'EM_ANALISE' })
      .expect(403);
  });

  it('PATCH /occurrences/:id/status - moderador consegue', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/occurrences/${occurrenceId}/status`)
      .set('Authorization', `Bearer ${moderatorToken}`)
      .send({ status: 'EM_ANALISE' })
      .expect(200);

    expect(res.body.status).toBe('EM_ANALISE');
  });

  it('PATCH /occurrences/:id/assign - moderador consegue atribuir', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/occurrences/${occurrenceId}/assign`)
      .set('Authorization', `Bearer ${moderatorToken}`)
      .send({ moderatorId })
      .expect(200);

    expect(res.body.moderator).toBeTruthy();
  });
});
