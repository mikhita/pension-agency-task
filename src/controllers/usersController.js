const db = require('../db');

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

  try {
    // Create the user and retrieve the new ID
    const userId = await db.createUser(name, email, age);

    // Get the ID of the specified role
    const roleId = await db.getRoleIdByName(role);

    // Assign the role to the user
    await db.assignUserRole(userId, roleId);

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create user' });
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
  const userId = req.params.id;
  const roleName = req.body.role;

  try {
    const roleId = await db.getRoleIdByName(roleName);
    await db.updateUserRole(userId, roleId);
    res.status(200).json({ message: 'User role updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update user role' });
  }
};



