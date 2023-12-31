const mongoose = require("mongoose");
const User = require("../models/User.model");
const Group = require("../models/Group.model");
const app = require("../app");
const supertest = require("supertest");
const { createHashedPassword, groupsInDB, usersInDB } = require("../helpers/test.helper");
const { application } = require("express");

const api = supertest(app);

let token;

const initialData = [
  {
    username: "ajay",
    password: "111111",
    memberInGroup: [],
    adminInGroup: [],
    id: "6588f25bec299c11ec41db2f",
  },
  {
    username: "bijay",
    password: "111111",
    memberInGroup: [],
    adminInGroup: [],
    id: "65893f104d6fb5608c9b1309",
  },
];

const initialDataGroups = [
  {
    groupName: "Khata",
    admin: [],
    members: [],
    expenses: [],
  },
  {
    groupName: "Nepali_Khata",
    admin: [],
    members: [],
    expenses: [],
  },
];

beforeEach(async () => {
  await User.deleteMany();
  let password = "111111";
  initialData[0].hashedPassword = await createHashedPassword(password);
  let userObject1 = new User(initialData[0]);
  await userObject1.save();
  initialData[1].hashedPassword = await createHashedPassword(password);
  let userObject2 = new User(initialData[1]);
  await userObject2.save();

  const userCredentials = {
    username: "ajay",
    password: "111111",
  };

  const { body } = await api
    .post("/users/login")
    .send(userCredentials)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  token = body.token;

  const allUsersInDb = await usersInDB();
  const secondUserInDb = allUsersInDb[1];

  await Group.deleteMany();
  const { id, user } = body.user;
  initialDataGroups[0].admin.push({ id, user });


  //creating second user from db to push it to property admin in second group
  const secondUser = {
    id: secondUserInDb.id,
    username: secondUserInDb.username,
  };
  initialDataGroups[1].admin.push(secondUser);

  let groupObject = new Group(initialDataGroups[0]);
  await groupObject.save();
  groupObject = new Group(initialDataGroups[1]);
  await groupObject.save();
});

describe("test routes with /groups/:id/members/ ", () => {
//   test("request made by not admin will return 401", async () => {
//     const allUsersInDb = await usersInDB();
//     const allGroupsInDb = await groupsInDB();
//     const firstUserInDb = allUsersInDb[0];
//     const secondGroupInDb = allGroupsInDb[1];

//     console.log({ firstUserInDb, secondGroupInDb });

//     await api
//       .post(`/groups/${secondGroupInDb.id}/members/${firstUserInDb.id}/add_member`)
//       .set("Authorization", `Bearer {token}`)
//       .expect(401)
//       .expect("Content-Type", /application\/json/);
//   });

  test("post request to /groups/:id/members/:userId/add_member will add a member to the group", async () => {
    const allUsersInDb = await usersInDB();
    const allGroupsInDb = await groupsInDB();
    const secondUserInDb = allUsersInDb[1];
    const firstGroupInDb = allGroupsInDb[0];

    const { body } = await api
      .post(`/groups/${firstGroupInDb.id}/members/${secondUserInDb.id}/add_member`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(body.members).toContain(secondUserInDb.id);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
