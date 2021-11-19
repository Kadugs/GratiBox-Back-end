import connection from '../database.js';

async function getPlans(req, res) {
  const newLocal = 'authorization';
  const token = req.headers[newLocal]?.replace('Bearer ', '');
  try {
    const userPlan = await connection.query(
      `
        SELECT plans.type AS "planType", delivery_days.day AS day, products.name AS "productName"
        FROM clients
        JOIN sessions ON sessions.user_id = clients.id
        LEFT JOIN subscriptions ON subscriptions.user_id = clients.id
        LEFT JOIN plans ON plans.id = subscriptions.plan_id
        LEFT JOIN delivery_days ON delivery_days.id = subscriptions.delivery_id
        LEFT JOIN products ON products.id = subscriptions.product_id
        WHERE sessions.token = $1
        `,
      [token]
    );
    return res.send(userPlan.rows).status(200);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

export { getPlans };
