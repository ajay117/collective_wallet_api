const mongoose = require("mongoose");
const User = require("../models/User.model");
const ExpenseCategory = require("../models/ExpenseCategory.model");

const groupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true,
  },
  admin: [],
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ], // We will store user id and user name inside the array as a object
  expenses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExpenseCategory",
    },
  ], //We will store references of expenses
});

groupSchema.set("toJSON", {
  transform: (doc, returnedDoc) => {
    returnedDoc.id = returnedDoc._id.toString();
    delete returnedDoc._id;
    delete returnedDoc.__v;
    return returnedDoc;
  },
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
