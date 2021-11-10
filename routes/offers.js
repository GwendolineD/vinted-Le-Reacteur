const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

const Offer = require("../models/Offer");
const isAuthenticated = require("../middleware/isAuthenticated");
const uploadPictures = require("../middleware/uploadPictures");

router.post(
  "/offer/publish",
  isAuthenticated,
  uploadPictures,
  async (req, res) => {
    try {
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
        product_image: req.results,
        owner: req.user,
      });
      await newOffer.save();
      res.json(newOffer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    let filter = {};
    if (req.query.title) {
      filter.product_name = new RegExp(req.query.title, "i");
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

    let limit = 20;
    if (req.query.limit) {
      limit = Number(req.query.limit);
    }

    let page = 1;
    if (req.query.page) {
      page = Number(req.query.page);
    }

    const result = await Offer.find(filter)
      .populate({
        path: "owner",
        select: "account.username account.phone account.avatar",
      })
      .sort(sortChoice)
      .limit(limit)
      .skip((page - 1) * limit);
    // .select(
    //   "product_name product_price product_description product_price product_details product_image owner"
    // );
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offerById = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account.username account.phone account.avatar",
    });
    res.json(offerById);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
