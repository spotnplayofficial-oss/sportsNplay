import nodemailer from "nodemailer";

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded ✅" : "Missing ❌");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"PLAYNSPORTS" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your PLAYNSPORTS OTP",
      html: `<h2>Your OTP is ${otp}</h2>`,
    });

    console.log("OTP email sent ✅");
  } catch (error) {
    console.error("Email send error:", error);
    throw new Error("Email sending failed");
  }
};

export default sendOTPEmail;