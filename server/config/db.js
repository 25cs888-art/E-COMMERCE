import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sequelize;
const dialect = process.env.DB_DIALECT || 'sqlite';

if (dialect === 'sqlite') {
  const dbFile = process.env.DB_FILE || 'ecommerce.db';
  const dbPath = path.resolve(__dirname, '..', dbFile);
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false
  });
} else {
  // Configured for MySQL or PostgreSQL
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || (dialect === 'postgres' ? 5432 : 3306),
      dialect: dialect,
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

export default sequelize;
export { sequelize };
