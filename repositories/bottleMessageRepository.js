import { db } from '../models/database.js';

export const getMessagesBySenderId = async (senderId) => {
  const query = 'SELECT * FROM BottleMessage WHERE senderId = ?';
  const [rows] = await db.query(query, [senderId]);
  return rows;
};
