import mongoose from "mongoose";
import { Schema } from "mongoose";

const invoiceSchema = new Schema({
    prescription: { type: Schema.Types.ObjectId, ref: 'Prescription', required: true, unique: true },
    nurse: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    appointmentFee: { type: Number, required: true },
    prescriptionFee: Number,
    paymentMethod: { type: String, enum: ['CASH', 'MOMO_PAY', 'ZALO_PAY', 'VN_PAY'] },
}, {
    timestamps: true
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
