const cloudinary = require("cloudinary").v2;

const uploadPictures = async (req, res, next) => {
  const filesKey = Object.keys(req.files);
  if (filesKey.length === 0) {
    return res.status(400).json({ message: "No file uploaded !" });
  }

  let results = {};
  for (let i = 0; i < filesKey.length; i++) {
    const result = await cloudinary.uploader.upload(
      req.files[filesKey[i]].path,
      { folder: "vinted" },
      function (error, result) {
        console.log(error, result);
      }
    );
    results[filesKey[i]] = result;
    if (Object.keys(results).length === filesKey.length) {
      req.results = results;
      next();
    }
  }
};

module.exports = uploadPictures;
