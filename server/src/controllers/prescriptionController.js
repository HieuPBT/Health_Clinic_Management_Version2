import Prescription from '../models/Prescription.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import moment from "moment-timezone"

const TIMEZONE = 'Asia/Ho_Chi_Minh';

export const createPrescription = async (req, res) => {
    try {
        const { appointment, medicineList, description, conclusion } = req.body;
        const doctor = req.user.id;
        const apm = await Appointment.findById(appointment);
        if (!apm) {
            return res.status(404).json({ message: 'No appointment found.' });
        }
        console.log(apm.patient);
        if (apm.status !== 'ĐÃ XÁC NHẬN') {
            return res.status(400).json({ message: 'Can only create prescription for confirmed appointment!' });
        }
        const newPrescription = new Prescription({
            doctor,
            appointment,
            medicineList,
            description,
            conclusion
        });

        await newPrescription.save();

        await Appointment.findByIdAndUpdate(appointment, { status: 'CHƯA THANH TOÁN' });

        res.status(201).json(newPrescription);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getTodayPrescriptions = async (req, res) => {
    try {
        const today = moment().tz(TIMEZONE).startOf('day');
        const tomorrow = moment(today).add(1, 'days');

        const prescriptions = await Prescription.find().populate({
            path: 'appointment',
            match: {
                bookingDate: {
                    $gte: today.toDate(),
                    $lt: tomorrow.toDate()
                },
                status: "CHƯA THANH TOÁN"
            }
        });

        res.json(prescriptions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const getPatientPrescriptions = async (req, res) => {
    try {
        const { email, start_date, end_date } = req.query;

        let query = {};

        if (email) {
            const patient = await User.findOne({ email });
            if (patient) {
                query['appointment.patient'] = patient._id;
            }
        }

        if (start_date && end_date) {
            query.createdAt = {
                $gte: moment(start_date).tz(TIMEZONE).startOf('day').toDate(),
                $lte: moment(end_date).tz(TIMEZONE).endOf('day').toDate()
            };
        }

        const prescriptions = await Prescription.find(query).populate('appointment');

        res.json(prescriptions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const createInvoice = async (req, res) => {
    try {
        const { prescriptionId } = req.params;
        const nurse = req.user._id;

        const prescription = await Prescription.findById(prescriptionId);
        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }

        const newInvoice = new Invoice({
            nurse,
            prescription: prescriptionId,
            ...req.body
        });

        await newInvoice.save();

        // Update appointment status
        await Appointment.findByIdAndUpdate(prescription.appointment, { status: 'ĐÃ THANH TOÁN' });

        res.status(201).json(newInvoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
