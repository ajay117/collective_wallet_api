const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const User = require("../models/User.model");

const { createHashedPassword } = require("../helpers/test.helper");

const api = supertest(app);

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
  let userObject = new User(initialData[0]);
  await userObject.save();
  initialData[1].hashedPassword = await createHashedPassword(password);
  userObject = new User(initialData[1]);
  await userObject.save();
});

describe('testing "/users" route', () => {
  test("trying to get users list without login will return 401 with suitable message", async () => {
    await api
      .get("/users")
      .expect(401)
      .expect("Content-Type", /application\/json/);
  });

  test("login with a valid username and password will return a jwt token", async () => {
    const userCredentials = {
      username: "ajay",
      password: "111111",
    };

    await api
      .post("/users/login")
      .send(userCredentials)
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("a login user can see users list", async () => {
    const userCredentials = {
      username: "ajay",
      password: "111111",
    };

    const { body } = await api
      .post("/users/login")
      .send(userCredentials)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const { token } = body;

    await api
      .get("/users")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  //   test("/users should show list of initialData if have valid token", async () => {

  //     await api
  //       .get("/users")
  //       .expect(200)
  //       .expect("Content-Type", /application\/json/);

  //     const response = await api
  //       .get("/users")
  //       .expect(200)
  //       .expect("Content-Type", /application\/json/);

  //     expect(response.body).toHaveLength(initialData.length);
  //   });
});

afterAll(async () => {
  await mongoose.connection.close();
});
