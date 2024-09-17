import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import cloudinary from '../config/cloudinary.js'
import { sendNewpasswordEmail, sendVerificationEmail } from '../utils/email.js'
import { generateAccessToken, generateVerificationToken } from '../utils/tokenGenerator.js'
import Patient from '../models/Patient.js'
import getVerificationTemplate from '../emailTemplates/verificationTemplate.js'
import generatePassword from '../utils/generatePassword.js'
import { updatePasswordFirebase } from '../utils/firebase.js'

export const register = async (req, res) => {
    console.log(req.body)
    const {
        email,
        password,
        fullName,
        gender,
        dateOfBirth,
        phoneNumber,
        address,
        healthInsurance
    } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        let avatarUrl = null;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            avatarUrl = result.secure_url;
        }

        user = new User({
            email,
            password,
            fullName,
            role: 'patient',
            gender,
            dateOfBirth,
            phoneNumber,
            address,
            avatar: avatarUrl,
            isActive: false
        });

        await user.save();

        // Create Patient record if role is 'patient'
        const patient = new Patient({
            user: user._id,
            healthInsurance
        });
        await patient.save();

        // Generate verification token
        const verificationToken = generateVerificationToken(user._id);

        const verificationLink = `${process.env.BACKEND_URL}/api/auth/verify-email/${verificationToken}`;

        await sendVerificationEmail(user.email, verificationLink);
        const payload = {
            user: {
                id: user.id,
                role: user.role
            },
        };

        let token = generateAccessToken(payload);
        res.json({ token, msg: 'Registration successful. Please check your email to verify your account.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

export const getNewActivateLink = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email: email });
        if (user) {
            const verificationToken = generateVerificationToken(user._id);

            const verificationLink = `${process.env.BACKEND_URL}/api/auth/verify-email/${verificationToken}`;

            await sendVerificationEmail(email, verificationLink);
        }
        res.status(200).send('Verification email sent')
    } catch (err) {
        console.error(err.message);
    };
};

export const verifyEmail = async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, process.env.EMAIL_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.send(getVerificationTemplate(false, 'User not found. Please try registering again.'));
        }

        if (user.isActive) {
            return res.send(getVerificationTemplate(true, 'Your email is already verified. You can now log in to your account.'));
        }
        await User.updateOne({ _id: user._id }, { isActive: true });

        res.send(getVerificationTemplate(true, 'Your email has been successfully verified. You can now log in to your account.'));
    } catch (err) {
        console.error(err.message);
        res.send(getVerificationTemplate(false, 'Invalid or expired verification link. Please try registering again.'));
    }
};


export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials 1' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials 2' });
        }

        const payload = {
            id: user.id,
            role: user.role
        };

        let token = generateAccessToken(payload);
        res.json({ token });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

export const getNewPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng với email này' });
    }

    const newPassword = generatePassword();


    await User.updateOne({ _id: user._id }, { password: newPassword });

    try {
        await sendNewpasswordEmail(user.email, user.fullName, newPassword);
        res.json({ message: 'Mật khẩu mới đã được gửi đến email của bạn' });
    } catch (error) {
        console.error('Lỗi khi gửi email:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi gửi email' });
    }
};

export const checkEmail = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        res.json({ available: !user });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    await User.updateOne({ _id: user._id }, { password: newPassword });
    await updatePasswordFirebase(user.email, currentPassword, newPassword);

    res.status(200).json({ message: 'Mật khẩu đã được thay đổi thành công' });
};
