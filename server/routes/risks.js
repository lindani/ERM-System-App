import express from 'express';
import {
  createRisk,
  getRisks,
  updateRisk,
  deleteRisk
} from '../controllers/risks.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

router.route('/')
  .post(authorize('risk_manager', 'admin'), createRisk)
  .get(authorize('viewer', 'risk_manager', 'admin'), getRisks);

router.route('/:id')
  .put(authorize('risk_manager', 'admin'), updateRisk)
  .delete(authorize('admin'), deleteRisk);

export default router;