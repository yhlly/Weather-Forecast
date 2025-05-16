const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');
const weatherRoutes = require('./routes/weather');
const mediaRoutes = require('./routes/media');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Static file service
app.use(express.static(path.join(__dirname, '../frontend')));

// Create MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // use your own password
    database: 'weather_app',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Attach connection pool to app object for use in routes
app.locals.db = pool;

// Test database connection
async function testDatabaseConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('MySQL database connection successful');
        connection.release();
    } catch (error) {
        console.error('MySQL database connection error:', error);
        console.log('Continuing to run the application, but database functions may not be available');
    }
}

testDatabaseConnection();

// API routes
app.use('/api/weather', weatherRoutes);
app.use('/api/media', mediaRoutes);

// Frontend route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Handle program exit and close database connection
process.on('SIGINT', async () => {
    try {
        await pool.end();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error closing database connection:', error);
        process.exit(1);
    }
});
