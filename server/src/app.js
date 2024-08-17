import express from 'express';
import connectDB from './config/connectDB.js';
import morgan from 'morgan'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import { adminJs, router } from './config/admin.js';
import dotenv from 'dotenv';
import session from 'express-session';
dotenv.config();

const port = process.env.PORT || 8888;
const app = express();

connectDB();

// app.use(formidableMiddleware());
app.use(morgan('combined'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 3600000
    }
}))

//CORS
const corsOptions = {
    origin: process.env.FRONTEND_URL,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(adminJs.options.rootPath, router)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/medicine', medicineRoutes);
app.use('/api/prescription', prescriptionRoutes);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})
