const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post("/payment", async (req, res) => {
  console.log("route Payment");

  try {
    const stripeToken = req.fields.stripeToken;

    const stripeResponse = await stripe.charges.create({
      amount: req.fields.amount,
      currency: "eur",
      description: req.fields.description,
      source: stripeToken,
    });

    // console.log(stripeResponse);

    res.status(200).json(stripeResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
