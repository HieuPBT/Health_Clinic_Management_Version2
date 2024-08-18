import express from 'express'
import authenticateToken from '../middlewares/authenticateToken.js';
import authorizeRole from '../middlewares/authorizeRole.js';
import { cancelAppointment, confirmAppointment, createAppointment, getAvailableBookingTimes, getNext30DaysAppointmentsCount, getUserAppointments, rejectAppointment, getPatientAppointments } from '../controllers/appointmentController.js';
const router = express.Router();

router.post('/', authenticateToken, createAppointment);
router.get('/', authenticateToken, getUserAppointments);
router.get('/patient-appointments', authenticateToken, authorizeRole(['nurse', 'doctor']), getPatientAppointments);
router.patch('/:id/confirm', authenticateToken, authorizeRole(['nurse']), confirmAppointment);
router.post('/:id/reject', authenticateToken, authorizeRole(['nurse']), rejectAppointment);
router.patch('/:id/cancel', authenticateToken, cancelAppointment);
router.get('/available-booking-times', authenticateToken, getAvailableBookingTimes);
router.get('/appointment-counts', authenticateToken, getNext30DaysAppointmentsCount)

export default router;
