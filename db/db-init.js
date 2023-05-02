require('dotenv').config();
const { Client } = require('pg');

(async () => {
  const client = new Client({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
  });

  try {
    await client.connect();
    const findDB = await client.query(
      `SELECT datname FROM pg_catalog.pg_database WHERE datname='users_db'`
    );
    if (!findDB.rowCount) {
      await client.query(`CREATE DATABASE users_db`);
    }
    // Create a new client instance connected to the users_db database
    const usersClient = new Client({
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_USERS_DB,
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
    });

    await usersClient.connect();
    // uuid-ossp is a PostgreSQL extension to generate UUID for each row automatically
    await usersClient.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        workstation INTEGER NOT NULL
      )
    `);
    await usersClient.end();
    console.log('Database and table created successfully');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
})();
