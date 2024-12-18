const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');

require('dotenv').config(); 

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database!');
});

// API Routes
app.post('/addEmployee', (req, res) => {
    const { employeeID, employeeName, employeeEmail, phoneNumber, department, dateOfJoining, role } = req.body;

    // Check for duplicate EmployeeID or Email
    db.query('SELECT * FROM Employees WHERE EmployeeID = ? OR Email = ?', [employeeID, employeeEmail], (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (results.length > 0) {
            // Duplicate found, return an error
            res.status(400).json({ message: 'Employee ID or Email already exists' });
            return;
        }

        // If no duplicate, insert the new employee
        const query = `
            INSERT INTO Employees (EmployeeID, EmployeeName, Email, PhoneNumber, Department, DateOfJoining, Role)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(query, [employeeID, employeeName, employeeEmail, phoneNumber, department, dateOfJoining, role], (err, result) => {
            if (err) {
                console.error('Error inserting employee:', err);
                res.status(500).json({ error: 'Database error' });
                return;
            }
            res.status(201).json({ message: 'Employee added successfully!' });
        });
    });
});

// Route to fetch all employees (optional for testing)
app.get('/employees', (req, res) => {
    db.query('SELECT * FROM Employees', (err, results) => {
        if (err) {
            console.error('Error fetching employees:', err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.status(200).json(results);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
