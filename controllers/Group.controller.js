const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const Group = require("../models/Group.model");
const authenticateToken = require("../middleware/authenticateToken.middleware");

router.get("/", authenticateToken, async (req, res) => {
  const groups = await Group.find({});

  res.status(200).json(groups);
});

router.get("/:id", authenticateToken, async (req, res) => {
  // const groups = await Group.find({});
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ message: "Please send a valid id" });
    return;
  }
  const group = await Group.findOne({ _id: id });
  if (!group) {
    res.status(400).json({ message: "Sorry, not found" });
    return;
  }
  res.status(200).json(group);
});

router.post("/", authenticateToken, async (req, res) => {
  const { group_name } = req.body;
  const groupById = await Group.findOne({ groupName: group_name });

  if (groupById) {
    res.status(400).json({ message: "The group already exists" });
    return;
  }

  const { user } = req;
  const userId = user.user.id;
  const userInDb = await User.findOne({ _id: userId });

  const group = new Group({
    groupName: group_name,
    admin: [],
    members: [],
    expenses: [],
  });

  group.admin = [];
  group.admin.push({
    id: userInDb._id.toString(),
    username: userInDb.username,
  });

  await group.save();

  userInDb.adminInGroup.push({
    id: group._id.toString(),
    groupName: group.groupName,
  });

  await userInDb.save();
  res.status(201).json(group);
});

router.put("/:id", authenticateToken, async (req, res) => {
  const { group_name } = req.body;
  const { id } = req.params;
  const { user } = req.user;

  if (!id) {
    res.status(400).json({
      message: "Please send a valid json",
    });
  }
  const group = await Group.findOne({ _id: id });

  if (group.admin[0]["id"] !== user.id) {
    res.status(401).json({ message: "Only admin can make this request." });
    return;
  }
  if (group.groupName !== group_name) {
    group.groupName = group_name;
    await group.save();
    res.status(200).json({ group, message: "Successfully updated" });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { user } = req.user;
  if (!id) {
    res.status(400).json({ message: "Please provide a valid id" });
  }

  const group = await Group.findOne({ _id: id });
  if (group.admin[0]["id"] !== user.id) {
    res.status(401).json({ message: "You are not authorized" });
    return;
  }

  await Group.findOneAndDelete({ _id: id });
  res.status(200).end();
});

module.exports = router;
