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

// export const getPatientPrescriptions = async (req, res) => {
//     try {
//         const { email, start_date, end_date, page, limit } = req.query;

//         let query = {};

//         if (email) {
//             const patient = await User.findOne({ email });
//             console.log(patient);
//             if (patient) {
//                 query['appointment.patient'] = patient._id;
//             }
//             else console.log('Not found')
//         }

//         // if (email) {
//         //     const user = await User.findOne({ email })
//         //     if (user) {
//         //         query['appointment.patient'] = user._id;
//         //     } else {
//         //         return res.status(404).json({ message: 'Patient not found' });
//         //     }
//         // }

//         if (start_date && end_date) {
//             query.createdAt = {
//                 $gte: moment(start_date).tz(TIMEZONE).startOf('day').toDate(),
//                 $lte: moment(end_date).tz(TIMEZONE).endOf('day').toDate()
//             };
//         }

//         const options = {
//             page: req.query.page,
//             baseUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,
//             sortBy: { 'appointment.bookingDate': -1 },
//             limit: req.query.limit,
//             populate: [
//                 { path: 'appointment', populate: { path: 'patient', select: 'email' } },
//                 { path: 'doctor', select: 'email' }
//               ]
//         }

//         console.log(options);

//         // const prescriptions = await Prescription.find(query).populate('patient');
//         // res.json(prescriptions);
//         const result = await prescriptionPaginator(query, options);

//         res.json((result));
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: error.message });
//     }
// };

export const getPatientPrescriptions = async (req, res) => {
    try {
        const { start_date, end_date, page, limit, search } = req.query;
        let aggregationPipeline = [];

        aggregationPipeline.push({
            $lookup: {
                from: 'appointments',
                localField: 'appointment',
                foreignField: '_id',
                as: 'appointmentDetails'
            }
        });
        aggregationPipeline.push({ $unwind: '$appointmentDetails' });
        aggregationPipeline.push({
            $lookup: {
                from: 'users',
                localField: 'appointmentDetails.patient',
                foreignField: '_id',
                as: 'patientDetails'
            }
        });
        aggregationPipeline.push({ $unwind: '$patientDetails' });
        aggregationPipeline.push({
            $lookup: {
                from: 'users',
                localField: 'doctor',
                foreignField: '_id',
                as: 'doctorDetails'
            }
        });
        aggregationPipeline.push({ $unwind: '$doctorDetails' });
        aggregationPipeline.push({
            $lookup: {
                from: 'departments',
                localField: 'appointmentDetails.department',
                foreignField: '_id',
                as: 'departmentDetails'
            }
        });
        aggregationPipeline.push({ $unwind: '$departmentDetails' });
        let matchStage = {};
        if (start_date && end_date) {
            matchStage['createdAt'] = {
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
                id: 1, medicineList: 1, description: 1, conclusion: 1, createdAt: 1, updatedAt: 1,
                patient: {
                    _id: '$patientDetails._id',
                    email: '$patientDetails.email',
                    fullName: '$patientDetails.fullName'
                },
                appointment: {
                    _id: '$appointmentDetails._id',
                    bookingDate: '$appointmentDetails.bookingDate',
                    bookingTime: '$appointmentDetails.bookingTime'
                },
                doctor: {
                    _id: '$doctorDetails._id',
                    name: '$doctorDetails.fullName'
                },
                department: {
                    _id: '$departmentDetails._id',
                    name: '$departmentDetails.name'
                }
            }
        });

        const options = {
            page: page || 1,
            limit: limit || 10,
            page: page  | 1,
            limit: limit | 10,
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
