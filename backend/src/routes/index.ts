import express from 'express';
import { authController } from '../controllers/authController';
import { shopController } from '../controllers/shopController';
import { appointmentController } from '../controllers/appointmentController';
import { authMiddleware } from '../middlewares/auth';
import { paymentRoutes } from './paymentRoutes'; // Importando as novas rotas

const router = express.Router();

// Rotas de autenticação
router.post('/register', authController.register.bind(authController));

// Rotas públicas de barbearias
router.get('/shops/public', shopController.getPublicShops.bind(shopController));
router.get('/shops/:slug', shopController.getShopBySlug.bind(shopController));
router.get('/shops/:slug/availability', shopController.getAvailability.bind(shopController));

// Rotas de agendamentos
router.post('/appointments', appointmentController.createAppointment.bind(appointmentController));

// Rotas de Pagamento (centralizadas)
router.use('/payments', paymentRoutes);

// Rotas protegidas (requerem autenticação)
router.get('/shops', authMiddleware, shopController.getUserShops.bind(shopController));
router.post('/shops', authMiddleware, shopController.createShop.bind(shopController));

export default router; 