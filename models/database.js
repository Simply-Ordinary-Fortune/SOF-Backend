import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,       // ✅ DB_HOST 환경변수 사용
  user: process.env.DB_USER,       // ✅ DB_USER 환경변수 사용
  password: process.env.DB_PASSWORD, // ✅ DB_PASSWORD 환경변수 사용
  database: process.env.DB_DATABASE, // ✅ DB_DATABASE 환경변수 사용
  port: process.env.DB_PORT,       // ✅ DB_PORT 환경변수 사용
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export { db };

console.log("✅ DB 연결 정보:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
});

