import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  bookingDate: {
    type: Date,
    required: true
  },
  bookingTime: { type: String, required: true },
  status: { type: String, enum: ['CHƯA XÁC NHẬN', 'ĐÃ XÁC NHẬN', 'ĐÃ HUỶ', 'ĐÃ TỪ CHỐI', 'CHƯA THANH TOÁN', 'ĐÃ THANH TOÁN'], default: 'CHƯA XÁC NHẬN' },
  confirmedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
