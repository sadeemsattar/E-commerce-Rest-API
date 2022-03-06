const { Order } = require("../models/order");
const { OrderItems } = require("../models/orderItem");
const express = require("express");
const router = express.Router();

router.get(`/`, async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "name")
    .sort({ dateOrder: -1 });

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});
router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name")
    .populate({ path: "orderItems", populate: "product" });
  if (!order) {
    res.status(500).json({ success: false });
  }
  res.send(order);
});
router.put(`/:id`, async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );
  if (!order) {
    return res.status(500).json({ success: false });
  }
  return res.status(200).send(order);
});

router.post(`/`, async (req, res) => {
  const orderItemIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItems({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });
      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );
  const orderItemIdsResolved = await orderItemIds;
  const totalOrderPrices = await Promise.all(
    orderItemIdsResolved.map(async (orderItemId) => {
      const orderItem = await OrderItems.findById(orderItemId).populate(
        "product",
        "price"
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );
  const totalOrderPrice = totalOrderPrices.reduce((a, b) => a + b, 0);
  let order = new Order({
    orderItems: orderItemIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalOrderPrice,
    user: req.body.user,
  });

  order = await order.save();

  if (!order) return res.status(404).send("order Not Created");

  res.status(200).send(order);
});
router.delete("/:id", (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItemId) => {
          await OrderItems.findByIdAndRemove(orderItemId);
        });
        return res.status(200).json({ success: true, message: "Order delete" });
      } else {
        return res
          .status(401)
          .json({ success: false, message: "Order not delete" });
      }
    })
    .catch((error) => {
      return res.status(400).json({ success: false, error: error });
    });
});
router.get(`/get/totalSales`, async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
  ]);
  if (!totalSales) return res.status(404).send("TotalSales Not Created");

  res.status(200).send({ Totalsales: totalSales.pop().totalsales });
});
router.get(`/get/count`, async (req, res) => {
  const orderCount = await Order.countDocuments();
  if (!orderCount) {
    res.status(500).json({ success: flase });
  }
  res.send({ orderCount: orderCount });
});

module.exports = router;
