import express from 'express';
import * as prescriptionController from '../controllers/prescriptionController.js';
import authenticateToken from '../middlewares/authenticateToken.js';
import authorizeRole from '../middlewares/authorizeRole.js';

const router = express.Router();

router.post('/', authenticateToken, authorizeRole(['doctor']), prescriptionController.createPrescription);
router.get('/today', authenticateToken, authorizeRole(['nurse']), prescriptionController.getTodayPrescriptions);
router.get('/patient', authenticateToken, authorizeRole(['doctor']), prescriptionController.getPatientPrescriptions);
router.post('/:id/invoice', authenticateToken, authorizeRole(['nurse']), prescriptionController.createInvoice);

export default router;
