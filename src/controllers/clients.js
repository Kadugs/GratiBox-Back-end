import connection from "../database.js";
import { isSignUpValid } from "../validation/signUp.js";
async function signUp(req, res) {
  const { name, email, password } = req.body;
  if (!isSignUpValid(req.body)) return res.sendStatus(400);
  try {
    const registeredEmails = await connection.query(`SELECT email FROM clients`);
    if(registeredEmails?.rows.some(item => item.email === email)) return res.sendStatus(409);
    await connection.query(`
      INSERT 
      INTO clients (name, email, password) 
      VALUES ($1, $2, $3)`,[name, email, password]);
    return res.sendStatus(201);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}
export { signUp };
