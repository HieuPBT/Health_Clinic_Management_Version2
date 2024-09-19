import Prescription from '../models/Prescription.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import moment from "moment-timezone"
import createPaginator from '../utils/paginator.js';
import Invoice from '../models/Invoice.js';
import Patient from '../models/Patient.js';

const TIMEZONE = 'Asia/Ho_Chi_Minh';

const prescriptionPaginator = createPaginator(Prescription);

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

        const pipeline = [
            {
                $lookup: {
                    from: 'appointments',
                    localField: 'appointment',
                    foreignField: '_id',
                    as: 'appointment'
                }
            },
            {
                $unwind: '$appointment'
            },
            {
                $match: {
                    'appointment.bookingDate': {
                        $gte: today.toDate(),
                        $lt: tomorrow.toDate()
                    },
                    'appointment.status': "CHƯA THANH TOÁN"
                }
            }
        ]

        const options = {
            page: req.query.page,
            baseUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,
            sortBy: { 'appointment.bookingDate': -1 },
        }

        const result = await prescriptionPaginator(pipeline, options);

        await Prescription.populate(result.results, {
            path: 'appointment',
            populate: {
                path: 'patient department', select: 'name fullName email'
            }
        })

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const createInvoice = async (req, res) => {
    try {
        const prescriptionId = req.params.id;
        // const {
        //     appointmentFee,
        // } = req.body;

        // console.log( req.body);
        const nurse = req.user.id;
        console.log(nurse);

        const prescription = await Prescription.findById(prescriptionId);
        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }


        const newInvoice = new Invoice({
            nurse,
            prescription: prescriptionId,
            ...req.body
        });
        console.log(newInvoice);
        await newInvoice.save();

        // Update appointment status
        // await Appointment.findByIdAndUpdate(prescription.appointment, { status: 'ĐÃ THANH TOÁN' });

        res.status(201).json(newInvoice);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
};

export const getPatientPrescriptions = async (req, res) => {
    try {
        const { start_date, end_date, page, limit, search } = req.query;
        let aggregationPipeline = [
            {
                $lookup: {
                    from: 'appointments',
                    localField: 'appointment',
                    foreignField: '_id',
                    as: 'appointmentDetails'
                }
            },
            { $unwind: '$appointmentDetails' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'appointmentDetails.patient',
                    foreignField: '_id',
                    as: 'patientDetails'
                }
            },
            { $unwind: '$patientDetails' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'doctor',
                    foreignField: '_id',
                    as: 'doctorDetails'
                }
            },
            { $unwind: '$doctorDetails' },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'appointmentDetails.department',
                    foreignField: '_id',
                    as: 'departmentDetails'
                }
            },
            { $unwind: '$departmentDetails' },
            {
                $lookup: {
                    from: 'medicines',
                    localField: 'medicineList.medicine',
                    foreignField: '_id',
                    as: 'medicineDetails'
                }
            }
        ];

        let matchStage = {};
        if (start_date && end_date) {
            matchStage['appointmentDetails.bookingDate'] = {
                $gte: moment(start_date).tz(TIMEZONE).startOf('day').toDate(),
                $lte: moment(end_date).tz(TIMEZONE).endOf('day').toDate()
            };
        }
        if (search) {
            matchStage['$or'] = [
                { 'patientDetails.fullName': { $regex: search, $options: 'i' } },
                { 'patientDetails.email': { $regex: search, $options: 'i' } }
            ];
        }
        if (Object.keys(matchStage).length > 0) {
            aggregationPipeline.push({ $match: matchStage });
        }

        aggregationPipeline.push({
            $project: {
                id: 1,
                medicineList: {
                    $map: {
                        input: '$medicineList',
                        as: 'medicine',
                        in: {
                            medicine: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: '$medicineDetails',
                                            cond: { $eq: ['$$this._id', '$$medicine.medicine'] }
                                        }
                                    },
                                    0
                                ]
                            },
                            note: '$$medicine.note',
                            quantity: '$$medicine.quantity'
                        }
                    }
                },
                description: 1,
                conclusion: 1,
                createdAt: 1,
                updatedAt: 1,
                patient: {
                    id: '$patientDetails._id',
                    email: '$patientDetails.email',
                    fullName: '$patientDetails.fullName'
                },
                appointment: {
                    id: '$appointmentDetails._id',
                    bookingDate: '$appointmentDetails.bookingDate',
                    bookingTime: '$appointmentDetails.bookingTime'
                },
                doctor: {
                    id: '$doctorDetails._id',
                    name: '$doctorDetails.fullName'
                },
                department: {
                    id: '$departmentDetails._id',
                    name: '$departmentDetails.name'
                }
            }
        });

        const options = {
            page: page || 1,
            limit: limit || 10,
            baseUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,
            sortBy: { 'appointment.bookingDate': -1 }
        };

        const result = await prescriptionPaginator(aggregationPipeline, options);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { sendPrescriptionEmail } from '../utils/email.js';

export const exportPrescriptionPDF = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    // Fetch prescription data
    const prescription = await Prescription.findById(prescriptionId)
      .populate('doctor', 'fullName')
      .populate('appointment')
      .populate('medicineList.medicine');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Fetch appointment data
    const appointment = await Appointment.findById(prescription.appointment)
      .populate('patient', 'fullName email')
      .populate('department', 'name');

    // Generate PDF
    const doc = new PDFDocument();
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(chunks);
      const pdfStream = new Readable();
      pdfStream.push(pdfBuffer);
      pdfStream.push(null);

      // Send email with PDF attachment
      await sendPrescriptionEmail(appointment.patient.email, pdfStream);

      // Send PDF to frontend
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=prescription_${prescriptionId}.pdf`);
      res.send(pdfBuffer);
    });

    // Generate PDF content
    doc.fontSize(18).text('Prescription', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Doctor: ${prescription.doctor.fullName}`);
    doc.text(`Patient: ${appointment.patient.fullName}`);
    doc.text(`Department: ${appointment.department.name}`);
    doc.text(`Date: ${appointment.bookingDate.toLocaleDateString()}`);
    doc.moveDown();
    doc.text('Medicines:');
    // prescription.medicineList.forEach((item) => {
    //   doc.text(`- ${item.medicine.name}: ${item.quantity} ${item.medicine.unit} (${item.note})`);
    // });
    doc.moveDown();
    doc.text(`Description: ${prescription.description}`);
    doc.text(`Conclusion: ${prescription.conclusion}`);

    doc.end();
  } catch (error) {
    console.error('Error exporting prescription PDF:', error);
    res.status(500).json({ message: 'Error exporting prescription PDF' });
  }
};
