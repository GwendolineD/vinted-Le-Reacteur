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
    const numberOfOffersPerPage = 2;
    const allOffers = await Offer.find({
      product_name: new RegExp(req.query.title, "i"),
      product_price: {
        $gte: Number(req.query.priceMin),
        $lte: Number(req.query.priceMax),
      },
    });
    const maximumPages = Math.ceil(allOffers.length / numberOfOffersPerPage);
    const page = Number(req.query.page);

    if (allOffers.length === 0) {
      res.json({ message: "Désolé, aucun résultat trouvé" });
    }

    if (page >= 1 && page <= maximumPages) {
      const offers = await Offer.find({
        product_name: new RegExp(req.query.title, "i"),
        product_price: {
          $gte: Number(req.query.priceMin),
          $lte: Number(req.query.priceMax),
        },
      })
        .select("product_name product_price")
        .limit(numberOfOffersPerPage)
        .skip(numberOfOffersPerPage * (page - 1))
        .sort({ product_price: req.query.sort.split("-")[1] });

      res.json({
        results: `${allOffers.length} résultat(s) trouvé(s)`,
        offers,
        maximumPages,
      });
    } else {
      res.status(400).json({ message: "page not valid" });
    }
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
