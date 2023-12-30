const bcrypt = require("bcrypt");
const User = require("../models/User.model");
const Group = require("../models/Group.model");

const createHashedPassword = (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

const usersInDB = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

const groupsInDB = async () => {
  const groups = await Group.find({});
  return groups.map((group) => group.toJSON());
};

module.exports = { createHashedPassword, usersInDB, groupsInDB };
