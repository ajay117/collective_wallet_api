const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken.middleware");
const User = require("../models/User.model");

router.get("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ message: "Please enter an valid id" });
    return;
  }
  const user = await User.findOne({ _id: id });
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(400).json({ message: "Sorry, no user found. Please insert an valid id" });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { user } = req;
  if (!id) {
    res.status(400).json({ message: "Please send a valid id" });
  }
  const userInDb = await User.findOne({ _id: id });
  if (userInDb) {
    if (userInDb._id !== user.id) {
      res.status(401).json({ message: "You are not authorized to make this request" });
    }
    await User.findOneAndDelete({ _id: userInDb._id });
    res.status(200);
  }
});

module.exports = router;
