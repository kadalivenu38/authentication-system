import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import { generateOtp, otpSending } from "../utils/otpServices.js";

const Register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({message: "All fields are required."});
    }
    if(!validator.isEmail(email)){
      return res.status(400).json({message: "Invalid email format."});
    }
    if (password.length < 6) {
      return res.status(400).json({message: "Password must be at least 6 characters long."});
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({message: "User registered successfully."});
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({message: "Email already exists."});
    }
    console.error(err);
    return res.status(500).json({message: "Internal Server Error.",});
  }
};


const Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({message: "Email and password are required."});
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({message: "No user found on this email!"});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({message: "Password was Incorrect!"});
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" });
    const username = user.name;
    return res.status(200).json({ message: "Login successful.", token, username });

  } catch (err) {
    console.error(err);
    return res.status(500).json({message: "Internal Server Error."});
  }
};


const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No user registered with this email." });
    }

    if (user.otpExpires && Date.now() < user.otpExpires) {
      return res.status(429).json({message: "OTP already sent. Please wait before requesting again."});
    }

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 90 * 1000);
    user.otp = otp;
    user.otpExpires = otpExpiresAt;
    user.otpVerified = false;
    await user.save();

    await otpSending(email, otp);

    return res.status(200).json({
      message: "OTP sent successfully.",
      expiresAt: otpExpiresAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found on this email!" });
    }
    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({ message: "No OTP request found." });
    }
    if (Date.now() >= user.otpExpires.getTime()) {
      return res.status(400).json({ message: "OTP expired.", time: Date.now() });
    }
    if (otp !== user.otp) {
      return res.status(401).json({ message: "Invalid OTP." });
    }

    // Mark verified
    user.otpVerified = true;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    return res.status(200).json({message: "OTP verified successfully."});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

const resetPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  try {
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({message: "Password must be at least 6 characters long."});
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (!user.otpVerified) {
      return res.status(403).json({message: "OTP verification required before resetting password."});
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({message: "New password cannot be same as old password."});
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otpVerified = false;
    await user.save();

    return res.status(200).json({message: "Password reset successful.",});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

const resetCancel = async (req, res)=>{
    const {email} = req.body;
    if(email){
        const user = await User.findOne({email});
        if(user){
            user.otp = null;
            user.otpExpires = null;
            user.otpVerified = false;
            await user.save();
        }
    }
}

export { Register, Login, forgotPassword, verifyOtp, resetPassword, resetCancel };