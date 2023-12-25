const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: String,
  // admin: here will store reference of one user,
  members: [], // We will store user id and user name inside the array as a object
  expenses: [], //We will store references of expenses
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
