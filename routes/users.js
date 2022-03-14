const express = require("express");
const router = express.Router();

const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const cloudinary = require("cloudinary").v2;

const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  console.log("route Sign Up");

  try {
    const doesEmailExist = await User.findOne({ email: req.fields.email });
    if (doesEmailExist) {
      res.status(400).json({ message: "email already exist" });
    } else if (!req.fields.username) {
      res.status(400).json({ message: "please enter a username" });
    } else {
      const password = req.fields.password;
      const salt = uid2(16);
      const hash = SHA256(password + salt).toString(encBase64);
      const token = uid2(16);

      const newUser = new User({
        email: req.fields.email,
        account: {
          username: req.fields.username,
          phone: req.fields.phone,
        },
        token: token,
        hash: hash,
        salt: salt,
      });

      // Add picture
      if (req.files.picture) {
        let pictureToUpload = req.files.picture.path;
        const result = await cloudinary.uploader.upload(
          pictureToUpload,
          { folder: "vinted" },
          function (error, result) {
            console.log(error, result);
          }
        );
        newUser.account.avatar = result;
      }

      await newUser.save();

      res.status(200).json({
        _id: newUser._id,
        token: newUser.token,
        account: newUser.account,
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  console.log("route Log In");

  try {
    const doesEmailExist = await User.findOne({ email: req.fields.email });
    if (!doesEmailExist) {
      res.status(400).json({ message: "Email or password not valid" });
    } else {
      const userHash = await doesEmailExist.hash;
      const password = req.fields.password;
      const hash = SHA256(password + (await doesEmailExist.salt)).toString(
        encBase64
      );
      if (hash === userHash) {
        res.status(200).json({
          _id: doesEmailExist._id,
          token: doesEmailExist.token,
          account: doesEmailExist.account,
        });
      } else {
        res.status(400).json({ message: "Email or password not valid" });
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
