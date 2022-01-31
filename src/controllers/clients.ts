/* eslint-disable no-console */
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { isSignUpValid } from '../validation/signUp.js';
import connection from '../database.js';

async function signUp(req, res) {
  const { name, email, password } = req.body;
  if (!isSignUpValid(req.body)) return res.sendStatus(400);
  const passwordHash = bcrypt.hashSync(password, 10);

  try {
    const registeredEmails = await connection.query(
      'SELECT email FROM clients'
    );
    if (registeredEmails?.rows.some((item) => item.email === email))
      return res.sendStatus(409);
    await connection.query(
      `INSERT 
       INTO clients (name, email, password) 
       VALUES ($1, $2, $3)`,
      [name, email, passwordHash]
    );
    return res.sendStatus(201);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

async function signIn(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.sendStatus(400);

  try {
    const result = await connection.query(
      `SELECT id, name, password 
       FROM clients
       WHERE email = $1;`,
      [email]
    );
    const user = result.rows[0];

    if (!user) return res.sendStatus(404);
    if (!bcrypt.compareSync(password, user.password))
      return res.sendStatus(401);

    const findSession = await connection.query(
      `SELECT * 
       FROM sessions
       WHERE user_id = $1;`,
      [user.id]
    );

    const session = findSession.rows[0];

    const newToken = uuid();
    if (session) {
      await connection.query(
        `UPDATE sessions 
         SET token = $1
         WHERE user_id = $2;`,
        [newToken, user.id]
      );
    } else {
      await connection.query(
        `INSERT 
         INTO sessions (user_id, token)
         VALUES ($1, $2);`,
        [user.id, newToken]
      );
    }

    return res.status(200).send({
      name: user.name,
      token: newToken
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}
export { signUp, signIn };
