function errorHandler(err, req, res, next) {
  console.log("Error from middleware", err);
  if (err.name === "ValidationError") {
    console.log(err.message);
    res.status(500).json("Username must be unique");
  }
  next(err);
}

module.exports = errorHandler;
