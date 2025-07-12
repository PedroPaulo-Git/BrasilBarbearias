"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const serviceController_1 = require("../controllers/serviceController");
const router = (0, express_1.Router)();
router.post('/services', serviceController_1.createService);
router.get('/shops/:shopId/services', serviceController_1.getServices);
router.put('/services/:id', serviceController_1.updateService);
router.delete('/services/:id', serviceController_1.deleteService);
exports.default = router;
//# sourceMappingURL=serviceRoutes.js.map