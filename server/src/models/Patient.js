import mongoose from "mongoose";
import { Schema } from "mongoose";

const patientSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    healthInsurance: String
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
