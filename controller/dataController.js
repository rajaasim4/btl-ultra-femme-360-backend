const User = require("../models/User");

// Send data - Create a new user
const sendData = async (req, res) => {
  try {
    const {
      fullName,
      stepTwo,
      stepThree,
      stepFour,
      stepFive,
      stepSix,
      stepSeven,

      phoneNumber,
      pageUrl,
      status,
      isSendToZapier,
    } = req.body;

    const userExists = await User.findOne({ phoneNumber });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = await User.create({
      fullName,
      stepTwo,
      stepThree,
      stepFour,
      stepFive,
      stepSix,
      stepSeven,

      phoneNumber,
      pageUrl,
      status: status || false,
      isSendToZapier: isSendToZapier || false,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        otpVerified: user.otpVerified,
        status: user.status,
        createdAt: user.createdAt,
        pageUrl: user.pageUrl,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user data
const updateData = async (req, res) => {
  try {
    // const { phoneNumber } = req.params;
    const { status, phoneNumber, isSendToZapier } = req.body;
    const user = await User.findOne({ phoneNumber });
    console.log("this user recieved in backend", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.status = status !== undefined ? status : user.status;
    user.isSendToZapier =
      isSendToZapier !== undefined ? isSendToZapier : user.isSendToZapier;

    // Save updated user
    const updatedUser = await user.save();

    res.status(200).json({
      status: updatedUser.status,
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user data
const getData = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      stepTwo: user.stepTwo,
      stepThree: user.stepThree,
      stepFour: user.stepFour,
      stepFive: user.stepFive,
      stepSix: user.stepSix,
      stepSeven: user.stepSeven,

      phoneNumber: user.phoneNumber,
      otpVerified: user.otpVerified,
      status: user.status,
      createdAt: user.createdAt,
      pageUrl: user.pageUrl,
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { sendData, updateData, getData, getAllUsers };
