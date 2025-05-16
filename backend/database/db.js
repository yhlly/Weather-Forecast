// Database operation utility functions
const executeQuery = async (db, sql, params = []) => {
    try {
        const [results] = await db.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

// Query all weather records
const getAllWeatherQueries = async (db) => {
    return executeQuery(
        db,
        'SELECT * FROM weather_queries ORDER BY created_at DESC'
    );
};

// Get weather record by ID
const getWeatherQueryById = async (db, id) => {
    const results = await executeQuery(
        db,
        'SELECT * FROM weather_queries WHERE id = ?',
        [id]
    );
    return results.length ? results[0] : null;
};

// Create new weather record
const createWeatherQuery = async (db, { location, weatherData }) => {
    const startDate = new Date();
    const endDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    return executeQuery(
        db,
        'INSERT INTO weather_queries (location, start_date, end_date, weather_data) VALUES (?, ?, ?, ?)',
        [location, startDate, endDate, JSON.stringify(weatherData)]
    );
};

// Delete weather record
const deleteWeatherQuery = async (db, id) => {
    return executeQuery(
        db,
        'DELETE FROM weather_queries WHERE id = ?',
        [id]
    );
};

module.exports = {
    executeQuery,
    getAllWeatherQueries,
    getWeatherQueryById,
    createWeatherQuery,
    deleteWeatherQuery
};