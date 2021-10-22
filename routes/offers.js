const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

const Offer = require("../models/Offer");
const isAuthenticated = require("../middleware/isAuthenticated");

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    let pictureToUpload = req.files.picture.path;
    const result = await cloudinary.uploader.upload(
      pictureToUpload,
      { folder: "vinted" },
      function (error, result) {
        console.log(error, result);
      }
    );

    const newOffer = new Offer({
      product_name: req.fields.title,
      product_description: req.fields.description,
      product_price: req.fields.price,
      product_details: [
        { MARQUE: req.fields.brand },
        { TAILLE: req.fields.size },
        { ETAT: req.fields.condition },
        { COULEUR: req.fields.color },
        { EMPLACEMENT: req.fields.city },
      ],
      product_image: result,
      owner: req.user,
    });
    await newOffer.save();
    res.json(newOffer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offers", async (req, res) => {
  try {
    let filter = {};
    if (req.query.title) {
      filter.product_name = req.query.title;
    }
    if (req.query.priceMin) {
      filter.product_price = { $gte: req.query.priceMin };
    }
    if (req.query.priceMax) {
      if (req.query.priceMin) {
        filter.product_price.$lte = req.query.priceMax;
      } else {
        filter.product_price = { $lte: req.query.priceMax };
      }
    }

    let sortChoice = { product_price: "asc" };
    if (req.query.sort === "price_desc") {
      sortChoice.product_price = "desc";
    }

    let limit = 5;
    if (req.query.limit) {
      limit = Number(req.query.limit);
    }

    let page = 1;
    if (req.query.page) {
      page = Number(req.query.page);
    }

    const result = await Offer.find(filter)
      .sort(sortChoice)
      .limit(limit)
      .skip((page - 1) * limit)
      .select("product_name product_price");
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offerById = await Offer.findById(req.params.id);
    res.json(offerById);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
