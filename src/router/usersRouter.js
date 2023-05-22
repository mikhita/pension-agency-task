const express = require('express');
const usersController = require('../controllers/usersController');

const router = express.Router();

router.get('/', usersController.getUsers);

router.get('/users/:id', usersController.getUser);


// Create a new user
router.post('/users', usersController.createUser);

// Update an existing user
router.put('/users/:id', usersController.updateUser);

router.put('/:userId/role', usersController.updateUserRole);

router.get('/users/role/:roleName', usersController.getUserByRole);


module.exports = router;
