const API_URL = '/api/weather';

// DOM elements
const locationInput = document.getElementById('location-input');
const searchButton = document.getElementById('search-button');
const currentLocationButton = document.getElementById('current-location-button');
const errorMessage = document.getElementById('error-message');
const saveButton = document.getElementById('save-button');
const exportJsonButton = document.getElementById('export-json');
const exportCsvButton = document.getElementById('export-csv');
const exportXmlButton = document.getElementById('export-xml');
const exportPdfButton = document.getElementById('export-pdf');
const exportMarkdownButton = document.getElementById('export-markdown');
const historyContainer = document.getElementById('history-container');
const locationMediaSection = document.getElementById('location-media');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const videosContainer = document.getElementById('videos-container');
const photosContainer = document.getElementById('photos-container');

// OpenWeatherMap icon URL
const ICON_URL = 'https://openweathermap.org/img/wn/';

// Current weather data
let currentWeatherData = null;
let currentLocation = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Event listeners
    if (searchButton) {
        searchButton.addEventListener('click', searchWeather);
    }

    if (currentLocationButton) {
        currentLocationButton.addEventListener('click', getCurrentLocationWeather);
    }

    if (saveButton) {
        saveButton.addEventListener('click', saveWeatherQuery);
    }

    if (exportJsonButton) {
        exportJsonButton.addEventListener('click', exportToJson);
    }

    if (exportCsvButton) {
        exportCsvButton.addEventListener('click', exportToCsv);
    }

    if (exportXmlButton) {
        exportXmlButton.addEventListener('click', () => window.open(`${API_URL}/export/xml`, '_blank'));
    }

    if (exportPdfButton) {
        exportPdfButton.addEventListener('click', () => window.open(`${API_URL}/export/pdf`, '_blank'));
    }

    if (exportMarkdownButton) {
        exportMarkdownButton.addEventListener('click', () => window.open(`${API_URL}/export/markdown`, '_blank'));
    }

    initializeTabs();
    loadHistory();
});

// Search weather
async function searchWeather() {
    const location = locationInput?.value.trim();

    if (!location) {
        showError('Please enter a location');
        return;
    }

    try {
        hideError();

        // Get current weather
        const weatherResponse = await fetch(`${API_URL}/current?location=${encodeURIComponent(location)}`);

        if (!weatherResponse.ok) {
            const errorData = await weatherResponse.json();
            throw new Error(errorData.message || 'Failed to get weather data');
        }

        const weatherData = await weatherResponse.json();
        currentWeatherData = weatherData;
        displayCurrentWeather(weatherData);
        console.log('Current weather data received:', weatherData);

        // Get 5-day forecast
        const forecastResponse = await fetch(`${API_URL}/forecast?location=${encodeURIComponent(location)}`);

        if (!forecastResponse.ok) {
            throw new Error('Failed to get forecast data');
        }

        const forecastData = await forecastResponse.json();
        displayForecast(forecastData);

        hideLoading();

    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

// Show loading message
function showLoading(message = 'Loading...') {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
}

// Hide loading message
function hideLoading() {
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
}

// Get weather by current location
function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        hideError();

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                try {
                    // Get current weather
                    const weatherResponse = await fetch(`${API_URL}/by-coords?lat=${lat}&lon=${lon}`);

                    if (!weatherResponse.ok) {
                        const errorData = await weatherResponse.json();
                        throw new Error(errorData.message || 'Failed to get weather data');
                    }

                    const weatherData = await weatherResponse.json();
                    currentWeatherData = weatherData;
                    displayCurrentWeather(weatherData);
                    console.log('Current weather data received:', weatherData);

                    // Update input field
                    if (locationInput) {
                        locationInput.value = weatherData.name;
                    }

                    // Get 5-day forecast
                    const forecastResponse = await fetch(`${API_URL}/forecast-by-coords?lat=${lat}&lon=${lon}`);

                    if (!forecastResponse.ok) {
                        throw new Error('Failed to get forecast data');
                    }

                    const forecastData = await forecastResponse.json();
                    displayForecast(forecastData);

                    hideLoading();
                } catch (error) {
                    hideLoading();
                    showError(error.message);
                    console.error('Location weather error:', error);
                }
            }
        );
    }
}

