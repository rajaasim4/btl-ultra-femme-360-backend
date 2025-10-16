const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  stepTwo: {
    type: String,
    default: "",
  },
  stepThree: {
    type: String,
    default: "",
  },
  stepFour: {
    type: String,
    default: "",
  },
  stepFive: {
    type: String,
    default: "",
  },
  stepSix: {
    type: String,
    default: "",
  },
  stepSeven: {
    type: String,
    default: "",
  },

  phoneNumber: {
    type: String,
    required: true,
  },
  otpVerified: {
    type: Boolean,
    default: false,
  },
  status: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: String,
    default: Date.now,
  },
  pageUrl: {
    type: String,
    default: "",
  },
  isSendToZapier: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Users", userSchema);
