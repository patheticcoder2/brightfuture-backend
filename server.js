const express = require('express');
const {
	getUserByEmail,
	createUser,
	getUserById,
	getAllTutors,
	updateBiographyAndEmailByUserId,
	getSubjectByUserId,
} = require('./database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin: 'http://localhost:3000', // Replace with your frontend URL
		credentials: true,
	})
);

const secretKey = 'your_secret_key'; // Replace with your actual secret key

// Middleware to verify JWT and extract user ID
function verifyToken(req, res, next) {
	const token = req.cookies.token;
	if (!token) {
		return res.status(403).json({ error: 'No token provided' });
	}

	jwt.verify(token, secretKey, (err, decoded) => {
		if (err) {
			return res.status(500).json({ error: 'Failed to authenticate token' });
		}
		req.userId = decoded.id;
		next();
	});
}

app.get('/user/:email', (req, res) => {
	const email = req.params.email;
	getUserByEmail(email, (error, result) => {
		if (error) {
			return res.status(500).json(error);
		}
		res.json(result);
	});
});

app.post('/createUser', (req, res) => {
	const { name, email, password, biography, country, type } = req.body;

	createUser(
		name,
		email,
		'' + password,
		biography,
		country,
		type,
		(error, result) => {
			if (error) {
				return res.status(500).json(error);
			}
			res.json(result);
		}
	);
});

app.post('/login', (req, res) => {
	const { email, password } = req.body;
	getUserByEmail(email, (error, user) => {
		if (error) {
			return res.status(500).json(error);
		}

		// Check if user exists
		if (user.error) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Compare the hashed password
		bcrypt.compare('' + password, user.password, (err, result) => {
			if (err) {
				return res.status(500).json({ error: err.message });
			}
			if (!result) {
				return res.status(401).json({ error: 'Incorrect password' });
			}

			// Generate JWT token
			const token = jwt.sign({ id: user.id, email: user.email }, secretKey, {
				expiresIn: '365d',
			});
			// Set the token as a cookie
			res.cookie('token', token, { httpOnly: true, sameSite: 'Lax' });
			res.json({ success: 'Logged in successfully' });
		});
	});
});
app.get('/account', verifyToken, (req, res) => {
	getUserById(req.userId, (error, user) => {
		if (error) {
			return res.status(500).json({ error: error.message });
		}
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}
		res.send(user);
	});
});

// Endpoint to check if the user has a specific user ID
app.get('/check-user/:id', verifyToken, (req, res) => {
	const userIdToCheck = parseInt(req.params.id, 10);

	if (req.userId === userIdToCheck) {
		res.json({ success: 'User ID matches' });
	} else {
		res.status(403).json({ error: 'User ID does not match' });
	}
});

// Logout endpoint
app.post('/logout', (req, res) => {
	res.cookie('token', '', {
		expires: new Date(0),
		httpOnly: true,
		sameSite: 'Lax',
	});
	res.json({ success: 'Logged out successfully' });
});

app.get('/tutors', (req, res) => {
	getAllTutors((error, tutors) => {
		if (error) {
			console.log('Error fetching tutors: ' + error);
			return res.status(500).json({ error: error });
		}
		res.send(tutors);
	});
});
// Endpoint to fetch subjects for a specific userId
app.get('/users/:userId/subjects', (req, res) => {
	const userId = req.params.userId;
	getSubjectByUserId(userId, (error, subjects) => {
		if (error) {
			return res.status(500).json({ error: error.message });
		}
		res.send(subjects);
	});
});

// New endpoint to update email and biography by user ID
app.put('/updateBiographyAndEmail', verifyToken, (req, res) => {
	const { email, biography } = req.body;
	const userId = req.userId;

	updateBiographyAndEmailByUserId(userId, email, biography, (error, result) => {
		if (error) {
			console.log(error.message);
			return res.status(500).json({ error: error.message });
		}
		res.json({ success: 'Email and biography updated successfully' });
	});
});
app.get('/users/:id', (req, res) => {
	getUserById(req.params.id, (error, user) => {
		if (error) {
			return res.status(500).json({ error: 'Error getting User' });
		}
		res.send(user);
	});
});

app.listen(8000, () => {
	console.log('Server is running on port 8000');
});
