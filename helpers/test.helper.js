const bcrypt = require("bcrypt");

function createHashedPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

module.exports = { createHashedPassword };
