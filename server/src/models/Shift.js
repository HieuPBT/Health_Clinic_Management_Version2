import mongoose from "mongoose";
import { Schema } from "mongoose";

const shiftSchema = new Schema({
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true }
}, {
    timestamps: true
});

const Shift = mongoose.model('Shift', shiftSchema);
export default Shift;
