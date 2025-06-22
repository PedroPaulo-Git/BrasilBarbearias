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

## 🏗️ Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── api/               # API Routes
│   │   ├── auth/          # Autenticação
│   │   ├── shops/         # CRUD de barbearias
│   │   └── appointments/  # Agendamentos
│   ├── auth/              # Páginas de autenticação
│   ├── dashboard/         # Dashboard do proprietário
│   └── shops/             # Páginas públicas
├── components/            # Componentes React
│   ├── ui/               # Componentes shadcn/ui
│   └── ...               # Componentes customizados
├── lib/                  # Utilitários e configurações
└── types/                # Tipos TypeScript
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

## 🎯 Roadmap

- [x] MVP básico funcional
- [ ] Sistema de notificações
- [ ] Dashboard avançado com relatórios
- [ ] API pública para integrações
- [ ] App mobile (React Native)
- [ ] Sistema de pagamentos
- [ ] Integração com WhatsApp Business

---

Desenvolvido com ❤️ para facilitar a gestão de barbearias
