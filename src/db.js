const { Pool } = require('pg');
const { query } = require('pg');
require('dotenv').config()


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pension_agency',
  password: `${process.env.PASSWORD}`,
  port: 5432,
});

module.exports = {
  async getAllUsers() {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users');
      return result.rows;
    } finally {
      client.release();
    }
  },


  async getUserById(userId) {
    
    console.log('getUserById query:', query, [userId]);
    const { rows: users } = await pool.query(`
      SELECT u.name, u.email, u.age, r.name AS role
      FROM users u
      INNER JOIN user_roles ur ON u.id = ur.user_id
      INNER JOIN roles r ON ur.role_id = r.id
      WHERE u.id = $1
    `, [userId]);
  
    if (!users || !users[0]) {
      throw new Error(`User with ID ${userId} not found`);
    }
  
    return users[0];
  },

  async createUser(name, email, age) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows: user } = await client.query(
        'INSERT INTO users (name, email, age) VALUES ($1, $2, $3) RETURNING id',
        [name, email, age]
      );
      await client.query('COMMIT');
      return user[0].id;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async getRoleIdByName(name) {
    const query = {
      text: 'SELECT id FROM roles WHERE name = $1',
      values: [name],
    };
    try {
      const result = await pool.query(query);
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0].id;
    } catch (err) {
      console.error('Error getting role ID by name:', err.stack);
      throw err;
    }
  },

  async assignUserRole(userId, roleId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
        [userId, roleId]
      );
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async updateUser(userId, name, email, age) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        'UPDATE users SET name = $1, email = $2, age = $3 WHERE id = $4',
        [name, email, age, userId]
      );
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
  
};
