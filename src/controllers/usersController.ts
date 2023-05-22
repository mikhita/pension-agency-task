import { Request, Response } from 'express';
import db from '../db';
import { Pool, QueryResult } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pension_agency',
  password: process.env.PASSWORD,
  port: 5432,
});

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await db.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id;

  try {
    const user = await db.getUserById(Number(userId));
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get user' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  const { name, email, age, role } = req.body;

  const client = await pool.connect();

  try {
    // Start a transaction
    await client.query('BEGIN');

    // Check if a user with the same data already exists
    const { rows: existingUsers } = await client.query(
      'SELECT * FROM users WHERE name = $1 AND email = $2 AND age = $3',
      [name, email, age]
    );

    if (existingUsers.length > 0) {
      throw new Error('User already exists');
    }

    // Create the user
    const { rows: user } = await client.query<{ id: number }>(
      'INSERT INTO users (name, email, age) VALUES ($1, $2, $3) RETURNING id',
      [name, email, age]
    );
    const userId = user[0].id;

    // Commit the user creation
    await client.query('COMMIT');

    // Start a new transaction
    await client.query('BEGIN');

    // Get the ID of the specified role
    const roleId = await db.getRoleIdByName(role);

    if (roleId === null) {
      throw new Error('Role not found');
    }

    // Assign the role to the user
    await db.assignUserRole(userId, roleId);

    // Commit the role assignment
    await client.query('COMMIT');

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    // Roll back the transaction
    await client.query('ROLLBACK');

    console.error(err);
    res.status(500).json({ message: 'Failed to create user' });
  } finally {
    client.release();
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id;
  const { name, email, age } = req.body;

  try {
    // Update the user's details
    await db.updateUser(Number(userId), name, email, age);

    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  const { newRoleName } = req.body;

  try {
    await db.updateUserRole(Number(userId), newRoleName);

    res.status(200).json({ message: 'User role updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

export const getUsersByRole = async (req: Request, res: Response): Promise<void> => {
  const { roleName } = req.params;

  try {
    const users = await db.getUsersByRole(roleName);
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get users by role' });
  }
};
