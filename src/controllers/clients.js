import connection from "../database.js";
import { isSignUpValid } from "../validation/signUp.js";
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

async function signUp(req, res) {
  const { name, email, password, confirmPassword } = req.body;
  console.log(name, email, password, confirmPassword);
  if (!isSignUpValid(req.body)) return res.sendStatus(400);
  const passwordHash = bcrypt.hashSync(password, 10);

  try {
    const registeredEmails = await connection.query(`SELECT email FROM clients`);
    if(registeredEmails?.rows.some(item => item.email === email)) return res.sendStatus(409);
    await connection.query(`
      INSERT 
      INTO clients (name, email, password) 
      VALUES ($1, $2, $3)`, 
      [name, email, passwordHash]);
    return res.sendStatus(201);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}
export { signUp };
