import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicineCategory',
    required: true
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
  }
}, {
  timestamps: true
});

const Medicine = mongoose.model('Medicine', medicineSchema);

export default Medicine;
