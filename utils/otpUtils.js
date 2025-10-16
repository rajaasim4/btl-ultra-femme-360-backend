const bcrypt = require("bcrypt");

// Valid Israeli mobile phone prefixes
const MOBILE_PREFIXES = [
  "050",
  "051",
  "052",
  "053",
  "054",
  "055",
  "056",
  "058",
  "059",
];

/**
 * Validates an Israeli mobile phone number
 * @param {string} phoneNumber - The phone number to validate
 * @returns {boolean} - Whether the phone number is valid
 */
const validatePhoneNumber = (phoneNumber) => {
  // Remove any non-digit characters and '+' symbol
  const cleanNumber = phoneNumber.replace(/[^\d+]/g, "");

  // Check if the number starts with 0
  if (cleanNumber.startsWith("0")) {
    // For numbers starting with 0, should be 10 digits total
    if (cleanNumber.length !== 10) return false;
    // Check if the prefix is valid
    return MOBILE_PREFIXES.some((prefix) => cleanNumber.startsWith(prefix));
  }

  // For international format (+972)
  if (cleanNumber.startsWith("972") || cleanNumber.startsWith("+972")) {
    const withoutPlus = cleanNumber.replace("+", "");
    // Should be 12 digits total (972 + 9 digits)
    if (withoutPlus.length !== 12) return false;
    // Remove 972 and check if the remaining number starts with a valid prefix
    const withoutCountryCode = withoutPlus.substring(3);
    return MOBILE_PREFIXES.some((prefix) =>
      withoutCountryCode.startsWith(prefix.substring(1))
    );
  }

  return false;
};

/**
 * Formats a phone number to E.164 format for Twilio
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - Formatted phone number
 */
const formatPhoneNumber = (phoneNumber) => {
  // Remove any non-digit characters and '+' symbol
  const cleanNumber = phoneNumber.replace(/[^\d+]/g, "");

  // If already in international format
  if (cleanNumber.startsWith("972")) {
    return `+${cleanNumber}`;
  }

  // If starts with +972
  if (cleanNumber.startsWith("+972")) {
    return cleanNumber;
  }

  // If starts with 0, convert to international format
  if (cleanNumber.startsWith("0")) {
    return `+972${cleanNumber.substring(1)}`;
  }

  throw new Error("Invalid phone number format");
};

/**
 * Generates a 6-digit OTP
 * @returns {string} - Generated OTP
 */
const generateOTP = () => {
  let otp = Math.floor(1000 + Math.random() * 9000).toString();
  return otp;
};

/**
 * Hashes an OTP for secure storage
 * @param {string} otp - The OTP to hash
 * @returns {Promise<string>} - Hashed OTP
 */
const hashOTP = async (otp) => {
  const saltRounds = 10;
  return await bcrypt.hash(otp.toString(), saltRounds);
};

/**
 * Compares a plain OTP with a hashed OTP
 * @param {string} plainOTP - The plain OTP to verify
 * @param {string} hashedOTP - The hashed OTP to compare against
 * @returns {Promise<boolean>} - Whether the OTPs match
 */
const compareOTP = async (plainOTP, hashedOTP) => {
  return await bcrypt.compare(plainOTP.toString(), hashedOTP);
};

/**
 * Verifies an OTP submission
 * @param {Map} otpStore - The storage for OTPs
 * @param {string} phoneNumber - The phone number to verify
 * @param {string} submittedOTP - The OTP submitted by the user
 * @returns {Promise<boolean>} - Whether the OTP is valid
 */
const verifyOTP = async (otpStore, phoneNumber, submittedOTP) => {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const storedData = otpStore.get(formattedPhone);

  if (!storedData) {
    return false;
  }

  const { hashedOTP, expires } = storedData;

  if (Date.now() > expires) {
    otpStore.delete(formattedPhone);
    return false;
  }

  const isValid = await compareOTP(submittedOTP, hashedOTP);

  // Clean up OTP after successful verification
  if (isValid) {
    otpStore.delete(formattedPhone);
  }

  return isValid;
};

/**
 * Formats the OTP message for Twilio
 * @param {string} otp - The OTP to send
 * @returns {string} - Formatted message
 */
const formatOTPMessage = (otp) => {
  return `Your verification code is: ${otp}. This code will expire in 5 minutes.`;
};

module.exports = {
  validatePhoneNumber,
  formatPhoneNumber,
  generateOTP,
  hashOTP,
  compareOTP,
  verifyOTP,
  formatOTPMessage,
};
