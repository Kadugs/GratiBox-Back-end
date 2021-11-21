import supertest from 'supertest';
import { v4 as uuid } from 'uuid';
import app from '../src/app.js';
import connection from '../src/database.js';

const token = uuid();
beforeAll(async () => {
  await connection.query(`
    INSERT INTO clients (name, email, password)
    VALUES ('testname', 'signin@email.com', 'senha');
    `);
  const user = await connection.query(
    `
    SELECT id
       FROM clients
       WHERE email='signin@email.com';
       `
  );
  await connection.query(
    `
    INSERT
    INTO sessions (user_id, token)
    VALUES (${user.rows[0].id}, '${token}');`
  );
  console.log(user.rows[0].id);
});

describe('POST /plans', () => {
  it('test', async () => {
    const result = 2 + 1;
    expect(result).toEqual(3);
  });
});

describe('POST /plans', () => {
  it('should return 401 for invalid token', async () => {
    const result = await supertest(app).post('/plans');
    console.log(result);
    expect(result.status).toEqual(401);
  });
});

describe('GET /plans', () => {
  jest.setTimeout(10000);
  it('should return 401 for invalid token', async () => {
    const result = await supertest(app).get('/plans');
    console.log(result);
    expect(result.status).toEqual(401);
  });

  it('should return 200 for invalid token', async () => {
    const result = await supertest(app)
      .get('/plans')
      .set('authorization', `Bearer ${token}`);
    console.log(result);
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
