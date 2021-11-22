import connection from './database.js';

async function verifyToken(req, res, next) {
  const newLocal = 'authorization';
  const token = req.headers[newLocal]?.replace('Bearer ', '');
  try {
    const session = await connection.query(
      `SELECT * FROM sessions WHERE token = $1;`,
      [token]
    );
    if (session.rowCount === 0) {
      return res.sendStatus(401);
    }
    next();
  } catch (err) {
    return res.sendStatus(500);
  }
}

export { verifyToken };
