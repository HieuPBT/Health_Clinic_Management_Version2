import mongoose from "mongoose";
import { Schema } from "mongoose";

const invoiceSchema = new Schema({
    prescription: { type: Schema.Types.ObjectId, ref: 'Prescription', required: true, unique: true },
    nurse: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    appointmentFee: { type: Number, required: true },
    // prescriptionFee: Number,
    paymentMethod: { 
        type: String, 
        enum: ['CASH', 'MOMO_PAY', 'ZALO_PAY', 'VN_PAY'],
        required: true
    }, 
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    paymentDescription: {type: String},
    paymentStatus: {
        type: String,
        enum: ['PENDING','COMPLETED', 'FAILED'],
        default: 'PENDING'
    }
},{
    timestamps: true
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
