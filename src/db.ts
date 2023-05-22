import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pension_agency',
  password: process.env.PASSWORD,
  port: 5432,
});

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

interface Role {
  id: number;
  name: string;
}

export default {
  async getAllUsers(): Promise<User[]> {
    const client = await pool.connect();
    try {
      const result: QueryResult<User> = await client.query('SELECT * FROM users');
      return result.rows;
    } finally {
      client.release();
    }
  },

  async getUserById(userId: number): Promise<User> {
    console.log('getUserById query:', [userId]);
    const { rows: users } = await pool.query<User>(
      `
      SELECT u.name, u.email, u.age, r.name AS role
      FROM users u
      INNER JOIN user_roles ur ON u.id = ur.user_id
      INNER JOIN roles r ON ur.role_id = r.id
      WHERE u.id = $1
      `,
      [userId]
    );

    if (!users || !users[0]) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return users[0];
  },

  async createUser(name: string, email: string, age: number): Promise<number> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if a user with the same email already exists
      const { rows: existingUsers } = await client.query<User>(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      if (existingUsers.length > 0) {
        await client.query('ROLLBACK');
        throw new Error('A user with the same email already exists');
      }

      // Insert the new user into the users table
      const { rows: newUser } = await client.query<{ id: number }>(
        'INSERT INTO users (name, email, age) VALUES ($1, $2, $3) RETURNING id',
        [name, email, age]
      );

      await client.query('COMMIT');
      return newUser[0].id;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async getRoleIdByName(name: string): Promise<number | null> {
    const query = {
      text: 'SELECT id FROM roles WHERE name = $1',
      values: [name],
    };
    try {
      console.log('Role name:', name);
      console.log('SQL query:', query);
      const result = await pool.query<Role>(query);
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0].id;
    } catch (err: any) {
      console.error('Error getting role ID by name:', err.stack);
      throw err;
    }
  },

  async assignUserRole(userId: number, roleId: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      if (roleId === null) {
        throw new Error('Role not found');
      }
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

  async updateUser(userId: number, name: string, email: string, age: number): Promise<void> {
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

  async updateUserRole(userId: number, newRoleName: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if the new role name exists in the roles table
      const { rows: existingRoles } = await client.query<Role>(
        'SELECT * FROM roles WHERE name = $1',
        [newRoleName]
      );

      if (existingRoles.length === 0) {
        await client.query('ROLLBACK');
        throw new Error('New role not found');
      }

      const roleId = existingRoles[0].id;

      if (roleId === null) {
        throw new Error('Role not found');
      }

      // Update the user's role in the user_roles table
      await client.query(
        'UPDATE user_roles SET role_id = $1 WHERE user_id = $2',
        [roleId, userId]
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async getUsersByRole(roleName: string): Promise<User[]> {
    const client = await pool.connect();
    try {
      const query = `
        SELECT u.*
        FROM users u
        INNER JOIN user_roles ur ON u.id = ur.user_id
        INNER JOIN roles r ON ur.role_id = r.id
        WHERE r.name = $1
      `;
      const result = await client.query<User>(query, [roleName]);
      return result.rows;
    } finally {
      client.release();
    }
  },
};
