const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const User = require("../models/User.model");
const { createHashedPassword, usersInDB } = require("../helpers/test.helper");
// const config = require("../config");

const api = supertest(app);
let token;

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
    await api
      .get("/users")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("/users should show list of initialData if have valid token", async () => {
    await api
      .get("/users")
      .set("Authorization", `Beare ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const response = await api
      .get("/users")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toHaveLength(initialData.length);
  });

  test("/users/:id should show info about a particular user id", async () => {
    const userObject = {
      username: "ajay",
      memberInGroup: [],
      adminInGroup: [],
      id: "6588f25bec299c11ec41db2f",
    };

    const response = await api
      .get(`/users/${userObject.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toEqual(userObject);
  });

  test("a user can delete his/her account from database", async () => {
    const response = await api.get("/users").set("Authorization", `Bearer ${token}`);
    const firstUserInDb = response.body[0];

    await api.del(`/users/${firstUserInDb.id}`).set("Authorization", `Bearer ${token}`).expect(200);
    const usersLeftInDb = await usersInDB();
    expect(usersLeftInDb).toHaveLength(initialData.length - 1);
  });

  test("a new user can be created in database after signup", async () => {
    const user = {
      username: "Bikash",
      password: "222222",
    };

    await api
      .post("/users/signup")
      .send(user)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const usersLeftInDb = await usersInDB();
    expect(usersLeftInDb).toHaveLength(initialData.length + 1);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
