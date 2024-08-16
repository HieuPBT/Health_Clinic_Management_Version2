import mongoose from 'mongoose';
import dotenv from 'dotenv'
dotenv.config();

const connectDB = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
    return db;
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;
