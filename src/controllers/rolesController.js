const { query } = require('../db');


const getRoles = async (req, res) => {
  try {
    const result = await query('SELECT * FROM roles');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createRole = async (req, res) => {
  const { name } = req.body;
  try {
    const roleResult = await query(
      'INSERT INTO roles (name) VALUES ($1) RETURNING *',
      [name]
    );
    const role = roleResult.rows[0];
    res.status(201).json({ ...role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};



module.exports = { getRoles, createRole };
