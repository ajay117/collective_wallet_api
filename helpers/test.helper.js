const bcrypt = require("bcrypt");
const User = require("../models/User.model");

const createHashedPassword = (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

const usersInDB = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

module.exports = { createHashedPassword, usersInDB };
