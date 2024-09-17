import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { handleRegisterFirebase, updatePasswordFirebase } from '../utils/firebase.js';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  role: { type: String, enum: ['admin', 'patient', 'doctor', 'nurse'], default: 'patient' },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
  dateOfBirth: Date,
  phoneNumber: String,
  address: String,
  avatar: String,
  isActive: { type: Boolean, default: true },
  isStaff: { type: Boolean, default: false },
  tokens: [{ token: { type: String, required: true } }]
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  handleRegisterFirebase(this.email, this.password, this.fullName, this.avatar);
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

userSchema.pre('updateOne', async function () {
  const update = this.getUpdate();
  if (update.password) {
    update.password = await bcrypt.hash(update.password, 8);
  }
});

userSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET);
  this.tokens = this.tokens.concat({ token });
  await this.save();
  return token;
};

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.tokens;
  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User;
