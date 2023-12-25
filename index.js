require("dotenv").config();
const express = require("express");
require("express-async-errors");
const mongoose = require("mongoose");
const app = express();
const port = 8080;
const User = require("./models/User.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pwd_db = process.env.DB_PASSWORD;

app.use(express.static("public"));
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

// ||GET Routes

// app.get('/users/:id', (req,res)  => {
//     will send info about a user with above id
// })

// app.get('/groups/:id', (req,res) => {
//     will send info about a group with above id
// })

// ||POST Routes

app.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  // if (
  //   !(
  //     typeof username === "string" &&
  //     username.length >= 4 &&
  //     typeof password === "string" &&
  //     password.length >= 4
  //   )
  // ) {
  //   res.status(400).json({
  //     error: "Username and password must be present and must be greater than 3",
  //   });
  //   return;
  // }
  const user = await User.findOne({ username });
  console.log({ user });
  // return;
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
        const userInfo = user.toJSON();
        const token = jwt.sign({ userInfo: userInfo }, secretKey, {
          expiresIn: "1h",
        });

        res.status(200).json({user,token});
      }
    });
  } else {
    res.status(400).json({ error: "Sorry username or password do not match" });
  }
});

app.post("/signup", async (req, res, next) => {
  const { username, password } = req.body;
  const saltRounds = 10;

  if (
    !(
      typeof username === "string" &&
      username.length >= 4 &&
      typeof password === "string" &&
      password.length >= 4
    )
  ) {
    res.status(400).json({
      error: "Username and password must be present and must be greater than 3",
    });
    return;
  }

  const user = await User.findOne({ username });
  if (user) {
    res.status(400).json({ error: "Username must be unique" });
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

app.post("/groups", (req, res) => {
  //get group name and admin info from user
  //check user credentials and return info about the user
  //if user
  //admin info will be the info of the user who created the group
  //update adminInGroup property in User model with this group
  //the group will have
  // group name, admin obj with user id and user name,empty members array, empty expenses array
});

// app.post('/users', (req,res) => {
//     logic to create a user
// })

// || Put Routes

// app.put("/groups/:id/", (req, res) => {});

// app.put("/users/:id/", (req, res) => {});

// || Delete Routes

// app.delete('/groups/:id', (req,res) => {

// })

// app.delete('/users/:id', (req,res) => {

// })

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
