/**
 * Exemplo de uso da nova estrutura organizada do backend
 * 
 * Este arquivo demonstra como usar os controllers, services e middlewares
 * de forma organizada e tipada.
 */

import { authController, shopController, appointmentController } from '../src/index';
import { RegisterRequest, ShopRequest, AppointmentRequest } from '../src/types';

// Exemplo de uso dos controllers
async function exemploUsoControllers() {
  console.log('=== Exemplo de Uso dos Controllers ===\n');

  // 1. Exemplo de dados para registro
  const userData: RegisterRequest = {
    name: 'João Silva',
    email: 'joao@email.com',
    password: '123456'
  };

  // 2. Exemplo de dados para criar barbearia
  const shopData: ShopRequest = {
    name: 'Barbearia do João',
    description: 'Barbearia tradicional com os melhores profissionais',
    address: 'Rua das Flores, 123 - Centro',
    phone: '(11) 99999-9999',
    slug: 'barbearia-do-joao'
  };

  // 3. Exemplo de dados para agendamento
  const appointmentData: AppointmentRequest = {
    shopId: '123',
    serviceId: '456',
    date: '2024-01-15',
    time: '14:00',
    customerName: 'João Silva',
    customerEmail: 'joao@email.com',
    customerPhone: '11999999999'
  };

  console.log('Dados de exemplo criados:');
  console.log('- Usuário:', userData);
  console.log('- Barbearia:', shopData);
  console.log('- Agendamento:', appointmentData);
  console.log('\nOs controllers podem ser usados diretamente nas rotas do Express.');
}

// Exemplo de como estruturar uma nova funcionalidade
class ExemploNovaFuncionalidade {
  // Controller
  async processarDados(req: any, res: any) {
    try {
      // Lógica do controller
      const resultado = await this.service.processar(req.body);
      
      res.json({
        success: true,
        data: resultado,
        message: 'Dados processados com sucesso'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Service
  private async processar(dados: any) {
    // Lógica de negócio
    return { processado: true, dados };
  }
}

// Exemplo de middleware customizado
function exemploMiddleware(req: any, res: any, next: any) {
  console.log('Middleware executado:', req.method, req.path);
  next();
}

// Executar exemplo
exemploUsoControllers();

export {
  exemploUsoControllers,
  ExemploNovaFuncionalidade,
  exemploMiddleware
}; 