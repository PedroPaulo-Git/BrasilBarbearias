import { Router } from 'express';
import { createCheckout, mercadoPagoWebhook } from '../controllers/paymentController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Rota para criar a preferência de pagamento (requer autenticação)
router.post('/checkout/:planId', authMiddleware, createCheckout);

// Rota para receber webhooks do Mercado Pago (não requer autenticação)
router.post('/webhook/mercadopago', mercadoPagoWebhook);

export default router; 