const mongoose = require("mongoose");

const expenseCategorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  list: [
    //Sample below data will be embedded
    // {
    //   date: "22/10/2023",
    //   paidBy: {
    //     id: 0,
    //     username: "Ajay KC",
    //   },
    //   amount: 100000,
    //   item: "vegetables",
    // },
  ],
});

const ExpenseCategory = mongoose.model(
  "ExpenseCategory",
  expenseCategorySchema
);

module.exports = ExpenseCategory;
