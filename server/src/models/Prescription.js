import mongoose from "mongoose";
import { Schema } from "mongoose";

const prescriptionSchema = new Schema({
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
    medicineList: [{
        medicine: { type: Schema.Types.ObjectId, ref: 'Medicine' },
        note: String,
        quantity: { type: Number, default: 1 }
    }],
    description: String,
    conclusion: String
}, {
    timestamps: true
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
