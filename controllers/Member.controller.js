const express = require("express");
const Group = require("../models/Group.model");
const User = require("../models/User.model");
const authenticateToken = require("../middleware/authenticateToken.middleware");
const router = express.Router();

router.post("/:id/members/:userId/add_member", authenticateToken, async (req, res) => {
  const groupId = req.params.id;
  const userId = req.params.userId;

  console.log({ groupId, userId });

  if (!(groupId && userId)) {
    res.status(400).json({ message: "Please provide a valid group and member id" });
    return;
  }

  const group = await Group.findOne({ _id: groupId });
  const user = await User.findOne({ _id: userId });
  const isAdmin = group.admin[0].id === req.user.user.id;

  if (!isAdmin) {
    res.status(401).json({ message: "You are not admin of this group" });
    return;
  }
  group.members.push(user._id);
  await group.save();

  user.memberInGroup.push({
    id: group.id,
    groupName: group.groupName,
  });
  await user.save();

  // console.log(group, user);
  res.status(200).json(group);
});

router.delete("/:id/members/:userId/delete_member", authenticateToken, async (req, res) => {
  const groupId = req.params.id;
  const userId = req.params.userId;

  if (!(groupId && userId)) {
    res.status(400).json({ message: "Please provide a valid group and member id" });
    return;
  }

  const group = await Group.findOne({ _id: groupId });
  const user = await User.findOne({ _id: userId });
  const isAdmin = group.admin[0].id === req.user.user.id;

  if (!isAdmin) {
    res.status(401).json({ message: "You are not authorized" });
    return;
  }

  group.members.pull({ _id: userId });
  await group.save();

  user.memberInGroup = user.memberInGroup.filter((obj) => obj.id !== groupId);
  await user.save();

  res.status(200).end();
});

module.exports = router;
