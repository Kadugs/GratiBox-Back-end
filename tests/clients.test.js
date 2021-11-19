import supertest from 'supertest';
import bcrypt from 'bcrypt';
import faker from 'faker';
import app from '../src/app.js';
import connection from '../src/database.js';

describe('POST /sign-up', () => {
  beforeAll(async () => {
    await connection.query(`
      INSERT INTO clients (name, email, password) 
      VALUES ('testUser', 'test@email.com', 'testPassword');`);
  });

  it('should return 400 for invalid parameters', async () => {
    const password = faker.internet.password();
    const body = {
      name: faker.name.findName(),
      email: 'asd',
      password,
      confirmPassword: password,
    };
    const result = await supertest(app).post('/sign-up').send(body);
    expect(result.status).toEqual(400);
  });

  it('should return 409 for conflict email', async () => {
    const password = faker.internet.password();
    const body = {
      name: faker.name.findName(),
      email: 'test@email.com',
      password,
      confirmPassword: password,
    };
    const result = await supertest(app).post('/sign-up').send(body);
    expect(result.status).toEqual(409);
  });

  it('should return 201 for valid params', async () => {
    const password = faker.internet.password();
    const body = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password,
      confirmPassword: password,
    };
    const result = await supertest(app).post('/sign-up').send(body);
    expect(result.status).toEqual(201);
  });
});
describe('POST /sign-in', () => {
    beforeAll(async () => {
    await connection.query(`
      INSERT INTO clients (name, email, password) 
      VALUES ('testUser', 'test@email.com', 'testPassword');`);
  });
    afterAll(async () => {
    await connection.query(`
      DELETE FROM sessions;
      DELETE FROM clients;
      `);
  });
  const passwordHash = bcrypt.hashSync('testPassword', 10);
  beforeAll(async () => {
    await connection.query(`
      INSERT INTO clients (name, email, password) 
      VALUES ('testUser', 'test@email.com', '${passwordHash}')`);
  });
  afterAll(async () => {
    await connection.query(`
      DELETE FROM clients`);
  });

  it('should return 400 for invalid parameters', async () => {
    const password = faker.internet.password();
    const body = {
      password,
    };
    const result = await supertest(app).post('/sign-in').send(body);
    expect(result.status).toEqual(400);
  });

  it('should return 404 for incorret email', async () => {
    const body = {
      email: 'wrong@email.com',
      password: 'testPassword',
    };
    const result = await supertest(app).post('/sign-in').send(body);
    expect(result.status).toEqual(404);
  });
    it('should return 401 for incorret password', async () => {
    const body = {
      email: 'test@email.com',
      password: 'wrongPassword',
    };
    const result = await supertest(app).post('/sign-in').send(body);
    expect(result.status).toEqual(401);
  });

  it('should return 200 for valid params', async () => {
    const body = {
      email: 'test@email.com',
      password: 'testPassword',
    };
    const result = await supertest(app).post('/sign-in').send(body);
    expect(result.status).toEqual(200);
  });
});
