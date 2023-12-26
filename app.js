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
const errorHandler = require("./middleware/errorHandler.middleware");

const port = 8080;
// const pwd_db = config.database.mongodb_pwd;
const mongoDbUrl = config.MONGODB_URI;
console.log(mongoDbUrl);

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(mongoDbUrl);
}

// app.get("/", (req, res) => {
//   res.send("Hello World");
// });

app.use("/users", usersRoute);
app.use("/groups", groupsRoute);

app.use((req, res) => {
  res.status(404).json("Sorry, we cant't find the page you are requesting");
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
