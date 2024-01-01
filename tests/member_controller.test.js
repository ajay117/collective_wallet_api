const mongoose = require("mongoose");
const User = require("../models/User.model");
const Group = require("../models/Group.model");
const app = require("../app");
const supertest = require("supertest");
const { createHashedPassword, groupsInDB, usersInDB } = require("../helpers/test.helper");

const api = supertest(app);
let token;

const userAfterPwdHashFromDb = async (userList, index, password) => {
  userList[index].hashedPassword = await createHashedPassword(password);
  let userObject = new User(userList[index]);
  userObject = await userObject.save();
  return userObject;
};

const initialData = [
  {
    username: "ajay",
    memberInGroup: [],
    adminInGroup: [],
    id: "6588f25bec299c11ec41db2f",
  },
  {
    username: "bijay",
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
  let userObject1 = await userAfterPwdHashFromDb(initialData, 0, "111111");
  let userObject2 = await userAfterPwdHashFromDb(initialData, 1, "111111");

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

  await Group.deleteMany();

  //Setting first group with first user as admin
  initialDataGroups[0].admin.push({
    id: userObject1.id,
    username: userObject1.username,
  });
  let group1 = new Group(initialDataGroups[0]);
  await group1.save();

  userObject1.adminInGroup.push({
    id: group1.id,
    groupName: group1.groupName,
  });
  await userObject1.save();

  //Creating second group with second user as admin
  initialDataGroups[1].admin.push({
    id: userObject2.id,
    username: userObject2.username,
  });
  let group2 = new Group(initialDataGroups[1]);
  await group2.save();

  userObject2.adminInGroup.push({
    id: group2.id,
    groupName: group2.groupName,
  });
  await userObject2.save();
});

describe("request starting with /groups/:id/members/ ", () => {
  test("request made by not admin will return 401", async () => {
    const allUsersInDb = await usersInDB();
    const allGroupsInDb = await groupsInDB();
    const firstUserInDb = allUsersInDb[0];
    const secondGroupInDb = allGroupsInDb[1];

    console.log({ firstUserInDb, secondGroupInDb });

    await api
      .post(`/groups/${secondGroupInDb.id}/members/${firstUserInDb.id}/add_member`)
      .set("Authorization", `Bearer ${token}`)
      .expect(401)
      .expect("Content-Type", /application\/json/);
  });

  test("post request to /groups/:id/members/:userId/add_member, by admin will add a member to the group", async () => {
    const allUsersInDb = await usersInDB();
    const allGroupsInDb = await groupsInDB();
    let secondUserInDb = allUsersInDb[1];
    const firstGroupInDb = allGroupsInDb[0];

    const { body } = await api
      .post(`/groups/${firstGroupInDb.id}/members/${secondUserInDb.id}/add_member`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const allUsersAfterRequestInDb = await usersInDB();
    secondUserInDb = allUsersAfterRequestInDb[1];
    const memberInGroup = secondUserInDb.memberInGroup.map((obj) => obj.id);

    expect(body.members).toContain(secondUserInDb.id);
    expect(memberInGroup).toContain(body.id);
  });

  test("request to remove a member  from the group by admin should return 200", async () => {
    let allUsersInDb = await usersInDB();
    let allGroupsInDb = await groupsInDB();
    let firstGroupInDb = allGroupsInDb[0];
    let secondUserInDb = allUsersInDb[1];

    //Adding second member from db to first group in db by admin as a member
    await api
      .post(`/groups/${firstGroupInDb.id}/members/${secondUserInDb.id}/add_member`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    //Removing second member from first group as a member by admin
    await api
      .delete(`/groups/${firstGroupInDb.id}/members/${secondUserInDb.id}/delete_member`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    allUsersInDb = await usersInDB();
    allGroupsInDb = await groupsInDB();
    firstGroupInDb = allGroupsInDb[0];
    secondUserInDb = allUsersInDb[1];

    expect(firstGroupInDb.members).not.toContain(secondUserInDb.id);

    const memberInGroupArr = secondUserInDb.memberInGroup.map((obj) => obj.id);
    expect(memberInGroupArr).not.toContain(secondUserInDb.id);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
