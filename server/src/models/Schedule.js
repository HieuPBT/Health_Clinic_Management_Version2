import mongoose from "mongoose";
import { Schema } from "mongoose";

const scheduleSchema = new Schema({
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    shift: { type: Schema.Types.ObjectId, ref: 'Shift', required: true },
    startDate: Date,
    endDate: Date
}, {
    timestamps: true
});
const Schedule = mongoose.model('Schedule', scheduleSchema);
export default Schedule;
