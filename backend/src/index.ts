// Controllers
export { authController } from './controllers/authController';
export { shopController } from './controllers/shopController';
export { appointmentController } from './controllers/appointmentController';

// Middlewares
export { authMiddleware } from './middlewares/auth';
export { errorHandler } from './middlewares/errorHandler';

// Services
export { apiService } from './services/apiService';

// Config
export { config } from './config/database';

// Types
export * from './types';

// Routes
export { default as routes } from './routes';

// App
export { default as app } from './app'; 