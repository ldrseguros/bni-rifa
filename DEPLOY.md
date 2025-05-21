# Guia de Deploy - Sistema de Rifa Online BNI

Este guia fornece instruções detalhadas para fazer o deploy do sistema de rifa online, que consiste em um backend Node.js/Express com Prisma e um frontend React/TypeScript.

## Pré-requisitos

- Node.js (versão 16.x ou superior)
- PostgreSQL (para o banco de dados)
- Git
- Uma conta em uma plataforma de hospedagem (veja recomendações abaixo)

## Visão Geral da Arquitetura

O sistema é dividido em dois componentes principais:

1. **Backend**: API REST em Node.js com Express e Prisma ORM
2. **Frontend**: Aplicação React com TypeScript e Vite

## Deploy do Backend

### Passo 1: Preparação

Execute o script de preparação para verificar se tudo está pronto para o deploy:

```bash
cd backend
npm run prepare-deploy
```

Este script verifica:

- Migrações do Prisma
- Variáveis de ambiente
- Conexão com o banco de dados
- Dependências necessárias

### Passo 2: Configuração do Banco de Dados

Opções recomendadas para o banco de dados PostgreSQL:

- [ElephantSQL](https://www.elephantsql.com) (possui plano gratuito)
- [Neon](https://neon.tech) (possui plano gratuito)
- [Supabase](https://supabase.com) (possui plano gratuito)

Depois de criar seu banco de dados, obtenha a string de conexão e configure-a como variável de ambiente `DATABASE_URL`.

### Passo 3: Plataformas Recomendadas para o Backend

1. **Render** (https://render.com)

   - Crie uma conta e um novo serviço Web
   - Conecte ao repositório Git
   - Configure as variáveis de ambiente:
     - `DATABASE_URL`: sua string de conexão PostgreSQL
     - `JWT_SECRET`: uma string aleatória longa e segura
     - `PORT`: 10000 (ou o padrão da plataforma)
   - Comando de build: `npm install && npx prisma generate`
   - Comando de start: `npm start`

2. **Railway** (https://railway.app)
   - Crie um projeto e adicione um serviço PostgreSQL
   - Conecte ao repositório Git
   - Configure as variáveis de ambiente
   - A plataforma detectará automaticamente o Node.js

### Passo 4: Migrações e Inicialização

Após o deploy inicial:

```bash
# Execute as migrações para criar as tabelas no banco de dados
npx prisma migrate deploy

# Inicialize os números da rifa (se o banco estiver vazio)
node scripts/setup-numeros.js
```

Muitas plataformas permitem executar estes comandos através de sua interface ou configurar como passos de pós-deploy.

## Deploy do Frontend

### Passo 1: Preparação

Execute o script de preparação:

```bash
npm run prepare-deploy
```

### Passo 2: Configuração

Crie um arquivo `.env.production` na raiz do projeto:

```
VITE_API_URL=https://sua-api-backend.com
```

Substitua `https://sua-api-backend.com` pela URL real do seu backend em produção.

### Passo 3: Build do Projeto

```bash
npm run build
```

Isso criará uma pasta `dist` com os arquivos estáticos otimizados para produção.

### Passo 4: Plataformas Recomendadas para o Frontend

1. **Vercel** (https://vercel.com) - Recomendada

   - Crie uma conta e importe o repositório
   - Configure as variáveis de ambiente
   - Adicione um arquivo `vercel.json` na raiz:
     ```json
     {
       "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
     }
     ```

2. **Netlify** (https://netlify.com)

   - Crie uma conta e importe o repositório
   - Configure as variáveis de ambiente
   - Defina o comando de build: `npm run build`
   - Defina o diretório de publicação: `dist`
   - Adicione um arquivo `_redirects` na pasta `public`:
     ```
     /* /index.html 200
     ```

3. **GitHub Pages** (gratuito)
   - Habilite o GitHub Pages no seu repositório
   - Configure para usar a branch `gh-pages` ou a pasta `/docs`
   - Use um workflow GitHub Actions para o deploy automático

## Configuração de CORS

Certifique-se de que o backend esteja configurado para aceitar requisições do seu domínio frontend:

```javascript
// No arquivo backend/src/index.js
app.use(
  cors({
    origin: ["https://seu-site-frontend.com", "http://localhost:5173"],
  })
);
```

## Verificações Pós-Deploy

Após o deploy, verifique:

1. **Backend**:

   - Acesse a rota raiz (ex: `https://sua-api-backend.com/`) - deve mostrar uma mensagem de boas-vindas
   - Verifique se os números da rifa foram criados corretamente

2. **Frontend**:
   - Verifique se a página inicial carrega corretamente
   - Teste o login de administrador
   - Teste a reserva de números
   - Verifique se o painel administrativo está funcionando

## Solução de Problemas

### Problemas com CORS

- Verifique se a URL do frontend está corretamente configurada no backend
- Verifique se as requisições estão sendo enviadas para a URL correta

### Problemas com Prisma

- Execute `npx prisma migrate deploy` manualmente no servidor
- Verifique se a string de conexão DATABASE_URL está correta

### Problemas com Autenticação

- Verifique se JWT_SECRET está configurado corretamente
- Verifique se o token está sendo enviado corretamente nos headers

## Manutenção e Backup

- Configure backups regulares do banco de dados
- Monitore o uso de recursos e escale conforme necessário
- Considere implementar um sistema de logging (como Winston ou Pino)

## Contato e Suporte

Para mais informações sobre o deploy ou para relatar problemas, entre em contato com o desenvolvedor.
