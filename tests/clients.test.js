import supertest from "supertest";
import app from "../src/app.js";
import connection from "../src/database.js";
import faker from "faker";

describe("POST /sign-up", () => {
  beforeAll(async () => {
    await connection.query(`
      INSERT INTO clients (name, email, password) 
      VALUES ('testUser', 'test@email.com', 'testPassword')`)
  });
  afterAll(async () => {
    await connection.query(`
      DELETE FROM clients`)
  });
  
  it("should return 400 for invalid parameters", async () => {
    const password = faker.internet.password();
    const body = {
      name: faker.name.findName(),
      email: "asd",
      password,
      confirmPassword: password,
    };
    const result = await supertest(app)
      .post("/sign-up")
      .send(body);
    expect(result.status).toEqual(400);
  });

  it("should return 409 for conflict email", async () => {
    const password = faker.internet.password();
    const body = {
      name: faker.name.findName(),
      email: "test@email.com",
      password,
      confirmPassword: password,
    };
    const result = await supertest(app)
      .post("/sign-up")
      .send(body);
    expect(result.status).toEqual(409);
  });

  it("should return 201 for valid params", async () => {
    const password = faker.internet.password();
    const body = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password,
      confirmPassword: password,
    };
    const result = await supertest(app)
      .post("/sign-up")
      .send(body);
    expect(result.status).toEqual(201);
  });

});
