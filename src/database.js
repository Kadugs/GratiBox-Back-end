import pg from 'pg';

const { Pool } = pg;

const localConfig = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '123456',
  database: process.env.NODE_ENV === 'test' ? 'gratibox_test' : 'gratibox',
};
const databaseConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
};

const connection = new Pool(
  process.env.NODE_ENV !== 'production' || process.env.NODE_ENV === 'test'
    ? localConfig
    : databaseConfig,
);

export default connection;