// Display current weather
function displayCurrentWeather(data) {
    console.log('Displaying current weather');
    const locationNameEl = document.getElementById('location-name');
    const temperatureEl = document.getElementById('temperature');
    const weatherDescEl = document.getElementById('weather-description');
    const humidityEl = document.getElementById('humidity');
    const windSpeedEl = document.getElementById('wind-speed');
    const pressureEl = document.getElementById('pressure');
    const visibilityEl = document.getElementById('visibility');
    const weatherIconEl = document.getElementById('weather-icon');

    if (locationNameEl) locationNameEl.textContent = data.name;
    if (temperatureEl) temperatureEl.textContent = Math.round(data.main.temp);
    if (weatherDescEl) weatherDescEl.textContent = data.weather[0].description;
    if (humidityEl) humidityEl.textContent = data.main.humidity;
    if (windSpeedEl) windSpeedEl.textContent = data.wind.speed;
    if (pressureEl) pressureEl.textContent = data.main.pressure;
    if (visibilityEl) visibilityEl.textContent = (data.visibility / 1000).toFixed(1);

    const iconCode = data.weather[0].icon;
    if (weatherIconEl) {
        weatherIconEl.src = `${ICON_URL}${iconCode}@2x.png`;
        weatherIconEl.alt = data.weather[0].description;
    }

    // Set current location and show media section
    currentLocation = data.name;

    if (locationMediaSection) locationMediaSection.style.display = 'block';

    loadGoogleMap(currentLocation);
    loadYouTubeVideos(currentLocation);
    loadLocationPhotos(currentLocation);
}

// Display 5-day forecast
function displayForecast(data) {
    console.log('Displaying forecast');
    const forecastContainer = document.getElementById('forecast-container');
    const forecastSection = document.getElementById('forecast');

    if (!forecastContainer) {
        console.warn('Forecast container not found');
        return;
    }

    forecastContainer.innerHTML = '';

    // Get different days (not just different times)
    const dailyForecasts = {};

    data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();

        if (!dailyForecasts[date]) {
            dailyForecasts[date] = item;
        }
    });

    // Limit to 5 days
    const dates = Object.keys(dailyForecasts).slice(0, 5);
    console.log(`Processing ${dates.length} days for forecast`);

    dates.forEach(date => {
        const forecast = dailyForecasts[date];
        const temp = Math.round(forecast.main.temp);
        const iconCode = forecast.weather[0].icon;
        const description = forecast.weather[0].description;

        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="date">${date}</div>
            <img src="${ICON_URL}${iconCode}@2x.png" alt="${description}">
            <div class="temp">${temp}°C</div>
            <div class="desc">${description}</div>
        `;

        forecastContainer.appendChild(forecastCard);
    });

    // Show forecast section
    if (forecastSection) forecastSection.style.display = 'block';
}

// Save weather query
async function saveWeatherQuery() {
    if (!currentWeatherData) {
        showError('No weather data to save');
        return;
    }

    try {
        console.log('Sending save request to API');
        const response = await fetch(`${API_URL}/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                location: currentWeatherData.name,
                weatherData: currentWeatherData
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save query');
        }

        const result = await response.json();
        console.log('Save successful:', result);

        // Reload history
        loadHistory();

        // Show success message
        alert('Weather query saved successfully!');

    } catch (error) {
        showError(error.message);
        console.error('Save query error:', error);
    }
}

// Load history
async function loadHistory() {
    console.log('Loading history...');
    try {
        const response = await fetch(`${API_URL}/history`);

        if (!response.ok) {
            throw new Error('Failed to get history');
        }

        const historyData = await response.json();
        console.log(`Loaded ${historyData.length} history items`);
        displayHistory(historyData);

    } catch (error) {
        console.error('Error loading history:', error);
    }
}

