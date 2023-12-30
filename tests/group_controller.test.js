const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const { createHashedPassword, groupsInDB, usersInDB } = require("../helpers/test.helper");
const User = require("../models/User.model");
const Group = require("../models/Group.model");

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
  let userObject = new User(initialData[0]);
  await userObject.save();
  initialData[1].hashedPassword = await createHashedPassword(password);
  userObject = new User(initialData[1]);
  await userObject.save();

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

describe("/groups/post route", () => {
  test("trying to post groups should return 401, if not login", async () => {
    const group = {
      group_name: "Nepal",
    };

    await api
      .post("/groups")
      .send(group)
      .expect(401)
      .expect("Content-Type", /application\/json/);
  });

  test("creating new group with common group name in database should return 400", async () => {
    const group = {
      group_name: "Khata",
    };

    await api
      .post("/groups")
      .send(group)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)
      .expect("Content-Type", /application\/json/);
  });

  test("creating new group with unique group name and a valid token should return 201 with a valid group object", async () => {
    const group = {
      group_name: "Mero Khata",
    };
    const { body } = await api
      .post("/groups")
      .send(group)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const allGroupsInDb = await groupsInDB();

    expect(body.groupName).toBe("Mero Khata");
    expect(allGroupsInDb).toHaveLength(initialDataGroups.length + 1);
  });
});

describe("/groups/:id route, get request", () => {
  test("user without a valid token should return response with 401", async () => {
    const allGroupsInDb = await groupsInDB();
    const firstGroupId = allGroupsInDb[0].id;

    await api
      .get(`/groups/${firstGroupId}`)
      .expect(401)
      .expect("Content-Type", /application\/json/);
  });

  test("if id doesn't match any groups id, return 400", async () => {
    const id = "65902098a4a5d91ee1a7b17f";

    await api
      .get(`/groups/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)
      .expect("Content-Type", /application\/json/);
  });

  test("return group info if have valid token", async () => {
    const allGroupsInDb = await groupsInDB();
    const firstGroupId = allGroupsInDb[0].id;

    await api
      .get(`/groups/${firstGroupId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });
});

describe("/groups/:id route, delete request", () => {
  test("return 401, if request is made by user other than group admin", async () => {
    const allGroupsInDb = await groupsInDB();
    const secondGroupInDb = allGroupsInDb[1];

    await api
      .delete(`/groups/${secondGroupInDb.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(401)
      .expect("Content-Type", /application\/json/);

    const allGroupsInDbAAfterRequest = await groupsInDB();
    expect(allGroupsInDbAAfterRequest).toHaveLength(allGroupsInDb.length);
  });

  test("return 200 and delete group, if request is made by group admin", async () => {
    const allGroupsInDb = await groupsInDB();
    const firstGroupId = allGroupsInDb[0].id;

    await api.delete(`/groups/${firstGroupId}`).set("Authorization", `Bearer ${token}`).expect(200);

    const allGroupsInDbAAfterRequest = await groupsInDB();
    expect(allGroupsInDbAAfterRequest).toHaveLength(allGroupsInDb.length - 1);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
