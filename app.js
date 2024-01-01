require("dotenv").config();
const express = require("express");
require("express-async-errors");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const cors = require("cors");
const config = require("./config");
const usersRoute = require("./controllers/User.controller");
const groupsRoute = require("./controllers/Group.controller");
const membersRoute = require("./controllers/Member.controller");
const errorHandler = require("./middleware/errorHandler.middleware");

const mongoDbUrl = config.MONGODB_URI;

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(mongoDbUrl);
}

app.get("/", (req, res) => {
  res.json({ message: "Hello world" });
});

app.use("/users", usersRoute);
app.use("/groups", groupsRoute);
app.use("/groups", membersRoute);

app.use((req, res) => {
  res.status(404).json("Sorry, we cant't find the page you are requesting");
});

app.use(errorHandler);

module.exports = app;
