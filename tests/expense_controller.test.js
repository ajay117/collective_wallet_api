const User = require("../models/User.model");
const supertest = require("supertest");
const app = require("../app");
const { createHashedPassword, groupsInDB } = require("../helpers/test.helper");
const Group = require("../models/Group.model");
const Expense = require("../models/Expense.model");

const api = supertest(app);

let token, token2;
let user = {
  id: null,
  username: null,
};

// test("message 'hello world' returns as json", async () => {
//   await api
//     .get("/")
//     .expect(200)
//     .expect("Content-Type", /application\/json/);
// });

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

beforeEach(async () => {
  await User.deleteMany();
  let password = "111111";
  initialData[0].hashedPassword = await createHashedPassword(password);
  initialData[1].hashedPassword = await createHashedPassword(password);
  let userObject = new User(initialData[0]);
  await userObject.save();
  userObject = new User(initialData[1]);
  await userObject.save();

  // const userData = initialData.map((userObject) => new User(userObject));
  // const promiseUserArray = userData.map((obj) => obj.save());
  // await Promise.all(promiseUserArray);

  const userCredentials = {
    username: "ajay",
    password: "111111",
  };

  const userCredentials2 = {
    username: "bijay",
    password: "111111",
  };

  const { body } = await api
    .post("/users/login")
    .send(userCredentials)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  // console.log(body);
  token = body.token;
  user.id = body.user.id;
  user.username = body.user.username;

  const response = await api
    .post("/users/login")
    .send(userCredentials2)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  token2 = response.body.token;

  await Group.deleteMany(); //creating a group
  await Expense.deleteMany();

  const group = {
    group_name: "Mero Khata",
  };
  const group2 = {
    group_name: "Nepal",
  };

  await api
    .post("/groups")
    .send(group)
    .set("Authorization", `Bearer ${token}`)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  await api
    .post("/groups")
    .send(group2)
    .set("Authorization", `Bearer ${token2}`)
    .expect(201)
    .expect("Content-Type", /application\/json/);
});

describe("check post routes for expenses", () => {
  test("/groups/:groupId/expense/_add should post expense in database", async () => {
    const expenseData = {
      expenseObj: {
        year: 2022,
        month: "Jan",
        day: 2,
        detail: {
          paidBy: {
            id: user.id,
            username: user.username,
          },
          amount: 20000,
          item: "hair oil",
        },
      },
    };

    const allGroups = await groupsInDB();
    const firstGroup = allGroups[0];
    console.log("All groups :", allGroups);

    await api
      .post(`/groups/${firstGroup.id}/expense/_add`)
      .send(expenseData)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
  }, 50000);

  test("Return 401, if request is not made by admin", async () => {
    const expenseData = {
      expenseObj: {
        year: 2022,
        month: "Jan",
        day: 2,
        detail: {
          paidBy: {
            id: user.id,
            username: user.username,
          },
          amount: 20000,
          item: "hair oil",
        },
      },
    };

    const allGroups = await groupsInDB();
    const secondGroup = allGroups[1];

    await api
      .post(`/groups/${secondGroup.id}/expense/_add`)
      .send(expenseData)
      .set("Authorization", `Bearer ${token}`)
      .expect(401);
  }, 50000);
});
