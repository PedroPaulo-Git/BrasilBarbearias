# Barbearia Backend

Servidor backend para testar APIs da BarbeariaApp com estrutura organizada em controllers, middlewares e serviços.

## 🏗️ Estrutura do Projeto

```
backend/
├── src/
│   ├── controllers/          # Controllers da aplicação
│   │   ├── authController.ts
│   │   ├── shopController.ts
│   │   └── appointmentController.ts
│   ├── middlewares/          # Middlewares customizados
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── services/             # Serviços de negócio
│   │   └── apiService.ts
│   ├── routes/               # Definição de rotas
│   │   └── index.ts
│   ├── config/               # Configurações
│   │   └── database.ts
│   ├── types/                # Tipos TypeScript
│   │   └── index.ts
│   ├── app.ts                # Configuração do Express
│   └── index.ts              # Arquivo de índice
├── examples/                 # Exemplos de uso
├── server.ts                 # Ponto de entrada
├── env.example               # Exemplo de variáveis de ambiente
├── package.json
└── tsconfig.json
```

## 🚀 Como Executar

### Instalação
```bash
npm install
```

### Configuração do Ambiente
1. Copie o arquivo de exemplo:
```bash
cp env.example .env
```

2. Configure as variáveis no arquivo `.env`:
```env
# Configurações do Servidor
PORT=5000
NODE_ENV=development

# Configurações da API Principal
API_BASE_URL=http://localhost:5000/api

# Configurações de Segurança
CORS_ORIGIN=http://localhost:3000

# Configurações de Log
LOG_LEVEL=debug

# Configurações de Timeout (em milissegundos)
REQUEST_TIMEOUT=30000

# Configurações de Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100  # 100 requisições por janela

# Configurações de Cache (opcional)
CACHE_TTL=3600  # 1 hora em segundos

# Configurações de Monitoramento (opcional)
ENABLE_METRICS=true
METRICS_PORT=9090
```

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## 📋 Endpoints Disponíveis

### Autenticação
- `POST /register` - Registrar usuário

### Barbearias Públicas
- `GET /shops/public` - Listar barbearias públicas
- `GET /shops/:slug` - Buscar barbearia por slug
- `GET /shops/:slug/availability` - Verificar disponibilidade

### Agendamentos
- `POST /appointments` - Criar agendamento

### Barbearias do Usuário (Autenticadas)
- `GET /shops` - Listar barbearias do usuário
- `POST /shops` - Criar barbearia

## 🔧 Configuração

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `PORT` | Porta do servidor | `5000` |
| `NODE_ENV` | Ambiente de execução | `development` |
| `API_BASE_URL` | URL da API principal | `http://localhost:5000/api` |
| `CORS_ORIGIN` | Origem permitida para CORS | `http://localhost:3000` |
| `LOG_LEVEL` | Nível de log | `info` |
| `REQUEST_TIMEOUT` | Timeout das requisições (ms) | `30000` |
| `RATE_LIMIT_WINDOW_MS` | Janela do rate limiting (ms) | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Máximo de requisições por janela | `100` |
| `CACHE_TTL` | Tempo de vida do cache (s) | `3600` |
| `ENABLE_METRICS` | Habilitar métricas | `false` |
| `METRICS_PORT` | Porta das métricas | `9090` |

## 🏛️ Arquitetura

### Controllers
Responsáveis por receber requisições HTTP e retornar respostas. Cada controller tem responsabilidades específicas:

- **AuthController**: Gerencia autenticação e registro
- **ShopController**: Gerencia operações de barbearias
- **AppointmentController**: Gerencia agendamentos

### Middlewares
Interceptam requisições para adicionar funcionalidades:

- **authMiddleware**: Verifica tokens de autenticação
- **errorHandler**: Trata erros globalmente

### Services
Contêm a lógica de negócio e comunicação com APIs externas:

- **ApiService**: Centraliza todas as chamadas para a API principal

### Types
Definições TypeScript para tipagem forte:

- Interfaces para requisições e respostas
- Tipos para controllers e middlewares
- Extensões do Express

## 🔒 Autenticação

Para rotas protegidas, inclua o header:
```
Authorization: Bearer <session-token>
```

## 📝 Exemplos de Uso

### Registrar Usuário
```bash
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "123456"
  }'
```

### Listar Barbearias Públicas
```bash
curl http://localhost:5000/shops/public
```

### Criar Agendamento
```bash
curl -X POST http://localhost:5000/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "shopId": "123",
    "serviceId": "456",
    "date": "2024-01-15",
    "time": "14:00",
    "customerName": "João Silva",
    "customerEmail": "joao@email.com",
    "customerPhone": "11999999999"
  }'
```

## 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Linguagem tipada
- **Axios** - Cliente HTTP
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Gerenciamento de variáveis de ambiente

## 📦 Scripts Disponíveis

- `npm run dev` - Executa em modo desenvolvimento com hot reload
- `npm start` - Executa em modo produção
- `npm run build` - Compila o TypeScript para JavaScript 