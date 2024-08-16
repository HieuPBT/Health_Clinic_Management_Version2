import mongoose from "mongoose";
import { Schema } from "mongoose";
const employeeSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    shifts: [{ type: Schema.Types.ObjectId, ref: 'Shift' }]
}, {
    timestamps: true
});
const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
