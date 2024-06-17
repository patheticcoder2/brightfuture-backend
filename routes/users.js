// Import necessary modules
const express = require('express');
const router = express.Router();
const User = require('../models/users');

// Create a new user
router.post('/register', async (req, res) => {
	const { name, email, password, type } = req.body;

	// Create a new user with the provided name, email, and password

	const user = new User({ name, email, password, type });
	await user.save();

	// Return the new user as JSON
	res.json(user);
});
module.exports = router;
