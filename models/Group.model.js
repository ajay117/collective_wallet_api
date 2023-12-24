const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: String,
  // admin: here will store reference of one user,
  members: [], // will store  references of user
  expenses: [],
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
