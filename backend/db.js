const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectionString = process.env.DATABASE_URL;

// Ensure connection string exists before initializing
if (!connectionString) {
    console.error("DATABASE_URL is missing in .env!");
}

const sql = postgres(connectionString);

module.exports = sql;
