const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const otpRoutes = require("./routes/otpRoutes");
const connectDB = require("./config/connectDB");
connectDB();
dotenv.config();
const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "https://betterlife.lp.ba-media.co.il/",
];

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

// Routes
app.use("/api", otpRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
