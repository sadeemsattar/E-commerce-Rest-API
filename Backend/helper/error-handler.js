function errorHandler(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ msg: "The User Is Not Authorized" });
  }
  if (err.name === "ValidationError") {
    return res.status(401).json({ msg: err });
  }
  res.status(500).json("Error In Server");
}

module.exports = errorHandler;
