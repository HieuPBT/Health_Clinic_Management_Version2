import nodemailer from 'nodemailer';
import verifyEmailTemplate from '../emailTemplates/verifyEmail.js';
import newPasswordEmail from '../emailTemplates/newPasswordEmail.js';
import appointmentConfirmationEmail from '../emailTemplates/appointmentConfirmation.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendPrescriptionEmail = async (email, pdfStream) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Lộc Hiếu Clinic Gửi PDF Toa Thuốc',
        text: 'Chúng tôi gửi bạn toa thuốc.',
        attachments: [
            {
                filename: 'toa_thuoc.pdf',
                content: pdfStream
            }
        ]
    };

    await transporter.sendMail(mailOptions);
};

export const sendVerificationEmail = async (email, verificationLink) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Lộc Hiếu Health Clinic Yêu Cầu Xác Thực Địa Chỉ Email',
        html: verifyEmailTemplate(verificationLink)
    };

    await transporter.sendMail(mailOptions);
};

export const sendNewpasswordEmail = async (email, fullName, newPassword) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Vui lòng bảo mật email này!',
        html: newPasswordEmail(fullName, newPassword)
    };
    await transporter.sendMail(mailOptions);
};

export const sendConfirmationEmail = async (email, fullName, isConfirmed, department, bookingDate, bookingTime, rejectionReason) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: isConfirmed ? 'Cuộc hẹn của bạn đã được xác nhận' : 'Cuộc hẹn của bạn đã bị từ chối',
        html: appointmentConfirmationEmail(fullName, isConfirmed, department, bookingTime, bookingDate, rejectionReason)
    };
    await transporter.sendMail(mailOptions);
};
