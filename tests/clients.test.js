/* eslint-disable no-undef */
import supertest from 'supertest';
import bcrypt from 'bcrypt';
import faker from 'faker';
import app from '../src/app.js';
import connection from '../src/database.js';

describe('POST /sign-up', () => {
  const email = 'test@example.com';

  it('should return 400 for invalid parameters', async () => {
    const password = faker.internet.password();
    const body = {
      name: faker.name.findName(),
      email: 'asd',
      password,
      confirmPassword: password
    };
    const result = await supertest(app).post('/sign-up').send(body);
    expect(result.status).toEqual(400);
  });

  it('should return 201 for valid params', async () => {
    const password = faker.internet.password();
    const body = {
      name: faker.name.findName(),
      email: email,
      password,
      confirmPassword: password
    };
    const result = await supertest(app).post('/sign-up').send(body);
    expect(result.status).toEqual(201);
  });
  it('should return 409 for conflict email', async () => {
    const password = faker.internet.password();
    const body = {
      name: faker.name.findName(),
      email: email,
      password,
      confirmPassword: password
    };
    const result = await supertest(app).post('/sign-up').send(body);
    expect(result.status).toEqual(409);
  });
});
describe('POST /sign-in', () => {
  beforeAll(async () => {
    const passwordHash = bcrypt.hashSync('testPassword', 10);
    await connection.query(`
    INSERT INTO clients (name, email, password)
    VALUES ('testname', 'signin@email.com', '${passwordHash}');
    `);
  });

  it('should return 400 for invalid parameters', async () => {
    const password = faker.internet.password();
    const body = {
      password
    };
    const result = await supertest(app).post('/sign-in').send(body);
    expect(result.status).toEqual(400);
  });

  it('should return 404 for incorret email', async () => {
    const body = {
      email: 'wrong@email.com',
      password: 'testPassword'
    };
    const result = await supertest(app).post('/sign-in').send(body);
    expect(result.status).toEqual(404);
  });
  it('should return 401 for incorret password', async () => {
    const body = {
      email: 'signin@email.com',
      password: 'wrongPassword'
    };
    const result = await supertest(app).post('/sign-in').send(body);
    expect(result.status).toEqual(401);
  });

  it('should return 200 for valid params', async () => {
    const body = {
      email: 'signin@email.com',
      password: 'testPassword'
    };
    const result = await supertest(app).post('/sign-in').send(body);
    expect(result.status).toEqual(200);
  });
  afterAll(async () => {
    await connection.query(`
      DELETE FROM sessions;
      DELETE FROM clients;
      `);
  });
});
afterAll(() => {
  connection.end();
});
