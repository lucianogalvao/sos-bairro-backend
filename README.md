# 🆘 SOS Bairro – Backend

API REST desenvolvida em **NestJS** para o projeto **SOS Bairro**, parte do Trabalho de Conclusão de Curso (TCC) da Pós-Graduação em **Desenvolvimento Full Stack – PUC-RS**.

O backend é responsável pela autenticação de usuários, gestão de ocorrências, moderação, relatórios e controle de acesso por papéis (roles), operando em um ambiente controlado com dados fictícios.

---

## 🚀 Tecnologias

- Node.js
- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT (Autenticação)
- Swagger (OpenAPI)
- Jest (Testes E2E)

---

## 🧱 Arquitetura

A aplicação segue uma arquitetura modular baseada nas boas práticas do NestJS:

- Separação por domínio (modules)
- Controllers → Services → DTOs
- Validação de dados com `class-validator`
- Prisma como camada de acesso ao banco de dados
- Migrations versionadas
- Controle de acesso baseado em papéis (roles)

### Papéis de Usuário

- **MORADOR**: cria e visualiza ocorrências
- **MODERADOR**: altera status e assume ocorrências
- **ADMIN**: gerencia usuários

---

## 🔐 Autenticação

A autenticação é feita via **JWT**.

Após o login, o token deve ser enviado no header das requisições:

```
Authorization: Bearer <token>
```

Rotas protegidas utilizam guards e validação de roles.

---

## 🚨 Funcionalidades

### Usuários

- Cadastro e login
- Consulta de perfil (`my-profile`)
- Listagem de usuários (ADMIN)
- Promoção e rebaixamento de papéis com regras de segurança

### Ocorrências

- Criação de ocorrência
- Listagem com:
  - Paginação
  - Filtros por status, categoria e data
  - Ordenação ascendente/descendente
- Detalhe da ocorrência
- Alteração de status (MODERADOR)
- Atribuição de moderador

### Relatórios

- Visão geral com:
  - Total de ocorrências
  - Distribuição por status
  - Distribuição por nível de risco

---

## 📊 Documentação da API (Swagger)

A documentação da API é gerada automaticamente.

Após iniciar o projeto, acesse:

```
http://localhost:3000/docs
```

No Swagger é possível testar os endpoints e informar o token JWT através do botão **Authorize**.

---

## 🧪 Testes Automatizados

O projeto possui testes **E2E** cobrindo os principais fluxos:

- Autenticação
- Controle de acesso por papéis
- Criação e listagem de ocorrências
- Moderação e atribuição
- Paginação e filtros

Os testes utilizam banco de dados isolado para não afetar o ambiente de desenvolvimento.

---

## ▶️ Executando o Projeto

### Instalação

```
npm install
```

### Variáveis de ambiente

Crie um arquivo `.env`:

```
DATABASE_URL=postgresql://usuario:senha@localhost:5432/sos_bairro
JWT_SECRET_KEY=chave_secreta
PORT=3000
```

### Migrations

```
npx prisma migrate dev
```

### Seed (dados fictícios)

```
npx prisma db seed
```

### Executar em desenvolvimento

```
npm run start:dev
```

---

## 📌 Observações

- Projeto desenvolvido para fins acadêmicos
- Dados fictícios (mockados)
- Ambiente controlado
- Não representa um sistema real de segurança pública
