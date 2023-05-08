// in models/roles.js
const db = require('../db');

const getAllRoles = async () => {
  const query = 'SELECT * FROM roles';
  const { rows } = await db.query(query);
  return rows;
};

const getRoleById = async (roleId) => {
  const query = 'SELECT * FROM roles WHERE id = $1';
  const { rows } = await db.query(query, [roleId]);
  return rows[0];
};

module.exports = {
  getAllRoles,
  getRoleById,
};
