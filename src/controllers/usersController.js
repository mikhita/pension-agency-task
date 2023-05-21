const db = require('../db');
const { Pool } = require('pg');


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pension_agency',
  password: `${process.env.PASSWORD}`,
  port: 5432,
});

exports.getUsers = async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
};

exports.getUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await db.getUserById(userId);
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get user' });
  }
};


exports.createUser = async (req, res) => {
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
    const { rows: user } = await client.query(
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



exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const { name, email, age } = req.body;

  try {
    // Update the user's details
    await db.updateUser(userId, name, email, age);

    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

exports.updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { newRoleName } = req.body;

  try {
    await db.updateUserRole(userId, newRoleName);

    res.status(200).json({ message: 'User role updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update user role' });
  }
};





