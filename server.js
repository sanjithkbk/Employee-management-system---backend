// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

// Initialize the Express app
const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database!');
});

// Routes
// Add Employee
app.post('/addEmployee', (req, res) => {
    const { employeeID, employeeName, employeeEmail, phoneNumber, department, dateOfJoining, role } = req.body;

    const checkQuery = `SELECT * FROM Employees WHERE EmployeeID = ? OR Email = ?`;
    db.query(checkQuery, [employeeID, employeeEmail], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            res.status(500).json({ error: 'Database error' });
            return;
        }

        if (results.length > 0) {
            res.status(400).json({ message: 'Employee ID or Email already exists' });
            return;
        }

        const insertQuery = `INSERT INTO Employees (EmployeeID, EmployeeName, Email, PhoneNumber, Department, DateOfJoining, Role) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        db.query(insertQuery, [employeeID, employeeName, employeeEmail, phoneNumber, department, dateOfJoining, role], (err) => {
            if (err) {
                console.error('Error inserting employee:', err);
                res.status(500).json({ error: 'Database error' });
                return;
            }
            res.status(201).json({ message: 'Employee added successfully!' });
        });
    });
});

// Get All Employees
app.get('/employees', (req, res) => {
    db.query('SELECT * FROM Employees', (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.status(200).json(results);
    });
});

// Start the Server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
