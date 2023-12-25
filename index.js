require("dotenv").config();
const express = require("express");
require("express-async-errors");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const cors = require("cors");
const User = require("./models/User.model");
const Group = require("./models/Group.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateToken = require("./middleware/authenticateToken.middleware");
const config = require("./config");
const usersRoute = require("./controllers/User.controller");

const port = 8080;
const pwd_db = config.database.mongodb_pwd;

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(
    `mongodb+srv://meajay64:${pwd_db}@cluster0.tgd11fa.mongodb.net/test?retryWrites=true&w=majority`
  );
}

//Routes ---------------- ---------------- ----------------

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/users", usersRoute);

// ||GET Routes

app.get("/groups/:id", async (req, res) => {
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

// ||POST Routes

app.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (user) {
    const hashedPassword = user.hashedPassword;
    console.log({ password, hashedPassword });
    // return
    bcrypt.compare(password, hashedPassword, (err, result) => {
      if (err) {
        next(err);
      }
      if (result) {
        const secretKey = process.env.JSON_WEB_TOKEN_SECRET_KEY;
        // const userInfo = user.toJSON();
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

app.post("/signup", async (req, res) => {
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

app.post("/groups", authenticateToken, async (req, res) => {
  const { group_name } = req.body;
  if (await Group.findOne({ group_name })) {
    res.status(400).json({ message: "The group already exists" });
    return;
  }

  const { user } = req;
  const userId = user.user.id;
  const userInDb = await User.findOne({ _id: userId });

  console.log({ userInDb });

  const group = new Group({
    groupName: group_name,
    admin: [],
    members: [],
    expenses: [],
  });

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

// || Put Routes

app.put("/groups/:id", authenticateToken, async (req, res) => {
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

// app.put("/users/:id/", (req, res) => {});

// || Delete Routes

app.delete("/groups/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { user } = req;
  if (!id) {
    res.status(400).json({ message: "Please provide a valid id" });
  }

  const group = await Group.findOne({ _id: id });
  if (group.admin[0]["id"] !== user.id) {
    res.status(401).json({ message: "You are not authorized" });
    return;
  }
  res.status(200).end();
});

//Routes------------ ---------------- ---------------- ----------------

app.use((req, res, next) => {
  res.status(404).json("Sorry, we cant't find the page you are requesting");
});

app.use((err, req, res, next) => {
  console.log("Error from middleware", err);
  if (err.name === "ValidationError") {
    console.log(err.message);
    res.status(500).json("Username must be unique");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
