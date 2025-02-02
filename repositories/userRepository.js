import { db } from '../models/database.js';

export const getUserById = async (id) => {
  const query = 'SELECT * FROM User WHERE id = ?';
  const [rows] = await db.query(query, [id]);
  return rows[0];
};
