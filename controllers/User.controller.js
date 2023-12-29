const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken.middleware");
const User = require("../models/User.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.get("/", authenticateToken, async (req, res) => {
  const users = await User.find({});
  res.status(200).json(users);
});

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
  let userInDb = await User.findOne({ _id: id });
  userInDb = userInDb.toJSON();
  console.log(userInDb.id, user.user.id);
  if (userInDb) {
    if (userInDb.id !== user.user.id) {
      console.log("hello from routes");
      console.log(userInDb.id, user.user.id);
      res.status(401).json({ message: "You are not authorized to make this request" });
    }
    console.log("hello------");
    const deletedUser = await User.findOneAndDelete({ _id: userInDb.id });
    console.log(deletedUser);
    res.status(200).end();
  }
});

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const saltRounds = 10;

  if (!(typeof username === "string" && username.length >= 4 && typeof password === "string" && password.length >= 4)) {
    res.status(400).json({
      error: "Username and password must be present and must be greater than 3",
    });
    return;
  }

  const user = await User.findOne({ username });
  if (user) {
    res.status(400).json({ message: "Username must be unique" });
    return;
  }

  bcrypt.hash(password, saltRounds, async (err, hash) => {
    if (err) {
      console.log(err);
      res.status(500).json("Error hashing password");
    }

    const user = new User({
      username,
      hashedPassword: hash,
    });
    await user.save();
    console.log(user);
    res.status(200).json({ message: "Successfully created" });
  });
});

router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (user) {
    const hashedPassword = user.hashedPassword;
    console.log({ password, hashedPassword });
    bcrypt.compare(password, hashedPassword, (err, result) => {
      if (err) {
        next(err);
      }
      if (result) {
        const secretKey = process.env.JSON_WEB_TOKEN_SECRET_KEY;
        const token = jwt.sign({ user }, secretKey, {
          expiresIn: "1h",
        });

        res.status(200).json({ user, token });
      }
    });
  } else {
    res.status(400).json({ message: "Sorry username or password do not match" });
  }
});

module.exports = router;
