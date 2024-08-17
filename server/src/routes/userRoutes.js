import express from 'express';
import { deleteUser, getUserProfile, updateUser } from '../controllers/userController.js'
import authenticateToken from '../middlewares/authenticateToken.js';
import upload from '../middlewares/uploadMiddleware.js';
const router = express.Router();


router.get('/:id/profile', authenticateToken, getUserProfile);
router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, upload.single('avatar'), updateUser);
router.delete('/:id', authenticateToken, deleteUser);

export default router;
