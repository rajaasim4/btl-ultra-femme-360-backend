const twilioService = require("../services/twilioService");
const {
  formatPhoneNumber,
  validatePhoneNumber,
  generateOTP,
  verifyOTP,
  hashOTP,
  formatOTPMessage,
} = require("../utils/otpUtils");

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map();

const sendOTP = async (req, res) => {
  try {
    let { phoneNumber } = req.body;

    if (!validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }

    phoneNumber = formatPhoneNumber(phoneNumber);

    const otp = generateOTP();
    const message = formatOTPMessage(otp);
    // const message = `Your verification code is: ${otp}`;
    console.log(message);

    const client = twilioService.initializeTwilio();
    await twilioService.sendSMS(client, phoneNumber, message);

    // Hash OTP before storing
    const hashedOTP = await hashOTP(otp);

    // Store hashed OTP with expiration (5 minutes)
    otpStore.set(phoneNumber, {
      hashedOTP,
      expires: Date.now() + 5 * 60 * 1000,
    });

    // Set cleanup timeout
    setTimeout(() => {
      otpStore.delete(phoneNumber);
    }, 5 * 60 * 1000);

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

const verifyOTPHandler = async (req, res) => {
  try {
    let { phoneNumber, otp } = req.body;

    if (!validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }

    phoneNumber = formatPhoneNumber(phoneNumber);

    const isValid = await verifyOTP(otpStore, phoneNumber, otp);

    if (isValid) {
      // Clear OTP after successful verification
      otpStore.delete(phoneNumber);
      res.json({ success: true, message: "OTP verified successfully" });
    } else {
      res.status(400).json({ error: "Invalid or expired OTP" });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};

module.exports = {
  sendOTP,
  verifyOTPHandler,
};
