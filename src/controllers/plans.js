import connection from '../database.js';
import { isNewPlanValid } from '../validation/addPlan.js';
import dayjs from 'dayjs';

function takeDay(day) {
  if (day.toLowerCase() === 'segunda') return 1;
  if (day.toLowerCase() === 'quarta') return 3;
  return 5;
}

async function createShipment(shipmentDay, signPlan, userId) {
  let shipment = dayjs(shipmentDay).add(1, 'day');
  if (signPlan.plan.toLowerCase() === 'mensal') {
    let day = Number(signPlan.day);
    while (dayjs(shipment).get('date') !== day) {
      shipment = dayjs(shipment).add(1, 'day');
    }
    if (dayjs(shipment).get('day') === 0) {
      shipment = dayjs(shipment).add(1, 'day');
    } else if (dayjs(shipment).get('day') === 6) {
      shipment = dayjs(shipment).add(2, 'day');
    }
  } else if (signPlan.plan.toLowerCase() === 'semanal') {
    const dayCode = takeDay(signPlan.day);
    while (dayjs(shipment).get('day') !== dayCode) {
      shipment = dayjs(shipment).add(1, 'day');
    }
  } else {
    return;
  }
  await connection.query(
    `INSERT
       INTO shipments (user_id, date)
       VALUES ($1, $2)`,
    [userId, shipment]
  );
}

async function getPlans(req, res) {
  const newLocal = 'authorization';
  const token = req.headers[newLocal]?.replace('Bearer ', '');
  try {
    const userPlan = await connection.query(
      `
        SELECT clients.id AS "userId", plans.type AS "planType", delivery_days.day AS day,
          products.name AS "productName", subscriptions.date
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
    if (!userPlan.rows[0].planType) return res.send(null).status(200);
    const shipments = await connection.query(`
    SELECT date FROM shipments WHERE user_id = ${userPlan.rows[0].userId};`);
    let lastShipment = shipments.rows[shipments.rowCount - 1].date;
    while (dayjs(lastShipment).diff(dayjs(), 'month') < 4) {
      await createShipment(
        lastShipment,
        {
          plan: userPlan.rows[0].planType,
          day: userPlan.rows[0].day
        },
        userPlan.rows[0].userId
      );
      let newShipment = await connection.query(`
        SELECT date
        FROM shipments
        WHERE
        user_id = ${userPlan.rows[0].userId};`);
      lastShipment = newShipment.rows[newShipment.rowCount - 1].date;
    }
    let nextShipments = shipments.rows.filter(
      (shipment) =>
        dayjs(shipment.date).get('date') > dayjs().get('date') &&
        dayjs(shipment.date).get('month') === dayjs().get('month') &&
        dayjs(shipment.date).get('year') === dayjs().get('year')
    );
    if (nextShipments.length === 0) {
      nextShipments = shipments.rows.find(
        (shipment) =>
          dayjs(shipment.date).get('date') > dayjs().get('date') ||
          dayjs(shipment.date).get('month') > dayjs().get('month')
      );
      nextShipments = [nextShipments];
    }
    const mappedShipments = nextShipments.map((item) => item.date);
    const body = userPlan.rows.map((row) => {
      return {
        planType: row.planType,
        day: row.day,
        productName: row.productName,
        date: row.date,
        shipmentDates: mappedShipments
      };
    });
    return res.send(body).status(200);
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
    if (query === '') return res.sendStatus(400);
    await connection.query(query);

    await connection.query(
      `
    INSERT
    INTO delivery_data (user_id, address, cep, city, state)
    VALUES ($1, $2, $3, $4, $5);
    `,
      [userId, address, cep, city, state]
    );
    createShipment(
      dayjs(),
      { plan: signPlan.plan, day: signPlan.shipment },
      userId
    );

    return res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
}

export { getPlans, addPlan };
