// const twilioService = require("../services/twilioService");
// const {
//   formatPhoneNumber,
//   validatePhoneNumber,
//   generateOTP,
//   verifyOTP,
//   hashOTP,
//   formatOTPMessage,
// } = require("../utils/otpUtils");

// // Store OTPs temporarily (in production, use Redis or similar)
// const otpStore = new Map();

// const sendOTP = async (req, res) => {
//   try {
//     let { phoneNumber } = req.body;

//     if (!validatePhoneNumber(phoneNumber)) {
//       return res.status(400).json({ error: "Invalid phone number format" });
//     }

//     phoneNumber = formatPhoneNumber(phoneNumber);

//     const otp = generateOTP();
//     const message = formatOTPMessage(otp);
//     // const message = `Your verification code is: ${otp}`;
//     console.log(message);

//     const client = twilioService.initializeTwilio();
//     await twilioService.sendSMS(client, phoneNumber, message);

//     // Hash OTP before storing
//     const hashedOTP = await hashOTP(otp);

//     // Store hashed OTP with expiration (5 minutes)
//     otpStore.set(phoneNumber, {
//       hashedOTP,
//       expires: Date.now() + 5 * 60 * 1000,
//     });

//     // Set cleanup timeout
//     setTimeout(() => {
//       otpStore.delete(phoneNumber);
//     }, 5 * 60 * 1000);

//     res.json({ success: true, message: "OTP sent successfully" });
//   } catch (error) {
//     console.error("Error sending OTP:", error);
//     res.status(500).json({ error: "Failed to send OTP" });
//   }
// };

// const verifyOTPHandler = async (req, res) => {
//   try {
//     let { phoneNumber, otp } = req.body;

//     if (!validatePhoneNumber(phoneNumber)) {
//       return res.status(400).json({ error: "Invalid phone number format" });
//     }

//     phoneNumber = formatPhoneNumber(phoneNumber);

//     const isValid = await verifyOTP(otpStore, phoneNumber, otp);

//     if (isValid) {
//       // Clear OTP after successful verification
//       otpStore.delete(phoneNumber);
//       res.json({ success: true, message: "OTP verified successfully" });
//     } else {
//       res.status(400).json({ error: "Invalid or expired OTP" });
//     }
//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     res.status(500).json({ error: "Failed to verify OTP" });
//   }
// };

// module.exports = {
//   sendOTP,
//   verifyOTPHandler,
// };

//new code

const inforuMobileService = require("../services/inforuService");
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
    console.log(message);

    const config = inforuMobileService.initializeInforuMobile();

    // Log the attempt for debugging
    console.log(`Attempting to send OTP to: ${phoneNumber}`);

    await inforuMobileService.sendSMS(config, phoneNumber, message);

    console.log(`OTP sent successfully to: ${phoneNumber}`);

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
    console.error("Error sending OTP:", error.message);

    // Provide more specific error messages to the client
    let errorMessage = "Failed to send OTP";
    let statusCode = 500;

    if (error.message.includes("timeout")) {
      errorMessage = "SMS service temporarily unavailable. Please try again.";
      statusCode = 503;
    } else if (error.message.includes("credentials")) {
      errorMessage = "SMS service configuration error";
      statusCode = 500;
    } else if (error.message.includes("network")) {
      errorMessage = "Network error. Please check your connection.";
      statusCode = 503;
    }

    res.status(statusCode).json({ error: errorMessage });
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
