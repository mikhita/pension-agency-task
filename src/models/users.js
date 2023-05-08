// in modules/users.js
const db = require('../db');

const getAllUsers = async () => {
  const query = 'SELECT * FROM users';
  const { rows } = await db.query(query);
  return rows;
};

const getUserById = async (userId) => {
  const query = 'SELECT * FROM users WHERE id = $1';
  const { rows } = await db.query(query, [userId]);
  return rows[0];
};

const createUser = async ({ name, email, age, roleId }) => {
  const query = 'INSERT INTO users (name, email, age, role_id) VALUES ($1, $2, $3, $4) RETURNING *';
  const { rows } = await db.query(query, [name, email, age, roleId]);
  return rows[0];
};

const updateUser = async (userId, { name, email, age, roleId }) => {
  const query = 'UPDATE users SET name = $1, email = $2, age = $3, role_id = $4 WHERE id = $5 RETURNING *';
  const { rows } = await db.query(query, [name, email, age, roleId, userId]);
  return rows[0];
};

const deleteUser = async (userId) => {
  const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
  const { rows } = await db.query(query, [userId]);
  return rows[0];
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
