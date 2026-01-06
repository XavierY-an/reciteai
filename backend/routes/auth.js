import express from 'express';
import { register, login, getProfile, updateProfile, upgradePro } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// 公开路由
router.post('/register', register);
router.post('/login', login);

// 需要认证的路由
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/upgrade', auth, upgradePro);

export default router;
