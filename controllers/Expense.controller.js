const express = require("express");
const router = express.Router();
const IndividualExpense = require("../models/IndividualExpense.model");
const Expense = require("../models/Expense.model");
const authenticateToken = require("../middleware/authenticateToken.middleware");
const Group = require("../models/Group.model");

const monthList = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

router.post("/:groupId/expense/_add", authenticateToken, async (req, res) => {
  const { expenseObj } = req.body;
  const { groupId } = req.params;
  console.log("request user: ", req.user);

  const group = await Group.findById(groupId);
  const isAdmin = group.admin[0].id === req.user.user.id;

  if (!isAdmin) {
    res.status(401).json({ message: "Sorry, but you are not authorized" });
    return;
  }

  let dateString = new Date(`${expenseObj.month} ${expenseObj.day} ${expenseObj.year}`);

  let individualExpense = new IndividualExpense({
    timeStamp: new Date(dateString),
    paidBy: {
      id: expenseObj.detail.paidBy.id,
      username: expenseObj.detail.paidBy.username,
    },
    amount: expenseObj.detail.amount,
    item: expenseObj.detail.item,
  });

  let allExpenseByYear = await Expense.findOne({ year: Number(dateString.getFullYear()) });

  if (!allExpenseByYear) {
    allExpenseByYear = new Expense({
      year: dateString.getFullYear(),
      expensePerMonth: {},
    });
  }

  let month = monthList[dateString.getMonth()];

  if (!allExpenseByYear.expensePerMonth[month]) {
    allExpenseByYear.expensePerMonth[month] = [];
  }

  allExpenseByYear.expensePerMonth[month].push(individualExpense);
  await allExpenseByYear.save();

  // const group = await Group.findById(groupId);
  group.expenses.push(allExpenseByYear._id);
  await group.save();

  // res.status(200).json({group,allExpenseByYear});
  res.status(200).end();
});

module.exports = router;
