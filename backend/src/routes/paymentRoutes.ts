import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Rota para o frontend criar a preferência de pagamento
router.post('/checkout', authMiddleware, paymentController.createCheckoutPreference);

// Confirmação/processamento direto do pagamento vindo do Checkout Brick
router.post('/confirm-payment', authMiddleware, paymentController.confirmPayment);

// Rota para receber notificações de pagamento do Mercado Pago (webhook)
router.post('/webhook', paymentController.handleWebhook);

export const paymentRoutes = router; 