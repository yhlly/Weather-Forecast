const express = require('express');
const axios = require('axios');
const router = express.Router();
const db = require('../database/db');

// Replace with your OpenWeatherMap API key
const API_KEY = '1572aef4eb80fe2a3ec4b1418e4e0d5a';

// Get weather data
router.get('/current', async (req, res) => {
    try {
        const { location } = req.query;

        if (!location) {
            return res.status(400).json({ message: 'Location is required' });
        }

        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`
        );

        res.json(response.data);
    } catch (error) {
        console.error('Error getting weather data:', error.message);
        if (error.response && error.response.data) {
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(500).json({ message: 'Failed to get weather data' });
    }
});

// Get 5-day forecast
router.get('/forecast', async (req, res) => {
    try {
        const { location } = req.query;

        if (!location) {
            return res.status(400).json({ message: 'Location is required' });
        }

        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${API_KEY}&units=metric`
        );

        res.json(response.data);
    } catch (error) {
        console.error('Error getting weather forecast:', error.message);
        if (error.response && error.response.data) {
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(500).json({ message: 'Failed to get weather forecast' });
    }
});

// Get weather by coordinates
router.get('/by-coords', async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }

        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        res.json(response.data);
    } catch (error) {
        console.error('Error getting weather data:', error.message);
        if (error.response && error.response.data) {
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(500).json({ message: 'Failed to get weather data' });
    }
});

// Get 5-day forecast by coordinates
router.get('/forecast-by-coords', async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }

        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        res.json(response.data);
    } catch (error) {
        console.error('Error getting weather forecast:', error.message);
        if (error.response && error.response.data) {
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(500).json({ message: 'Failed to get weather forecast' });
    }
});

// Save weather query
router.post('/save', async (req, res) => {
    try {
        const { location, weatherData } = req.body;

        if (!location || !weatherData) {
            return res.status(400).json({ message: 'Location and weather data are required' });
        }

        const result = await db.createWeatherQuery(req.app.locals.db, {
            location,
            weatherData
        });

        res.status(201).json({
            id: result.insertId,
            message: 'Query saved'
        });
    } catch (error) {
        console.error('Error saving weather query:', error.message);
        res.status(500).json({ message: 'Failed to save weather query' });
    }
});

// Get all saved queries
router.get('/history', async (req, res) => {
    try {
        const queries = await db.getAllWeatherQueries(req.app.locals.db);

        // Convert weather_data from JSON string to object
        const formattedQueries = queries.map(query => ({
            ...query,
            weather_data: typeof query.weather_data === 'string'
                ? JSON.parse(query.weather_data)
                : query.weather_data
        }));

        res.json(formattedQueries);
    } catch (error) {
        console.error('Error getting history:', error.message);
        res.status(500).json({ message: 'Failed to get history' });
    }
});

// Delete query
router.delete('/history/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.deleteWeatherQuery(req.app.locals.db, id);
        res.json({ message: 'Record deleted' });
    } catch (error) {
        console.error('Error deleting record:', error.message);
        res.status(500).json({ message: 'Failed to delete record' });
    }
});

// Export as JSON
router.get('/export/json', async (req, res) => {
    try {
        const queries = await db.getAllWeatherQueries(req.app.locals.db);

        // Convert weather_data from JSON string to object
        const formattedQueries = queries.map(query => ({
            ...query,
            weather_data: typeof query.weather_data === 'string'
                ? JSON.parse(query.weather_data)
                : query.weather_data
        }));

        res.header('Content-Type', 'application/json');
        res.header('Content-Disposition', 'attachment; filename=weather-data.json');
        res.json(formattedQueries);
    } catch (error) {
        console.error('Error exporting JSON:', error.message);
        res.status(500).json({ message: 'Failed to export data' });
    }
});

