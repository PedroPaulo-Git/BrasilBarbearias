import { Router } from 'express';
import {
  createService,
  getServices,
  updateService,
  deleteService,
} from '../controllers/serviceController';

const router = Router();

router.post('/services', createService);
router.get('/shops/:shopId/services', getServices);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

export default router;
