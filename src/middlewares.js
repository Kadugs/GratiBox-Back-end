import connection from './database.js';

async function verifyToken(req, res, next) {
  const newLocal = 'authorization';
  const token = req.headers[newLocal]?.replace('Bearer ', '');
  try {
    const session = await connection.query(
      `SELECT * FROM sessions WHERE token = '${token}'`
    );
    if (session.rowCount === 0) {
      return res.status(401);
    }
    next();
  } catch (err) {
    return res.status(500);
  }
}

export { verifyToken };
