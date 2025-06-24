# BarbeariaApp - Sistema de Agendamento para Barbearias

Um SaaS MVP completo para barbearias gerenciarem agendamentos online. Desenvolvido com Next.js, TypeScript, Prisma, PostgreSQL e NextAuth.

## 🚀 Funcionalidades

### Para Donos de Barbearia
- ✅ Cadastro e login de proprietários
- ✅ Dashboard para gerenciar barbearias
- ✅ Criação de barbearias com configuração de horários
- ✅ Visualização de agendamentos
- ✅ Páginas públicas personalizadas para cada barbearia

### Para Clientes
- ✅ Listagem pública de barbearias
- ✅ Busca por nome de barbearia
- ✅ Agendamento online com seleção de data e horário
- ✅ Validação de disponibilidade em tempo real
- ✅ Confirmação de agendamento

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Autenticação**: NextAuth.js (Credentials Provider)
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Deploy**: Vercel (recomendado)

## 📋 Pré-requisitos

- Node.js 18+ 
- Conta no Supabase (gratuita)
- npm ou yarn

## 🚀 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd projetobarbearia
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Supabase

#### 3.1. Crie um projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Faça login e crie um novo projeto
3. Anote o **Project Reference** e a **Database Password**

#### 3.2. Configure as variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
# Database - Supabase
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJECT-REF].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Email (opcional - para futuras implementações)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""
```

**Substitua:**
- `[SUA-SENHA]` pela senha do banco do Supabase
- `[SEU-PROJECT-REF]` pelo Project Reference do seu projeto
- `sua-chave-secreta-aqui` por uma string aleatória (pode usar `openssl rand -base64 32`)

### 4. Configure o banco de dados

#### 4.1. Execute as migrações
```bash
# Gera o cliente Prisma
npx prisma generate

# Executa as migrações no Supabase
npx prisma migrate dev --name init
```

#### 4.2. Verifique se tudo está funcionando
```bash
# Abra o Prisma Studio para verificar as tabelas
npx prisma studio
```

### 5. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) para ver a aplicação.

## 📱 Como Usar

### 1. Cadastro de Proprietário
1. Acesse `/auth/signup`
2. Crie uma conta com email e senha
3. Faça login em `/auth/signin`

### 2. Criar Barbearia
1. Acesse o dashboard em `/dashboard`
2. Clique em "Nova Barbearia"
3. Preencha os dados:
   - Nome da barbearia
   - Endereço (opcional)
   - Horário de funcionamento
   - Duração do serviço

### 3. Agendamentos de Clientes
1. Acesse `/shops` para ver todas as barbearias
2. Clique em uma barbearia para acessar sua página
3. Preencha o formulário de agendamento:
   - Nome do cliente
   - Contato (email ou telefone)
   - Data e horário desejado

## 🏗️ Estrutura do Projeto (Monorepo)

```
/
├── backend/                # API Node.js/Express para pagamentos e lógica de negócios
│   ├── src/
│   │   ├── controllers/    # Controladores (lógica das rotas)
│   │   ├── services/       # Serviços (ex: MercadoPagoService)
│   │   └── routes/         # Definição das rotas da API
│   └── package.json
│
├── prisma/                 # Configuração do Prisma ORM
│   ├── migrations/         # Histórico de migrações do banco
│   └── schema.prisma       # Schema do banco de dados (fonte da verdade)
│
├── public/                 # Arquivos estáticos (imagens, etc.)
│
├── src/                    # Código-fonte do Frontend (Next.js)
│   ├── app/                # App Router
│   │   ├── api/            # API Routes do Next.js (auth, webhooks, etc.)
│   │   ├── auth/           # Páginas de autenticação
│   │   ├── dashboard/      # Dashboard do usuário logado
│   │   ├── plans/          # Página de planos e checkout
│   │   ├── profile/        # Perfil do usuário para gerenciar assinatura
│   │   └── shops/          # Páginas públicas das barbearias
│   ├── components/         # Componentes React reutilizáveis
│   │   └── ui/             # Componentes base do shadcn/ui
│   ├── lib/                # Funções utilitárias (authOptions, prisma client)
│   └── types/              # Definições de tipos globais
│
├── package.json            # Dependências do Frontend
└── README.md               # O arquivo que você está lendo
```

## 🔧 Configuração para Produção

### 1. Deploy no Vercel
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente:
   - `DATABASE_URL` (URL do Supabase)
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (URL do seu domínio)

### 2. Configuração de Email (Futuro)
Para implementar confirmações por email:
1. Configure um provedor SMTP (SendGrid, Mailgun, etc.)
2. Adicione as variáveis SMTP no `.env.local`
3. Implemente o serviço de email

## 🚀 Melhorias Futuras

### Multi-tenancy Avançado
- [ ] Subdomínios personalizados (ex: `minhabarbearia.app.com`)
- [ ] Middleware para extração de subdomínio
- [ ] Templates personalizáveis

### Funcionalidades Avançadas
- [ ] Múltiplos barbeiros por barbearia
- [ ] Diferentes tipos de serviço
- [ ] Notificações SMS/Email
- [ ] Integração com calendários externos
- [ ] Sistema de avaliações

### Monetização
- [ ] Planos pagos com limitações
- [ ] Limite de agendamentos por mês
- [ ] Recursos premium

### UX/UI
- [ ] PWA (Progressive Web App)
- [ ] Notificações push
- [ ] Modo escuro
- [ ] Internacionalização

## 🧪 Testes

### Testes Unitários
```bash
# Instalar dependências de teste
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Executar testes
npm test
```

### Testes E2E (Opcional)
```bash
# Instalar Playwright
npm install --save-dev @playwright/test

