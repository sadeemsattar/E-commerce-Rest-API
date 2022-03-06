const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const authJwt = require("./helper/jwt");
const errorHandler = require("./helper/error-handler");
const app = express();
require("dotenv/config");
app.use(cors());
app.options("*", cors());
const api = process.env.API_URL;

// middleware
app.use(express.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use(errorHandler);
app.use("/public/upload", express.static(__dirname + "/public/uploads"));
// routes
const productRouter = require("./routers/product");
const userRouter = require("./routers/user");
const orderRouter = require("./routers/order");
const categoriesRouter = require("./routers/categories");

app.use(`${api}/products`, productRouter);
app.use(`${api}/users`, userRouter);
app.use(`${api}/orders`, orderRouter);
app.use(`${api}/categories`, categoriesRouter);

// database connection
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: process.env.DB_NAME,
  })
  .then(() => {
    console.log("Database is Connected");
  })
  .catch((err) => {
    console.log("Error In Connecting... to Database", err);
  });

// server

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(api);
  console.log("Server Is Running on http://localhost:3000");
});