// Export as CSV
router.get('/export/csv', async (req, res) => {
    try {
        const queries = await db.getAllWeatherQueries(req.app.locals.db);

        // Create CSV header
        let csv = 'Location,Temperature,Description,Humidity,WindSpeed,CreatedAt\n';

        // Add data rows
        queries.forEach(query => {
            const weatherData = typeof query.weather_data === 'string'
                ? JSON.parse(query.weather_data)
                : query.weather_data;

            const temp = weatherData.main?.temp || 'N/A';
            const desc = weatherData.weather?.[0]?.description || 'N/A';
            const humidity = weatherData.main?.humidity || 'N/A';
            const windSpeed = weatherData.wind?.speed || 'N/A';

            // Format date
            const createdAt = query.created_at ? new Date(query.created_at).toLocaleString() : 'N/A';

            csv += `${query.location},${temp},${desc},${humidity},${windSpeed},${createdAt}\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename=weather-data.csv');
        res.send(csv);
    } catch (error) {
        console.error('Error exporting CSV:', error.message);
        res.status(500).json({ message: 'Failed to export data' });
    }
});

// Export as XML
router.get('/export/xml', async (req, res) => {
    try {
        const xml2js = require('xml2js');
        const queries = await db.getAllWeatherQueries(req.app.locals.db);

        // Convert query results to an object suitable for XML format
        const xmlObj = {
            WeatherData: {
                Query: queries.map(query => {
                    const weatherData = typeof query.weather_data === 'string'
                        ? JSON.parse(query.weather_data)
                        : query.weather_data;

                    return {
                        Id: query.id,
                        Location: query.location,
                        Temperature: weatherData.main?.temp || 'N/A',
                        Description: weatherData.weather?.[0]?.description || 'N/A',
                        Humidity: weatherData.main?.humidity || 'N/A',
                        WindSpeed: weatherData.wind?.speed || 'N/A',
                        CreatedAt: query.created_at ? new Date(query.created_at).toISOString() : null
                    };
                })
            }
        };

        // Create XML builder
        const builder = new xml2js.Builder({
            rootName: 'WeatherQueries',
            headless: true,
            renderOpts: {
                pretty: true,
                indent: '  ',
                newline: '\n'
            }
        });

        // Convert object to XML
        const xml = builder.buildObject(xmlObj);

        res.header('Content-Type', 'application/xml');
        res.header('Content-Disposition', 'attachment; filename=weather-data.xml');
        res.send(xml);
    } catch (error) {
        console.error('Error exporting XML:', error.message);
        res.status(500).json({ message: 'Failed to export data' });
    }
});

// Export as PDF
router.get('/export/pdf', async (req, res) => {
    try {
        const PDFDocument = require('pdfkit');
        const queries = await db.getAllWeatherQueries(req.app.locals.db);

        // Create a new PDF document
        const doc = new PDFDocument({ margin: 50 });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=weather-data.pdf');

        // Pipe PDF to response
        doc.pipe(res);

        // Add title
        doc.fontSize(25).text('Weather Query Data', { align: 'center' });
        doc.moveDown();

        // Add export time
        doc.fontSize(12).text(`Export time: ${new Date().toLocaleString()}`, { align: 'right' });
        doc.moveDown(2);

        // Process each query
        queries.forEach((query, index) => {
            const weatherData = typeof query.weather_data === 'string'
                ? JSON.parse(query.weather_data)
                : query.weather_data;

            // Format date
            const createdAt = query.created_at ? new Date(query.created_at).toLocaleString() : 'N/A';

            // Add query information
            doc.fontSize(16).text(`Query #${index + 1}: ${query.location}`, { underline: true });
            doc.moveDown(0.5);

            doc.fontSize(12).text(`Temperature: ${weatherData.main?.temp || 'N/A'}°C`);
            doc.text(`Weather conditions: ${weatherData.weather?.[0]?.description || 'N/A'}`);
            doc.text(`Humidity: ${weatherData.main?.humidity || 'N/A'}%`);
            doc.text(`Wind speed: ${weatherData.wind?.speed || 'N/A'} m/s`);
            doc.text(`Created time: ${createdAt}`);

            // Add space between each query
            doc.moveDown(2);

            // If not the last query, add a divider line
            if (index < queries.length - 1) {
                doc.moveTo(50, doc.y)
                    .lineTo(doc.page.width - 50, doc.y)
                    .stroke();
                doc.moveDown();
            }
        });

        // Add footer
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            doc.fontSize(10).text(
                `Page ${i + 1} of ${pageCount}`,
                50,
                doc.page.height - 50,
                { align: 'center' }
            );
        }

        // Finalize PDF document
        doc.end();
    } catch (error) {
        console.error('Error exporting PDF:', error.message);
        res.status(500).json({ message: 'Failed to export data' });
    }
});

// Export as Markdown
router.get('/export/markdown', async (req, res) => {
    try {
        const queries = await db.getAllWeatherQueries(req.app.locals.db);

        // Create Markdown content
        let markdown = '# Weather Query Data\n\n';
        markdown += `*Export time: ${new Date().toLocaleString()}*\n\n`;

        // Add detailed information for each query
        queries.forEach((query, index) => {
            const weatherData = typeof query.weather_data === 'string'
                ? JSON.parse(query.weather_data)
                : query.weather_data;

            // Format date
            const createdAt = query.created_at ? new Date(query.created_at).toLocaleString() : 'N/A';

            markdown += `## Query #${index + 1}: ${query.location}\n\n`;
            markdown += `- **Temperature:** ${weatherData.main?.temp || 'N/A'}°C\n`;
            markdown += `- **Weather conditions:** ${weatherData.weather?.[0]?.description || 'N/A'}\n`;
            markdown += `- **Humidity:** ${weatherData.main?.humidity || 'N/A'}%\n`;
            markdown += `- **Wind speed:** ${weatherData.wind?.speed || 'N/A'} m/s\n`;
            markdown += `- **Created time:** ${createdAt}\n\n`;

            // Add divider line
            if (index < queries.length - 1) {
                markdown += '---\n\n';
            }
        });

        res.header('Content-Type', 'text/markdown');
        res.header('Content-Disposition', 'attachment; filename=weather-data.md');
        res.send(markdown);
    } catch (error) {
        console.error('Error exporting Markdown:', error.message);
        res.status(500).json({ message: 'Failed to export data' });
    }
});

module.exports = router;