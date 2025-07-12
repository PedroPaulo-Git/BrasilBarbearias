"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = void 0;
const express_1 = require("express");
const paymentController_1 = require("../controllers/paymentController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.post('/checkout', auth_1.authMiddleware, paymentController_1.paymentController.createCheckoutPreference);
router.post('/confirm-payment', auth_1.authMiddleware, paymentController_1.paymentController.confirmPayment);
router.post('/webhook', paymentController_1.paymentController.handleWebhook);
exports.paymentRoutes = router;
//# sourceMappingURL=paymentRoutes.js.map