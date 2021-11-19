/* eslint-disable no-undef */
import supertest from 'supertest';
import bcrypt from 'bcrypt';
import faker from 'faker';
import { v4 as uuid } from 'uuid';
import app from '../src/app.js';
import connection from '../src/database.js';

describe('GET /plans', () => {
  const token = uuid();
  beforeAll(async () => {
    const passwordHash = bcrypt.hashSync('testPassword', 10);
    await connection.query(`
    INSERT INTO clients (name, email, password)
    VALUES ('testname', 'signin@email.com', '${passwordHash}');
    `);
    const user = await connection.query(
      `SELECT id
       FROM clients
       WHERE email='signin@email.com'`
    );
    await connection.query(
      `INSERT
          INTO sessions (user_id, token)
          VALUES ('${user.rows[0].id}', '${token}')`
    );
  });

  afterAll(async () => {
    await connection.query(`
      DELETE FROM sessions;
      DELETE FROM clients;
      `);
  });

  it('should return 401 for invalid token', async () => {
    const wrongToken = uuid();
    const result = await supertest(app)
      .get('/plans')
      .set('authorization', 'Bearer ' + wrongToken);
    expect(result.status).toEqual(401);
  });

  it('should return 200 for invalid token', async () => {
    const result = await supertest(app)
      .get('/plans')
      .set('authorization', 'Bearer ' + token);
    expect(result.status).toEqual(200);
  });
});
