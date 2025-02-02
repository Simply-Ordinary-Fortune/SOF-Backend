import { db } from '../models/database.js';

export const getRecordsByUserId = async (userId) => {
  const query = 'SELECT * FROM Record WHERE userId = ?';
  const [rows] = await db.query(query, [userId]);
  return rows;
};
