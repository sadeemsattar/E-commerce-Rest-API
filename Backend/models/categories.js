const mongoose = require("mongoose");

// product Schema
const categoriesSchema = mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String },
  color: { type: String },
});

exports.Categories = mongoose.model("Categories", categoriesSchema);
