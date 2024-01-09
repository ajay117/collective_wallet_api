// const mongoose = require("mongoose");
// const IndividualExpense = require("./IndividualExpense.model");

// const expensePerMonth = new mongoose.Schema({
//   month: Date,
//   allExpenseData: [IndividualExpense],
// });

// expensePerMonth.set("toJSON", {
//   transform: (doc, returnedDoc) => {
//     returnedDoc.id = returnedDoc._id.toString();
//     delete returnedDoc._id;
//     delete returnedDoc.__v;
//     return returnedDoc;
//   },
// });

// const ExpensePerMonth = mongoose.model("ExpensePerMonth", expensePerMonth);

// // module.exports = ExpensePerMonth;