# Executar testes E2E
npx playwright test
```

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia servidor de produção

# Banco de dados
npx prisma studio    # Interface visual do banco
npx prisma migrate dev # Executa migrações
npx prisma generate  # Gera cliente Prisma

# Linting e formatação
npm run lint         # Executa ESLint
npm run lint:fix     # Corrige problemas de linting
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique se todas as dependências estão instaladas
2. Confirme se o banco de dados está configurado corretamente
3. Verifique as variáveis de ambiente
4. Abra uma issue no GitHub

## ✅ Roadmap de Funcionalidades Concluídas

Esta seção resume as principais funcionalidades e marcos alcançados no projeto.

### Arquitetura e Estrutura
- [x] **Arquitetura Monorepo**: O projeto foi estruturado em um monorepo, separando o **Frontend (Next.js)** do **Backend (Node.js/Express)** para melhor escalabilidade e manutenção.
- [x] **Banco de Dados com Prisma**: Utilização do Prisma ORM para modelagem de dados, migrações e acesso ao banco de dados PostgreSQL.

### Funcionalidades Core
- [x] **Sistema de Agendamento**: Mecanismo completo para clientes agendarem horários, com verificação de disponibilidade em tempo real.
- [x] **Gestão de Barbearias**: Proprietários podem criar, editar e remover suas barbearias através de um dashboard.
- [x] **Páginas Públicas para Barbearias**: Cada barbearia possui uma página pública e personalizada para receber agendamentos.
- [x] **Autenticação de Usuários**: Sistema de login e registro para proprietários de barbearias usando NextAuth.

### Modelo SaaS e Pagamentos
- [x] **Sistema de Planos e Assinaturas**: Implementação de um modelo SaaS com diferentes níveis de planos (Básico, Intermediário, Avançado).
- [x] **Integração com Mercado Pago**: Checkout de pagamento para os planos de assinatura, com backend para gerar preferências de pagamento.
- [x] **Webhook de Pagamento**: Rota de webhook para receber e processar notificações de status de pagamento do Mercado Pago.
- [x] **Perfil de Assinante**: Página onde o usuário pode visualizar o status de sua assinatura.

### Melhorias e Correções
- [x] **Gerenciamento Avançado de Agendamentos**: Funcionalidade para donos de barbearia removerem agendamentos em massa por status.
- [x] **Correção de Bug de Fuso Horário**: Resolvido um problema crítico que exibia todos os horários como disponíveis, garantindo que a consulta de disponibilidade seja precisa.
- [x] **Correção de Bug de Sessão**: Solucionado o problema onde o nome do usuário não era exibido corretamente no Header após o login.
- [x] **UI Dinâmica na Home**: A página inicial agora exibe conteúdo diferenciado para usuários assinantes e não assinantes.

---

## 🎯 Roadmap de Melhorias Futuras

Aqui estão algumas das funcionalidades e melhorias planejadas para o futuro do projeto:

### Módulo de Notificações
- [ ] **Notificações por Email/SMS**: Envio de confirmações, lembretes e cancelamentos de agendamento.
- [ ] **Integração com WhatsApp Business**: Para automação de mensagens e agendamentos.

### Dashboard Avançado
- [ ] **Relatórios e Analytics**: Gráficos de faturamento, número de clientes, serviços mais populares, etc.
- [ ] **Gestão de Clientes (CRM)**: Histórico de agendamentos e preferências por cliente.
- [ ] **Gestão de Equipe**: Múltiplos barbeiros por barbearia, cada um com sua própria agenda.

### Funcionalidades da Plataforma
- [ ] **Múltiplos Serviços**: Capacidade de cadastrar diferentes tipos de serviço com durações e preços variados.
- [ ] **Sistema de Avaliações**: Clientes poderão avaliar o serviço e a barbearia.
- [ ] **API Pública**: Para permitir que outros sistemas se integrem à plataforma.

### Melhorias de UX/UI
- [ ] **PWA (Progressive Web App)**: Melhorar a experiência mobile, tornando o app "instalável".
- [ ] **Internacionalização (i18n)**: Suporte a múltiplos idiomas.
- [ ] **Temas Personalizáveis**: Permitir que donos de barbearia personalizem a aparência de suas páginas públicas.

Desenvolvido com ❤️ para facilitar a gestão de barbearias
