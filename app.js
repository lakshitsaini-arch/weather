// Your OpenWeatherMap API Key
const API_KEY = 'YOUR_API_KEY_HERE';  // Replace with your actual API key
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Get references to HTML elements
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');

// Function to fetch weather data
async function getWeather(city) {
    // Show loading state
    showLoading();
    
    // Disable search button
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';
    
    // Build the API URL
    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;
    
    // Wrap in try-catch block
    try {
        // Use await with axios.get()
        const response = await axios.get(url);
        
        // Log the response (for debugging)
        console.log('Weather Data:', response.data);
        
        // Call displayWeather with response.data
        displayWeather(response.data);
        
    } catch (error) {
        // Log the error
        console.error('Error fetching weather:', error);
        
        // Check error type and show appropriate message
        if (error.response && error.response.status === 404) {
            showError('City not found. Please check the spelling and try again.');
        } else {
            showError('Something went wrong. Please try again later.');
        }
    } finally {
        // Re-enable button
        searchBtn.disabled = false;
        searchBtn.textContent = '🔍 Search';
    }
}

// Function to display error messages
function showError(message) {
    // Create HTML for error message with styling
    const errorHTML = `
        <div class="error-message">
            <p>⚠️ ${message}</p>
        </div>
    `;
    
    // Display in #weather-display div
    document.getElementById('weather-display').innerHTML = errorHTML;
}

// Function to show loading state
function showLoading() {
    const loadingHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p class="loading-text">Loading weather data...</p>
        </div>
    `;
    
    // Display in #weather-display div
    document.getElementById('weather-display').innerHTML = loadingHTML;
}

// Function to display weather data
function displayWeather(data) {
    // Extract the data we need
    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    
    // Create HTML to display
    const weatherHTML = `
        <div class="weather-info">
            <h2 class="city-name">${cityName}</h2>
            <img src="${iconUrl}" alt="${description}" class="weather-icon">
            <div class="temperature">${temperature}°C</div>
            <p class="description">${description}</p>
        </div>
    `;
    
    // Put it on the page
    document.getElementById('weather-display').innerHTML = weatherHTML;
    
    // Focus back on input for quick follow-up search
    cityInput.focus();
    
    // Clear the input field
    cityInput.value = '';
}

// Function to show welcome message on page load
function showWelcome() {
    const welcomeHTML = `
        <div class="welcome-message">
            <p>👋 Welcome to SkyFetch!</p>
            <p>Search for a city above to see the current weather.</p>
        </div>
    `;
    document.getElementById('weather-display').innerHTML = welcomeHTML;
}

// Function to validate city input
function validateInput(city) {
    // Check if input is empty or only spaces
    if (!city || city.trim() === '') {
        showError('Please enter a city name.');
        return false;
    }
    
    // Check minimum length (at least 2 characters)
    if (city.trim().length < 2) {
        showError('City name must be at least 2 characters long.');
        return false;
    }
    
    return true;
}

// Add click event listener to search button
searchBtn.addEventListener('click', function() {
    // Get city name from input
    const city = cityInput.value;
    
    // Validate input
    if (validateInput(city)) {
        // Call getWeather with validated city
        getWeather(city);
    }
});

// Add Enter key support
cityInput.addEventListener('keypress', function(event) {
    // Check if Enter key was pressed
    if (event.key === 'Enter') {
        // Get city name from input
        const city = cityInput.value;
        
        // Validate input
        if (validateInput(city)) {
            // Call getWeather with validated city
            getWeather(city);
        }
    }
});

// Show welcome message when page loads
showWelcome();