import Appointment from "../models/Appointment.js";
import Department from "../models/Department.js";
import User from "../models/User.js";
import { sendConfirmationEmail } from "../utils/email.js";
import formatDateTime from "../utils/formatDateTime.js";
import createPaginator from "../utils/paginator.js";
import moment from "moment-timezone"

const TIMEZONE = 'Asia/Ho_Chi_Minh';
const ALLOWED_BOOKING_TIMES = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

const appointmentPaginator = createPaginator(Appointment);


export const createAppointment = async (req, res) => {
    const appointment = new Appointment({
        ...req.body,
        patient: req.user.id
    });

    try {
        await appointment.save();
        res.status(201).send(appointment);
    } catch (error) {
        res.status(400).send(error);
    }
}

export const getUserAppointments = async (req, res) => {
    try {
        const query = { patient: req.user.id };
        const options = {
            page: req.query.page,
            baseUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,
            sortBy: { bookingDate: -1 }
        };

        const result = await appointmentPaginator(query, options);
        await Appointment.populate(result.results, {path: 'department', select: 'name'});

        res.json(result);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getPatientAppointments = async(req, res) => {
    try{
        let query
        if(req.user.role == 'nurse'){
            query = {status: "CHƯA XÁC NHẬN"}
        }
        else {
            query = {status: "ĐÃ XÁC NHẬN"}
        }
        const options = {
            page: req.query.page,
            baseUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,
            sortBy: { bookingDate: -1 }
        };

        const result = await appointmentPaginator(query, options);

        await Appointment.populate(result.results, {path: 'patient department', select: 'email fullName name'});

        res.json(result);

    }catch(error){
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const confirmAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const appointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            {
                status: 'ĐÃ XÁC NHẬN',
                confirmedBy: req.user.id
            },
            { new: true, runValidators: true }
        );

        if (!appointment) {
            return res.status(404).json({ message: 'Không tìm thấy cuộc hẹn' });
        }
        const [patient, department] = await Promise.all([
            User.findById(appointment.patient).select('email fullName'),
            Department.findById(appointment.department).select('name')
        ]);

        const { date, time } = formatDateTime(appointment.bookingDate, appointment.bookingTime);

        await sendConfirmationEmail(
            patient.email,
            patient.fullName,
            true,
            department.name,
            date,
            time,
            ""
        );

        res.json({
            message: 'Xác nhận cuộc hẹn thành công',
            appointment
        });
    } catch (error) {
        console.error('Lỗi khi xác nhận cuộc hẹn:', error);
        res.status(500).json({ message: 'Lỗi server khi xác nhận cuộc hẹn', error: error.message });
    }
};

export const rejectAppointment = async (req, res) => {
    try {
        const { reason } = req.body;
        const appointmentId = req.params.id;
        const appointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            {
                status: 'ĐÃ TỪ CHỐI',
                confirmedBy: req.user.id
            },
            { new: true, runValidators: true }
        );

        if (!appointment) {
            return res.status(404).json({ message: 'Không tìm thấy cuộc hẹn' });
        }

        const [patient, department] = await Promise.all([
            User.findById(appointment.patient).select('email fullName'),
            Department.findById(appointment.department).select('name')
        ]);

        const { date, time } = formatDateTime(appointment.bookingDate, appointment.bookingTime);

        await sendConfirmationEmail(
            patient.email,
            patient.fullName,
            false,
            department.name,
            date,
            time,
            reason
        );

        res.json({
            message: 'Từ chối cuộc hẹn thành công',
            appointment
        });
    } catch (error) {
        console.error('Lỗi khi từ chối cuộc hẹn:', error);
        res.status(500).json({ message: 'Lỗi server khi từ chối cuộc hẹn', error: error.message });
    }
};

export const cancelAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: 'Không tìm thấy cuộc hẹn' });
        }

        if (appointment.patient.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Không có quyền hủy cuộc hẹn này' });
        }

        appointment.status = 'ĐÃ HUỶ';
        await appointment.save();

        res.json({
            message: 'Hủy cuộc hẹn thành công',
            appointment
        });
    } catch (error) {
        console.error('Lỗi khi hủy cuộc hẹn:', error);
        res.status(500).json({ message: 'Lỗi server khi hủy cuộc hẹn', error: error.message });
    }
};

export const getAvailableBookingTimes = async (req, res) => {
    const { date, department } = req.query;

    if (!date || !department) {
        return res.status(400).json({ error: 'Date and department are required' });
    }

    try {
        const parsedDate = moment.tz(date, 'YYYY-MM-DD', TIMEZONE);
        if (!parsedDate.isValid()) {
            return res.status(400).json({ error: 'Invalid date format. Please use YYYY-MM-DD' });
        }

        const startDate = parsedDate.startOf('day').toDate();
        const endDate = parsedDate.add(1, 'day').startOf('day').toDate();

        const bookedAppointments = await Appointment.find({
            bookingDate: {
                $gte: startDate,
                $lt: endDate
            },
            department,
            status: { $ne: 'ĐÃ HUỶ' }
        }).select('bookingTime -_id');


        const bookedTimes = bookedAppointments.map(app => {
            const [hours, minutes] = app.bookingTime.split(':');
            return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        });
        const availableTimes = ALLOWED_BOOKING_TIMES.filter(time => !bookedTimes.includes(time));
        res.json(availableTimes);
    } catch (error) {
        console.error('Error in getAvailableBookingTimes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getNext30DaysAppointmentsCount = async (req, res) => {
    try {
        const tomorrow = moment().tz(TIMEZONE).startOf('day').add(1, 'days');
        const thirtyDaysFromTomorrow = moment(tomorrow).add(30, 'days');

        const pipeline = [
            {
                $match: {
                    bookingDate: {
                        $gte: tomorrow.toDate(),
                        $lt: thirtyDaysFromTomorrow.toDate()
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$bookingDate", timezone: TIMEZONE }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ];

        const results = await Appointment.aggregate(pipeline);

        const filledResults = [];
        let currentDate = tomorrow.clone();

        while (currentDate.isBefore(thirtyDaysFromTomorrow)) {
            const dateString = currentDate.format('YYYY-MM-DD');
            const found = results.find(r => r._id === dateString);
            filledResults.push({
                date: dateString,
                count: found ? found.count : 0
            });
            currentDate.add(1, 'day');
        }

        res.json(filledResults);
    } catch (error) {
        console.error('Error fetching appointment counts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
