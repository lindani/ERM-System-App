import express from 'express';
import {
  signup,
  login,
  getAllUsers
} from '../controllers/users.js';
import { authenticate, authorize } from '../middlewares/auth.js';


const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.use(authenticate);
router.get('/', authorize('admin'), getAllUsers);

export default router;