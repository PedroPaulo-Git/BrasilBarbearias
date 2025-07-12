"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const shopController_1 = require("../controllers/shopController");
const appointmentController_1 = require("../controllers/appointmentController");
const auth_1 = require("../middlewares/auth");
const paymentRoutes_1 = require("./paymentRoutes");
const serviceRoutes_1 = __importDefault(require("./serviceRoutes"));
const router = express_1.default.Router();
router.post('/register', authController_1.authController.register.bind(authController_1.authController));
router.get('/shops/public', shopController_1.shopController.getPublicShops.bind(shopController_1.shopController));
router.get('/shops/:slug', shopController_1.shopController.getShopBySlug.bind(shopController_1.shopController));
router.get('/shops/:slug/availability', shopController_1.shopController.getAvailability.bind(shopController_1.shopController));
router.post('/appointments', appointmentController_1.appointmentController.createAppointment.bind(appointmentController_1.appointmentController));
router.use('/payments', paymentRoutes_1.paymentRoutes);
router.use('/', serviceRoutes_1.default);
router.get('/shops', auth_1.authMiddleware, shopController_1.shopController.getUserShops.bind(shopController_1.shopController));
router.post('/shops', auth_1.authMiddleware, shopController_1.shopController.createShop.bind(shopController_1.shopController));
exports.default = router;
//# sourceMappingURL=index.js.map