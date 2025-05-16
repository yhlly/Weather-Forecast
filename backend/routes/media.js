const express = require('express');
const axios = require('axios');
const router = express.Router();
const apiKeys = require('../config/api-keys');

// YouTube Videos for a location
router.get('/youtube', async (req, res) => {
    try {
        const { location } = req.query;

        if (!location) {
            return res.status(400).json({ message: 'Location is required' });
        }

        // Create search query for travel/weather videos about the location
        const searchQuery = `${location} travel weather tourism`;

        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                maxResults: 5,
                q: searchQuery,
                type: 'video',
                key: apiKeys.YOUTUBE_API_KEY,
                videoEmbeddable: true
            }
        });

        // Extract useful information from the YouTube response
        const videos = response.data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnailUrl: item.snippet.thumbnails.medium.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt
        }));

        res.json(videos);
    } catch (error) {
        console.error('Error getting YouTube videos:', error.message);
        res.status(500).json({ message: 'Failed to get videos', error: error.message });
    }
});

// Google Maps data for a location
router.get('/maps', async (req, res) => {
    try {
        const { location } = req.query;

        if (!location) {
            return res.status(400).json({ message: 'Location is required' });
        }

        // Get geocoding data (convert location name to coordinates)
        const geocodeResponse = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: location,
                key: apiKeys.GOOGLE_MAPS_API_KEY
            }
        });

        if (geocodeResponse.data.results.length === 0) {
            return res.status(404).json({ message: 'Location geographic data not found' });
        }

        const locationData = geocodeResponse.data.results[0];
        const { lat, lng } = locationData.geometry.location;

        // Return location data including coordinates and formatted address
        res.json({
            location: locationData.formatted_address,
            coordinates: { lat, lng },
            placeId: locationData.place_id,
            // Include the API key for frontend usage
            apiKey: apiKeys.GOOGLE_MAPS_API_KEY
        });
    } catch (error) {
        console.error('Error getting map data:', error.message);
        res.status(500).json({ message: 'Failed to get map data', error: error.message });
    }
});

// Unsplash photos for a location
router.get('/photos', async (req, res) => {
    try {
        const { location } = req.query;

        if (!location) {
            return res.status(400).json({ message: 'Location is required' });
        }

        const response = await axios.get('https://api.unsplash.com/search/photos', {
            params: {
                query: `${location} landscape city`,
                per_page: 9,
                orientation: 'landscape'
            },
            headers: {
                Authorization: `Client-ID ${apiKeys.UNSPLASH_ACCESS_KEY}`
            }
        });

        const photos = response.data.results.map(photo => ({
            id: photo.id,
            url: photo.urls.regular,
            smallUrl: photo.urls.small,
            description: photo.description || photo.alt_description || `${location} photo`,
            userName: photo.user.name,
            userLink: photo.user.links.html
        }));

        res.json(photos);
    } catch (error) {
        console.error('Error getting photos:', error.message);
        res.status(500).json({ message: 'Failed to get photos', error: error.message });
    }
});

module.exports = router;