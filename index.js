require("dotenv").config();
const express = require("express");
const expressFormidable = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(expressFormidable());
app.use(cors());

mongoose.connect(process.env.MONGO_DB_URI || "mongodb://localhost/vinted");

app.get("/", (req, res) => {
  res.json("Welcome to Gwendoline's Vinted !! 😃 🚀 ");
});

const usersRoutes = require("./routes/users");
app.use(usersRoutes);

const offersRoutes = require("./routes/offers");
app.use(offersRoutes);

const paymentRoutes = require("./routes/payment");
app.use(paymentRoutes);

app.all("*", (req, res) => {
  res.status(400).json({ message: "route not found" });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server has started ! 🤓");
});
