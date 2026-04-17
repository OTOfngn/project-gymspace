const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectionString = process.env.DATABASE_URL;

// Ensure connection string exists before initializing
if (!connectionString) {
    console.error("DATABASE_URL is missing in .env!");
}

// Supabase requires SSL for remote connections
const sql = postgres(connectionString, { ssl: 'require' });

module.exports = sql;
