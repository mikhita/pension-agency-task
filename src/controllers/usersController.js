const { pool } = require('../db');
const { query } = require('../db');


const getUsers = async (req, res) => {
  try {
    const result = await query('SELECT * FROM users');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const assignRoleToUser = async (req, res) => {
  const { user_id, role_name } = req.body;

  try {
    // Retrieve the role id based on the role name
    const roleResult = await query(
      'SELECT id FROM roles WHERE name = $1',
      [role_name]
    );
    const role = roleResult.rows[0];

    // Update the user's role id with the retrieved role id
    await pool.query(
      'UPDATE users SET role_id = $1 WHERE id = $2',
      [role.id, user_id]
    );

    res.status(200).json({ message: 'Role assigned to user' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createUser = async (req, res) => {
  const { name, email, age, role_id } = req.body;
  try {
    const userResult = await query(
      'INSERT INTO users (name, email, age, role_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, age, role_id]
    );
    const user = userResult.rows[0];
    res.status(201).json({ ...user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};






const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, age } = req.body;
  try {
    const result = await query(
      'UPDATE users SET name = $1, email = $2, age = $3 WHERE id = $4 RETURNING *',
      [name, email, age, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getUsers, assignRoleToUser, getUserById, createUser, updateUser, deleteUser };