// Display history
function displayHistory(data) {
    console.log('Displaying history');
    if (!historyContainer) {
        console.warn('History container not found');
        return;
    }

    historyContainer.innerHTML = '';

    if (data.length === 0) {
        historyContainer.innerHTML = '<p class="no-history">No search history available. Save a query to see it here.</p>';
        return;
    }

    data.forEach(item => {
        // Note: MySQL date format may differ from MongoDB
        const date = new Date(item.created_at).toLocaleString();

        // Weather data may be already parsed object or string
        const weatherData = typeof item.weather_data === 'string'
            ? JSON.parse(item.weather_data)
            : item.weather_data;

        const temp = weatherData.main?.temp ? `${Math.round(weatherData.main.temp)}°C` : '--';
        const description = weatherData.weather?.[0]?.description || '--';

        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-info">
                <div class="history-location">${item.location}</div>
                <div class="history-created">Saved: ${date}</div>
            </div>
            <div class="history-weather">
                <span class="history-temp">${temp}</span>
                <span class="history-desc">${description}</span>
            </div>
            <div class="history-actions">
                <button class="delete-button" data-id="${item.id}">Delete</button>
            </div>
        `;

        historyContainer.appendChild(historyItem);
    });

    // Add delete button event listeners
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', deleteHistoryItem);
    });

    // Show history section
    const historySection = document.getElementById('history-section');
    if (historySection) historySection.style.display = 'block';
}

// Delete history item
async function deleteHistoryItem(event) {
    const id = event.target.dataset.id;
    console.log(`Deleting history item: ${id}`);

    if (confirm('Are you sure to delete this query?')) {
        try {
            const response = await fetch(`${API_URL}/history/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete record');
            }

            loadHistory();

        } catch (error) {
            alert('Failed to delete record: ' + error.message);
        }
    }
}

// Export functions
function exportToJson() {
    console.log('Exporting to JSON');
    window.open(`${API_URL}/export/json`, '_blank');
}

function exportToCsv() {
    console.log('Exporting to CSV');
    window.open(`${API_URL}/export/csv`, '_blank');
}

// Show error message
function showError(message) {
    console.error('Error:', message);
    if (!errorMessage) return;

    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.style.color = '#e74c3c';
    errorMessage.style.backgroundColor = '#fadbd8';
}

// Hide error message
function hideError() {
    if (!errorMessage) return;

    errorMessage.style.display = 'none';
}

// Initialize tabs functionality
function initializeTabs() {
    if (!tabButtons || !tabButtons.length) {
        return;
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Deactivate all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Activate clicked tab
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            const tabContent = document.getElementById(tabId);

            if (tabContent) {
                tabContent.classList.add('active');
                console.log(`Activated tab: ${tabId}`);
            }

            // Load content if needed
            if (tabId === 'video-tab' && videosContainer) {
                loadYouTubeVideos(currentLocation);
            } else if (tabId === 'photo-tab' && photosContainer) {
                loadLocationPhotos(currentLocation);
            }
        });
    });
}

