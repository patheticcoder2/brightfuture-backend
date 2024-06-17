const mysql = require('mysql2');
const mysql_mock = require('mysql-mock');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Create a connection pool for real mysql
const pool = mysql.createPool({
	connectionLimit: 10,
	host: 'localhost',
	user: 'node',
	password: '1234',
	database: 'brightfuture',
	waitForConnections: true,
	queueLimit: 0,
});

// Create a connection pool for fake mysql
// const pool = mysql_mock.createPool({
// 	host: 'localhost',
// 	user: 'root',
// 	password: 'password',
// 	database: 'test',
// });

// Method to get a user by email
function getUserByEmail(email, callback) {
	pool.query(
		'SELECT * FROM users WHERE email = ?',
		[email],
		(error, results) => {
			if (error) {
				return callback({ error: error.message });
			}
			if (results.length === 0) {
				return callback({ error: 'User not found' });
			}
			return callback(null, results[0]);
		}
	);
}

// Method to get a user by id
function getUserById(id, callback) {
	pool.query(
		'SELECT name, email, type, biography, country, imgurl FROM users WHERE id = ?',
		[id],
		(error, results) => {
			if (error) {
				return callback({ error: error.message });
			}
			if (results.length === 0) {
				return callback({ error: 'User not found' });
			}
			return callback(null, results[0]);
		}
	);
}
function getAllTutors(callback) {
	pool.query(
		'SELECT id, name, email, type FROM users WHERE type = "Tutor"',
		(error, results) => {
			if (error) {
				console.log(error);
				return callback({ error: error.message });
			}
			return callback(null, results);
		}
	);
}
function getSubjectByUserId(userId, callback) {
	// Query to fetch subjects associated with the userId
	const query = `
        SELECT subjects.id, subjects.name
        FROM subjects
        INNER JOIN users_subject ON subjects.id = users_subject.subjectId
        WHERE users_subject.userId = ?
    `;

	pool.query(query, [userId], (err, results) => {
		if (err) {
			callback({ error: 'Internal server error' });
			console.error('Error fetching subjects:', err);

			return;
		}

		// Send the fetched subjects as JSON response
		callback(null, results);
	});
}
//Function to Update the User Info by the User Id
const updateBiographyAndEmailByUserId = (
	userId,
	newEmail,
	newBiography,
	callback
) => {
	const query = 'UPDATE users SET email = ?, biography = ? WHERE id = ?';
	pool.query(query, [newEmail, newBiography, userId], (err, result) => {
		if (err) {
			return callback(err, null);
		}
		callback(null, result);
	});
};

// Method to create a new user
function createUser(name, email, password, biography, country, type, callback) {
	// Check if the user already exists
	pool.query(
		'SELECT * FROM users WHERE email = ?',
		[email],
		(error, results) => {
			if (error) {
				return callback({ error: error.message });
			}
			if (results.length > 0) {
				return callback({ error: 'User already exists' });
			}

			// Hash the password before saving
			bcrypt.hash(password, 10, (err, hash) => {
				if (err) {
					return callback({ error: err.message });
				}

				// Insert the new user with hashed password
				pool.query(
					'INSERT INTO users (name, email, password, biography, country, type) VALUES (?, ?, ?, ?, ?, ?)',
					[name, email, hash, biography, country, type],
					(error, results) => {
						if (error) {
							return callback({ error: error.message });
						}
						if (results.affectedRows === 1) {
							return callback(null, { success: 'User created successfully' });
						} else {
							return callback({ error: 'Failed to create user' });
						}
					}
				);
			});
		}
	);
}

module.exports = {
	getUserByEmail,
	createUser,
	getUserById,
	getAllTutors,
	updateBiographyAndEmailByUserId,
	getSubjectByUserId,
};
