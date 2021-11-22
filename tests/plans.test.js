import supertest from 'supertest';
import app from '../src/app.js';
import connection from '../src/database.js';
import faker from 'faker';

const token = 'b0da3eba-8287-42fc-b106-f0b787d88c80';
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
});

describe('POST /plans', () => {
  it('should return 401 for invalid token', async () => {
    const result = await supertest(app)
      .post('/plans')
      .set('authorization', 'Bearer b72f814c-a481-44c9-8564-2232114d6747');
    expect(result.status).toEqual(401);
  });
  it('should return 400 for invalid body', async () => {
    const body = {
      hell0: 2
    };
    const result = await supertest(app)
      .post('/plans')
      .set('authorization', `Bearer ${token}`)
      .send(body);
    expect(result.status).toEqual(400);
  });
  it('should return 200 for valid parameters', async () => {
    const body = {
      signPlan: {
        plan: 'mensal',
        products: {
          tea: true,
          incense: true,
          organics: true
        },
        shipment: '01'
      },
      shipment: {
        address: faker.address.cityName(),
        cep: '12345678',
        city: faker.address.city(),
        name: faker.name.findName(),
        state: faker.address.state()
      }
    };
    const result = await supertest(app)
      .post('/plans')
      .set('authorization', `Bearer ${token}`)
      .send(body);
    expect(result.status).toEqual(200);
  });
});

describe('GET /plans', () => {
  it('should return 401 for invalid token', async () => {
    const result = await supertest(app)
      .get('/plans')
      .set('authorization', `Bearer b72f814c-a481-44c9-8564-22c8e14d6747`);
    expect(result.status).toEqual(401);
  });
  it('should return 200 for invalid token', async () => {
    const result = await supertest(app)
      .get('/plans')
      .set('authorization', `Bearer ${token}`);
    expect(result.status).toEqual(200);
  });
  afterAll(async () => {
    await connection.query(`
    DELETE FROM user_products;
    DELETE FROM shipments;
    DELETE FROM delivery_data;
    DELETE FROM subscriptions;
    DELETE FROM sessions;
    DELETE FROM clients;
    `);
  });
});
afterAll(() => {
  connection.end();
});
