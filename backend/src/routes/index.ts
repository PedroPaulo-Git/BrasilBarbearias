import express from 'express';
import { authController } from '../controllers/authController';
import { shopController } from '../controllers/shopController';
import { appointmentController } from '../controllers/appointmentController';
import { createCheckout, mercadoPagoWebhook } from '../controllers/paymentController';
import { authMiddleware } from '../middlewares/auth';
import { paymentController } from '../controllers/paymentController';

const router = express.Router();

// Rotas de autenticação
router.post('/register', authController.register.bind(authController));

// Rotas públicas de barbearias
router.get('/shops/public', shopController.getPublicShops.bind(shopController));
router.get('/shops/:slug', shopController.getShopBySlug.bind(shopController));
router.get('/shops/:slug/availability', shopController.getAvailability.bind(shopController));

// Rotas de agendamentos
router.post('/appointments', appointmentController.createAppointment.bind(appointmentController));

// Rotas de pagamento
router.post('/checkout/:planId', authMiddleware, createCheckout);
router.post(
  '/process-payment',
  authMiddleware,
  paymentController.processPayment
);
router.post('/webhook/mercadopago', mercadoPagoWebhook);

// Rotas protegidas (requerem autenticação)
router.get('/shops', authMiddleware, shopController.getUserShops.bind(shopController));
router.post('/shops', authMiddleware, shopController.createShop.bind(shopController));

export default router; 