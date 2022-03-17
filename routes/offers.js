const express = require("express");
const router = express.Router();

const Offer = require("../models/Offer");
const isAuthenticated = require("../middleware/isAuthenticated");
const uploadPictures = require("../middleware/uploadPictures");

router.post(
  "/offer/publish",
  isAuthenticated,
  uploadPictures,
  async (req, res) => {
    console.log("route Publish");

    const { title, description, price, brand, size, condition, color, city } =
      req.fields;

    if (
      title &&
      description &&
      price &&
      brand &&
      size &&
      condition &&
      color &&
      city
    ) {
      try {
        const newOffer = new Offer({
          product_name: title,
          product_description: description,
          product_price: price,
          product_details: [
            { MARQUE: brand },
            { TAILLE: size },
            { ETAT: condition },
            { COULEUR: color },
            { EMPLACEMENT: city },
          ],
          product_image: req.results,
          owner: req.user,
        });

        await newOffer.save();

        res.status(200).json(newOffer);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    } else {
      res.status(406).json({ message: "Veuillez remplir tous les champs." });
    }
  }
);

router.get("/offers", async (req, res) => {
  console.log("route Offers");

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
        select: "account",
      })
      .sort(sortChoice)
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  console.log("route Offer");

  try {
    const offerById = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account",
    });

    res.status(200).json(offerById);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//test delete pict by publi._id
// router.get("/deletepict", async (req, res) => {
//   console.log("route delete pict");

//   try {
//     const resultDeletePicture = await cloudinary.api.delete_resources(
//       "vinted/xxfakesg8zcdl4t8pdus",
//       function (error, result) {
//         console.log(result, error, "<<<<<<error");
//       }
//     );

//     console.log(resultDeletePicture, "<<<<<resultDeletePicture");
//     res.json("deleted");
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

module.exports = router;
