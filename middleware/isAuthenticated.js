const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    const doesTokenExist = await User.findOne({
      token: token.replace("Bearer ", ""),
    }).select("account _id");
    console.log(doesTokenExist);
    if (doesTokenExist) {
      req.user = doesTokenExist;
      next();
    } else {
      return res.status(401).json({ message: "unauthorized" });
    }
  } else {
    return res.status(401).json({ message: "unauthorized" });
  }
};

module.exports = isAuthenticated;
