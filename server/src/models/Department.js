import mongoose from "mongoose";
import { Schema } from "mongoose";

const departmentSchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: String
}, {
    timestamps: true
});


const Department = mongoose.model('Department', departmentSchema);
export default Department;
