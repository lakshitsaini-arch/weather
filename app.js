const API_KEY = 'YOUR_API_KEY';

const CURRENT_API = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_API = 'https://api.openweathermap.org/data/2.5/forecast';

function WeatherApp() {
    this.weatherDisplay = document.getElementById('weather-display');
    this.forecastContainer = document.getElementById('forecast-container');
    this.recentContainer = document.getElementById('recent-searches');
    this.input = document.getElementById('city-input');

    this.recentSearches = [];

    this.init();
}

// ================= INIT =================
WeatherApp.prototype.init = function () {
    document.getElementById('search-btn')
        .addEventListener('click', this.handleSearch.bind(this));

    document.getElementById('clear-history')
        .addEventListener('click', this.clearHistory.bind(this));

    this.loadRecentSearches();
    this.loadLastCity();
};

// ================= SEARCH =================
WeatherApp.prototype.handleSearch = function () {
    const city = this.input.value.trim();
    if (city) this.getWeather(city);
};

// ================= WEATHER FETCH =================
WeatherApp.prototype.getWeather = async function (city) {
    const currentUrl = `${CURRENT_API}?q=${city}&appid=${API_KEY}&units=metric`;
    const forecastUrl = `${FORECAST_API}?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const [current, forecast] = await Promise.all([
            axios.get(currentUrl),
            axios.get(forecastUrl)
        ]);

        this.displayWeather(current.data);
        this.displayForecast(forecast.data);

        this.saveRecentSearch(city);
        localStorage.setItem('lastCity', city);

    } catch (err) {
        this.weatherDisplay.innerHTML = 'City not found';
    }
};

// ================= CURRENT WEATHER =================
WeatherApp.prototype.displayWeather = function (data) {
    const html = `
        <h2>${data.name}</h2>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">
        <div>${Math.round(data.main.temp)}°C</div>
        <p>${data.weather[0].description}</p>
    `;
    this.weatherDisplay.innerHTML = html;
};

// ================= FORECAST =================
WeatherApp.prototype.displayForecast = function (data) {
    const days = data.list.filter(d => d.dt_txt.includes("12:00:00")).slice(0, 5);

    this.forecastContainer.innerHTML = days.map(d => `
        <div class="forecast-card">
            <h4>${new Date(d.dt_txt).toLocaleDateString('en-US', { weekday: 'short' })}</h4>
            <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}.png">
            <div>${Math.round(d.main.temp)}°C</div>
        </div>
    `).join('');
};

// ================= LOCAL STORAGE =================
WeatherApp.prototype.loadRecentSearches = function () {
    const saved = JSON.parse(localStorage.getItem('recentSearches')) || [];
    this.recentSearches = saved;
    this.displayRecentSearches();
};

WeatherApp.prototype.saveRecentSearch = function (city) {
    city = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

    this.recentSearches = this.recentSearches.filter(c => c !== city);
    this.recentSearches.unshift(city);

    if (this.recentSearches.length > 5) this.recentSearches.pop();

    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
    this.displayRecentSearches();
};

WeatherApp.prototype.displayRecentSearches = function () {
    this.recentContainer.innerHTML = '';

    this.recentSearches.forEach(function (city) {
        const btn = document.createElement('button');
        btn.className = 'recent-btn';
        btn.textContent = city;
        btn.addEventListener('click', () => this.getWeather(city));
        this.recentContainer.appendChild(btn);
    }.bind(this));
};

// ================= AUTO LOAD =================
WeatherApp.prototype.loadLastCity = function () {
    const last = localStorage.getItem('lastCity');
    if (last) this.getWeather(last);
};

// ================= CLEAR =================
Weather