const mongoose = require("mongoose");

// product Schema
const orderItemSchema = mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
});

exports.OrderItems = mongoose.model("OrderItems", orderItemSchema);
