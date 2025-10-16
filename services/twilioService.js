const twilio = require("twilio");

const initializeTwilio = () => {
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
};

const sendSMS = async (client, to, message) => {
  try {
    await client.messages.create({
      body: message,
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
    });
  } catch (error) {
    console.error("Twilio SMS Error:", error);
    throw new Error("Failed to send SMS");
  }
};

module.exports = {
  initializeTwilio,
  sendSMS,
};
