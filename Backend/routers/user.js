const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.get(`/`, async (req, res) => {
  const userList = await User.find().select("-passwordHash");

  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.send(userList);
});

router.get(`/:id`, async (req, res) => {
  const userList = await User.findById(req.params.id).select("-passwordHash");

  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.send(userList);
});
router.post(`/register`, async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    appartment: req.body.appartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });

  user = await user.save();
  if (!user) return res.status(400).send("User Cannot be Created!");
  res.send(user);
});

router.post(`/login`, async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("User Cannot Found!");
  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const secretToken = process.env.secret;
    const token = jwt.sign(
      {
        user: user.id,
        isAdmin: user.isAdmin,
      },
      secretToken,
      { expiresIn: "1d" }
    );
    return res
      .status(200)
      .send({ email: user.email, msg: "User Authenticated", token: token });
  } else {
    return res.status(400).send("Incorrect Password!");
  }
});

router.get(`/get/count`, async (req, res) => {
  const userCount = await User.countDocuments();
  if (!userCount) {
    res.status(500).json({ success: flase });
  }
  res.send({ userCount: userCount });
});

router.delete("/:id", (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((User) => {
      if (User) {
        return res.status(200).json({ success: true, message: "User delete" });
      } else {
        return res
          .status(401)
          .json({ success: false, message: "User not delete" });
      }
    })
    .catch((error) => {
      return res.status(400).json({ success: false, error: error });
    });
});
module.exports = router;
