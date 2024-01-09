const mongoose = require("mongoose");

const individualExpense = new mongoose.Schema({
  timeStamp: Date,
  paidBy: {
    id: String,
    username: String,
  },
  amount: Number,
  item: {
    type: String,
    min: [5, "Should be greater or equal to 5"],
    max: 8,
  },
});

individualExpense.set("toJSON", {
  transform: (doc, returnedDoc) => {
    returnedDoc.id = returnedDoc._id.toString();
    delete returnedDoc._id;
    delete returnedDoc.__v;
    return returnedDoc;
  },
});

const IndividualExpense = mongoose.model("IndividualExpense", individualExpense);

module.exports = IndividualExpense;
