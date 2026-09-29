import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.App_Email,
    pass: process.env.App_Password,
  },
});

export const otpSending = async (email, otp)=>{
    await transporter.sendMail({
        from: process.env.App_Email,
        to: email,
        subject: 'OTP code for Forgot-password verification: ',
        html: `<h3>Your OTP Code: ${otp}</h3> <p>It is valid for 1 minute 30 seconds only!</p>`
    });
}

export const generateOtp = ()=>{
    return Math.floor(100000 + Math.random() * 900000).toString();
};