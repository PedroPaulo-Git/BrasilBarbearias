import express from 'express';
import cors from 'cors';
import { config } from './config/database';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    message: 'Servidor Backend BarbeariaApp',
    version: '1.0.0',
    endpoints: {
      'POST /register': 'Registrar usuário',
      'GET /shops/public': 'Listar barbearias públicas',
      'GET /shops/:slug': 'Buscar barbearia por slug',
      'GET /shops/:slug/availability': 'Verificar disponibilidade',
      'POST /appointments': 'Criar agendamento',
      'GET /shops': 'Listar barbearias do usuário (auth)',
      'POST /shops': 'Criar barbearia (auth)'
    }
  });
});

// Rotas da aplicação
app.use('/', routes);

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

export default app; 