// Load Google Map
function loadGoogleMap(location) {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) {
        return;
    }

    try {
        // Create iframe for Google Maps embed
        mapContainer.innerHTML = '';

        const iframe = document.createElement('iframe');
        iframe.width = '100%';
        iframe.height = '400px';
        iframe.style.border = '0';
        iframe.setAttribute('loading', 'lazy');
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');

        // Get API key from config or use placeholder
        const apiKey = 'AIzaSyBm5iATHJ212WTaOrzZNRkArLIM14NvRp0';
        iframe.src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(location)}`;

        mapContainer.appendChild(iframe);
        console.log('Map iframe created');

    } catch (error) {
        console.error('Error loading map:', error);
        mapContainer.innerHTML = `
            <div class="error-message">
                Failed to load map: ${error.message}
                <br>
                <a href="https://www.google.com/maps/search/${encodeURIComponent(location)}" target="_blank">
                    View location on Google Maps
                </a>
            </div>
        `;
    }
}

// Load YouTube Videos
async function loadYouTubeVideos(location) {
    if (!videosContainer) {
        console.warn('Videos not found');
        return;
    }

    try {

        const response = await fetch(`/api/media/youtube?location=${encodeURIComponent(location)}`);

        if (!response.ok) {
            throw new Error('Failed to fetch videos');
        }

        const videos = await response.json();
        console.log(`Loaded ${videos.length} videos`);

        if (videos.length === 0) {
            videosContainer.innerHTML = '<div class="no-results">No videos found for this location</div>';
            return;
        }

        // Create video cards
        videosContainer.innerHTML = '';

        videos.forEach(video => {
            // Format publication date
            const publishDate = new Date(video.publishedAt).toLocaleDateString();

            const videoCard = document.createElement('div');
            videoCard.className = 'video-card';
            videoCard.dataset.videoId = video.id;

            videoCard.innerHTML = `
                <div class="video-thumbnail" data-video-id="${video.id}">
                    <img src="${video.thumbnailUrl}" alt="${video.title}">
                    <div class="video-play-button" data-video-id="${video.id}"></div>
                </div>
                <div class="video-info">
                    <div class="video-title">${video.title}</div>
                    <div class="video-description">${video.description}</div>
                    <div class="video-channel">
                        ${video.channelTitle} • ${publishDate}
                    </div>
                </div>
            `;

            videosContainer.appendChild(videoCard);
        });

        // Add click events to play buttons
        document.querySelectorAll('.video-play-button').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();

                const videoId = this.getAttribute('data-video-id');
                if (videoId) {
                    // Replace thumbnail with embedded player
                    const thumbnailContainer = this.closest('.video-thumbnail');
                    thumbnailContainer.innerHTML = `
                        <iframe 
                            width="100%" 
                            height="200" 
                            src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                            title="YouTube video player" 
                            style="min-height: 200px;" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    `;
                }
            });
        });

        // Make whole card clickable too
        document.querySelectorAll('.video-card').forEach(card => {
            card.addEventListener('click', function(e) {
                // If play button already clicked, don't trigger this
                if (e.target.classList.contains('video-play-button')) {
                    return;
                }

                const videoId = this.dataset.videoId;
                if (videoId) {
                    const thumbnailContainer = this.querySelector('.video-thumbnail');
                    thumbnailContainer.innerHTML = `
                        <iframe 
                            width="100%" 
                            height="200" 
                            src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                            title="YouTube video player"
                            style="min-height: 200px;" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    `;
                }
            });
        });

    } catch (error) {
        console.error('Error loading videos:', error);
        videosContainer.innerHTML = `<div class="error-message">Failed to load videos: ${error.message}</div>`;
    }
}

// Load Location Photos
async function loadLocationPhotos(location) {
    console.log(`Loading photos for: ${location}`);
    if (!photosContainer) {
        console.warn('Photos container not found');
        return;
    }

    try {

        const response = await fetch(`/api/media/photos?location=${encodeURIComponent(location)}`);

        if (!response.ok) {
            throw new Error('Failed to fetch photos');
        }

        const photos = await response.json();
        console.log(`Loaded ${photos.length} photos`);

        if (photos.length === 0) {
            photosContainer.innerHTML = '<div class="no-results">No photos found for this location</div>';
            return;
        }

        // Create photo cards
        photosContainer.innerHTML = '';

        photos.forEach(photo => {
            const photoCard = document.createElement('div');
            photoCard.className = 'photo-card';

            photoCard.innerHTML = `
                <img src="${photo.smallUrl}" alt="${photo.description}">
                <div class="photo-caption">
                    ${photo.description}
                    <div class="photo-attribution">Photo by ${photo.userName} on Unsplash</div>
                </div>
            `;

            // Open full size photo on click
            photoCard.addEventListener('click', () => {
                window.open(photo.url, '_blank');
            });

            photosContainer.appendChild(photoCard);
        });

    } catch (error) {
        console.error('Error loading photos:', error);
        photosContainer.innerHTML = `<div class="error-message">Failed to load photos: ${error.message}</div>`;
    }
}