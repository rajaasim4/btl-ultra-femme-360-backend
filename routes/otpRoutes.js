const express = require("express");
const router = express.Router();
const { sendOTP, verifyOTPHandler } = require("../controller/otpController");
const {
  sendData,
  updateData,
  getData,
  getAllUsers,
} = require("../controller/dataController");

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTPHandler);
router.post("/send-data", sendData);
router.put("/update-data", updateData);
// router.put("/update-data/:id", updateData);
router.get("/get-data/:id", getData);
router.get("/get-all-users", getAllUsers);
router.get("/", (req, res) => {
  res.status(200).send("Hello");
});

module.exports = router;
