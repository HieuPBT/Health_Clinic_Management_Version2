import express from 'express'
const router = express.Router();
import { register, login, verifyEmail, getNewPassword, changePassword } from '../controllers/authController.js'
import upload from '../middlewares/uploadMiddleware.js'
import authenticateToken from '../middlewares/authenticateToken.js';

router.post('/register', upload.single('avatar'), register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', login);
router.post('/forgot-password', getNewPassword);
router.post('/change-password', authenticateToken, changePassword);

export default router;
