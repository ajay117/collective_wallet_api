const mongoose = require("mongoose");
// const ExpensePerMonth = require("./ExpensePerMonth.model");
// const IndividualExpense = require("./IndividualExpense.model");

const expense = new mongoose.Schema({
  year: Number,
  expensePerMonth: {},
});

expense.set("toJSON", {
  transform: (doc, returnedDoc) => {
    returnedDoc.id = returnedDoc._id.toString();
    delete returnedDoc._id;
    delete returnedDoc.__v;
    return returnedDoc;
  },
});

const Expense = mongoose.model("Expense", expense);

module.exports = Expense;
