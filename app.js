// WeatherApp Constructor Function
function WeatherApp(apiKey) {
    // Store API credentials
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
    this.forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
    
    // Store DOM element references
    this.searchBtn = document.getElementById('search-btn');
    this.cityInput = document.getElementById('city-input');
    this.weatherDisplay = document.getElementById('weather-display');
    
    // Initialize the app
    this.init();
}

// Initialize event listeners and display welcome message
WeatherApp.prototype.init = function() {
    // Add click event listener to search button
    this.searchBtn.addEventListener('click', this.handleSearch.bind(this));
    
    // Add Enter key support to input
    this.cityInput.addEventListener('keypress', (function(event) {
        if (event.key === 'Enter') {
            this.handleSearch();
        }
    }).bind(this));
    
    // Display welcome message on load
    this.showWelcome();
};

// Handle search button click and input validation
WeatherApp.prototype.handleSearch = function() {
    // Get and trim city input
    const city = this.cityInput.value.trim();
    
    // Validate input
    if (!city) {
        this.showError('Please enter a city name.');
        return;
    }
    
    if (city.length < 2) {
        this.showError('City name must be at least 2 characters long.');
        return;
    }
    
    // Fetch weather data
    this.getWeather(city);
};

// Fetch current weather and forecast data
WeatherApp.prototype.getWeather = async function(city) {
    // Show loading state
    this.showLoading();
    
    // Disable search button during request
    this.searchBtn.disabled = true;
    this.searchBtn.textContent = 'Searching...';
    
    // Build API URL for current weather
    const currentWeatherUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
    
    try {
        // Fetch current weather
        const currentResponse = await axios.get(currentWeatherUrl);
        
        // Fetch forecast data
        const forecastData = await this.getForecast(city);
        
        // Log the responses (for debugging)
        console.log('Current Weather:', currentResponse.data);
        console.log('Forecast:', forecastData);
        
        // Display current weather
        this.displayWeather(currentResponse.data);
        
        // Display 5-day forecast
        this.displayForecast(forecastData);
        
    } catch (error) {
        // Log the error
        console.error('Error fetching weather:', error);
        
        // Show appropriate error message
        if (error.response && error.response.status === 404) {
            this.showError('City not found. Please check the spelling and try again.');
        } else {
            this.showError('Something went wrong. Please try again later.');
        }
    } finally {
        // Re-enable search button
        this.searchBtn.disabled = false;
        this.searchBtn.textContent = '🔍 Search';
    }
};

// Fetch 5-day forecast data
WeatherApp.prototype.getForecast = async function(city) {
    // Build forecast API URL
    const url = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
    
    try {
        // Fetch forecast data
        const response = await axios.get(url);
        
        // Return the forecast data
        return response.data;
        
    } catch (error) {
        console.error('Error fetching forecast:', error);
        throw error;
    }
};

// Display current weather information
WeatherApp.prototype.displayWeather = function(data) {
    // Extract weather data
    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    
    // Create weather HTML
    const weatherHTML = `
        <div class="weather-info">
            <h2 class="city-name">${cityName}</h2>
            <img src="${iconUrl}" alt="${description}" class="weather-icon">
            <div class="temperature">${temperature}°C</div>
            <p class="description">${description}</p>
        </div>
    `;
    
    // Display on page
    this.weatherDisplay.innerHTML = weatherHTML;
    
    // Focus on input for next search
    this.cityInput.focus();
};

// Process forecast data to get one entry per day
WeatherApp.prototype.processForecastData = function(data) {
    // Filter forecast list to get entries at 12:00:00 (noon)
    const dailyForecasts = data.list.filter((item) => {
        // dt_txt format: "2024-01-20 12:00:00"
        return item.dt_txt.includes('12:00:00');
    });
    
    // Return only the first 5 days
    return dailyForecasts.slice(0, 5);
};

// Display 5-day forecast
WeatherApp.prototype.displayForecast = function(data) {
    // Process the forecast data to get daily forecasts
    const dailyForecasts = this.processForecastData(data);
    
    // Create HTML for each forecast day
    const forecastHTML = dailyForecasts.map((day) => {
        // Extract forecast data
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(day.main.temp);
        const description = day.weather[0].description;
        const icon = day.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
        
        // Create forecast card HTML
        return `
            <div class="forecast-card">
                <h4 class="forecast-day">${dayName}</h4>
                <img src="${iconUrl}" alt="${description}" class="forecast-icon">
                <div class="forecast-temp">${temp}°C</div>
                <p class="forecast-desc">${description}</p>
            </div>
        `;
    }).join('');
    
    // Create forecast section HTML
    const forecastSection = `
        <div class="forecast-section">
            <h3 class="forecast-title">5-Day Forecast</h3>
            <div class="forecast-container">
                ${forecastHTML}
            </div>
        </div>
    `;
    
    // Append forecast to weather display (don't replace current weather)
    this.weatherDisplay.innerHTML += forecastSection;
};

// Display loading state with spinner
WeatherApp.prototype.showLoading = function() {
    const loadingHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p class="loading-text">Loading weather data...</p>
        </div>
    `;
    
    // Display loading state
    this.weatherDisplay.innerHTML = loadingHTML;
};

// Display error messages
WeatherApp.prototype.showError = function(message) {
    const errorHTML = `
        <div class="error-message">
            <p>⚠️ ${message}</p>
        </div>
    `;
    
    // Display error
    this.weatherDisplay.innerHTML = errorHTML;
};

// Display welcome message on page load
WeatherApp.prototype.showWelcome = function() {
    const welcomeHTML = `
        <div class="welcome-message">
            <p>👋 Welcome to SkyFetch!</p>
            <p>Search for a city above to see the current weather and 5-day forecast.</p>
        </div>
    `;
    
    // Display welcome message
    this.weatherDisplay.innerHTML = welcomeHTML;
};

// Create and initialize the app instance
const app = new WeatherApp('09b4061c0f454deda066c90e97c1fac9');