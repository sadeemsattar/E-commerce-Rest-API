const { Product } = require("../models/product");
const { Categories } = require("../models/categories");
const express = require("express");
const router = express.Router();
const mangoose = require("mongoose");
const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid Image Type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  const productList = await Product.find(filter);
  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});

router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});

router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  const category = await Categories.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");
  const file = req.file;
  if (!file) return res.status(400).send("Please Select File");
  const fileName = req.file.filename;

  const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;
  let newProduct = new Product({
    name: req.body.name,
    description: req.body.description,
    richdesciption: req.body.richdesciption,
    image: `${basePath}${fileName}`,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
    dateCreated: req.body.dateCreated,
  });

  newProduct = await newProduct.save();
  if (!newProduct) {
    return res
      .status(500)
      .json({ success: false, msg: "Product Cannot Added" });
  }
  return res.status(200).send(newProduct);
});

router.put(`/:id`, async (req, res) => {
  if (!mangoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Product Id");
  }
  const category = await Categories.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const product = await Product.findById(req.body.id);
  if (!product) return res.status(400).send("Invalid Product");

  const file = req.file;
  let imagePath;
  if (file) {
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;
    imagePath = `${basePath}${fileName}`;
  } else {
    imagePath = product.image;
  }

  const newProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richdesciption: req.body.richdesciption,
      image: imagePath,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
      dateCreated: req.body.dateCreated,
    },
    { new: true }
  );
  if (!newProduct) return res.status(500).send("Product Cannot Update ");
  res.status(200).send(newProduct);
});

router.delete("/:id", (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((Product) => {
      if (Product) {
        return res
          .status(200)
          .json({ success: true, message: "Product delete" });
      } else {
        return res
          .status(401)
          .json({ success: false, message: "Product not delete" });
      }
    })
    .catch((error) => {
      return res.status(400).json({ success: false, error: error });
    });
});

router.get(`/get/count`, async (req, res) => {
  const productCount = await Product.countDocuments();
  if (!productCount) {
    res.status(500).json({ success: flase });
  }
  res.send({ productCount: productCount });
});

router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const product = await Product.find({ isFeatured: true }).limit(+count);
  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send({ product });
});

router.put(
  "/gallery-images/:id",
  uploadOptions.array("images", 10),
  async (req, res) => {
    if (!mangoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid Product Id");
    }

    const files = req.files;

    let imagesPaths = [];
    let path = "";
    const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;
    if (files) {
      files.map((file) => {
        path = `${basePath}${file.filename}`;
        imagesPaths.push(path);
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      { new: true }
    );
    if (!product) {
      res.status(500).json({ success: false });
    }
    res.send({ product });
  }
);
module.exports = router;
