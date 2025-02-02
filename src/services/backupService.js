import { db } from '../models/database.js';

export const createFile = async (data) => {
  const { userId, content, sourceFile } = data;
  const query = `
    INSERT INTO Record (userId, content, sourceFile, syncStatus)
    VALUES (?, ?, ?, 'PENDING');
  `;
  const [result] = await db.query(query, [userId, content, sourceFile]);
  return result.insertId;
};
