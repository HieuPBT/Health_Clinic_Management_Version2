import mongoose from 'mongoose';

const medicineCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

const MedicineCategory = mongoose.model('MedicineCategory', medicineCategorySchema);

export default MedicineCategory;
