require("dotenv").config();
const express = require("express");
require("express-async-errors");
const mongoose = require("mongoose");
const app = express();
const port = 8080;
const User = require("./models/User.model");
const bcrypt = require("bcrypt");

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

// app.post('/login', (req,res) => {
//     login logic
// })

app.post("/signup", (req, res, next) => {
  const { username, password } = req.body;
  console.log({ password });
  const saltRounds = 10;

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

  //Get input from the user (i.e. username and password)
  //the user name should be unique
  //save username and hashed password to the database
});

// app.post('/groups', (req,res) => {
//     logic to create a group
// })

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
  //   console.log("Error from middleware");
  //   console.error(err.stack);
  if (err.name === "ValidationError") {
    console.log(err.message);
    res.status(500).json("Username must be unique");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
