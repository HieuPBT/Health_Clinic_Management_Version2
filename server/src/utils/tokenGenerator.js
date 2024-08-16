import jwt from 'jsonwebtoken';

export const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

export const generateVerificationToken = (userId) => {
    return jwt.sign({ userId }, process.env.EMAIL_SECRET, { expiresIn: '1d' });
};
