const { Categories } = require("../models/categories");
const express = require("express");
const router = express.Router();

router.get(`/`, async (req, res) => {
  const categoriesList = await Categories.find();

  if (!categoriesList) {
    return res.status(500).json({ success: false });
  }
  return res.status(200).send(categoriesList);
});

router.get(`/:id`, async (req, res) => {
  const category = await Categories.findById(req.params.id);

  if (!category) {
    return res.status(500).json({ success: false });
  }
  return res.status(200).send(category);
});

router.put(`/:id`, async (req, res) => {
  const category = await Categories.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    },
    { new: true }
  );
  if (!category) {
    return res.status(500).json({ success: false });
  }
  return res.status(200).send(category);
});

router.post("/", async (req, res) => {
  let category = new Categories({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });

  category = await category.save();

  if (!category) return res.status(404).send("Category Not Created");

  res.status(200).send(category);
});

router.delete("/:id", (req, res) => {
  Categories.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .json({ success: true, message: "category delete" });
      } else {
        return res
          .status(401)
          .json({ success: false, message: "category not delete" });
      }
    })
    .catch((error) => {
      return res.status(400).json({ success: false, error: error });
    });
});
module.exports = router;
