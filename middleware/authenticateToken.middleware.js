const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.JSON_WEB_TOKEN_SECRET_KEY, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    // console.log("user from auth: ", user);
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
