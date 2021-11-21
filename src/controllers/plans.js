import connection from '../database.js';
import { isNewPlanValid } from '../validation/addPlan.js';
import dayjs from 'dayjs';
async function getPlans(req, res) {
  const newLocal = 'authorization';
  const token = req.headers[newLocal]?.replace('Bearer ', '');
  try {
    const userPlan = await connection.query(
      `
        SELECT plans.type AS "planType", delivery_days.day AS day, products.name AS "productName", subscriptions.date
        FROM clients
        JOIN sessions ON sessions.user_id = clients.id
        LEFT JOIN subscriptions ON subscriptions.user_id = clients.id
        LEFT JOIN plans ON plans.id = subscriptions.plan_id
        LEFT JOIN delivery_days ON delivery_days.id = subscriptions.delivery_id
        LEFT JOIN user_products ON user_products.user_id = clients.id
        LEFT JOIN products ON products.id = user_products.product_id
        WHERE sessions.token = $1;
        `,
      [token]
    );
    return res.send(userPlan.rows).status(200);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}
function queryProducts(products, userId) {
  const template = (productId) => `
    INSERT
    INTO user_products (user_id, product_id)
    VALUES (${userId}, ${productId});
    `;

  let query = '';

  if (products.tea) query += template(1);
  if (products.incense) query += template(2);
  if (products.organics) query += template(3);
  return query;
}

async function addPlan(req, res) {
  if (!isNewPlanValid(req.body)) return res.sendStatus(400);
  const newLocal = 'authorization';
  const token = req.headers[newLocal]?.replace('Bearer ', '');
  const { signPlan, shipment } = req.body;
  if (
    (signPlan.plan === 'Mensal' &&
      Number(signPlan.shipment) != signPlan.shipment) ||
    (signPlan.plan === 'Semanal' &&
      Number(signPlan.shipment) == signPlan.shipment)
  ) {
    return res.sendStatus(400);
  }
  try {
    const userInfo = await connection.query(
      `
      SELECT clients.id as "userId", plans.id as "planId", delivery_days.id as "deliveryId"
      FROM clients
      JOIN plans ON plans.type = $1
      JOIN delivery_days ON delivery_days.day = $2
      JOIN sessions ON sessions.user_id = clients.id
      WHERE sessions.token = $3;
      `,
      [signPlan?.plan.toLowerCase(), signPlan?.shipment.toLowerCase(), token]
    );
    const { userId, planId, deliveryId } = userInfo.rows[0];
    const { address, cep, city, state } = shipment;

    const subscriptions = await connection.query(
      `
      SELECT id
      FROM subscriptions
      WHERE user_id = $1;`,
      [userId]
    );
    if (subscriptions.rowCount > 0) return res.sendStatus(409);

    await connection.query(
      `
      INSERT
      INTO subscriptions (user_id, plan_id, delivery_id, date)
      VALUES ($1, $2, $3, $4);
      `,
      [userId, planId, deliveryId, dayjs()]
    );
    const query = queryProducts(signPlan.products, userId);
    await connection.query(query);

    await connection.query(
      `
    INSERT
    INTO delivery_data (user_id, address, cep, city, state)
    VALUES ($1, $2, $3, $4, $5);
    `,
      [userId, address, cep, city, state]
    );

    return res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

export { getPlans, addPlan };
