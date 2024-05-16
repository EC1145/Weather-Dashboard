// Constants
const API_KEY = "10b39d3949defe1fe4c908de76766d6e";
const API_BASE_URL = "https://api.openweathermap.org/data/2.5/";
const SEARCH_HISTORY_KEY = "weather_search_history";

// DOM Elements
const cityInput = document.getElementById("city-input");
const citySearchForm = document.getElementById("city-search-form");
const currentWeatherSection = document.getElementById("current-weather");
const forecastSection = document.getElementById("forecast");
const searchHistorySection = document.getElementById("search-history");

// Event listeners
citySearchForm.addEventListener("submit", handleFormSubmit);
searchHistorySection.addEventListener("click", handleSearchHistoryClick);

// Function to handle form submission
async function handleFormSubmit(event) {
  event.preventDefault();
  const cityName = cityInput.value.trim();
  if (cityName === "") return; // Don't search if the input is empty

  try {
    const weatherData = await fetchWeatherData(cityName);
    displayCurrentWeather(weatherData.current, cityName);
    displayForecast(weatherData.daily);
    addToSearchHistory(cityName);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    alert("Error fetching weather data. Please try again.");
  }

  // Clear input field
  cityInput.value = "";
}

// Function to fetch weather data from OpenWeatherMap API
async function fetchWeatherData(cityName) {
  const response = await fetch(
    `${API_BASE_URL}weather?q=${cityName}&appid=${API_KEY}&units=metric`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }
  return await response.json();
}

// Function to display current weather
function displayCurrentWeather(weatherData, cityName) {
  const { dt, weather, temp, humidity, wind_speed } = weatherData;
  const date = new Date(dt * 1000);
  const iconUrl = `http://openweathermap.org/img/wn/${weather[0].icon}.png`;

  const html = `
    <h2 class="mb-4">Current Weather in ${cityName}</h2>
    <div>
      <img src="${iconUrl}" alt="${weather[0].description}">
      <p>Temperature: ${temp}°C</p>
      <p>Humidity: ${humidity}%</p>
      <p>Wind Speed: ${wind_speed} m/s</p>
    </div>
  `;
  currentWeatherSection.innerHTML = html;
}

// Function to display 5-day forecast
function displayForecast(forecastData) {
  const html = forecastData
    .slice(1, 6)
    .map((day) => {
      const { dt, weather, temp, humidity, wind_speed } = day;
      const date = new Date(dt * 1000);
      const iconUrl = `http://openweathermap.org/img/wn/${weather[0].icon}.png`;

      return `
      <div class="col-md mb-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">${date.toLocaleDateString()}</h5>
            <img src="${iconUrl}" alt="${weather[0].description}">
            <p class="card-text">Temperature: ${temp.day}°C</p>
            <p class="card-text">Wind Speed: ${wind_speed} m/s</p>
            <p class="card-text">Humidity: ${humidity}%</p>
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  forecastSection.innerHTML = `
    <h2 class="mb-4">5-Day Forecast</h2>
    <div class="row">${html}</div>
  `;
}

// Function to add searched city to search history
function addToSearchHistory(cityName) {
  let searchHistory =
    JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY)) || [];
  if (!searchHistory.includes(cityName)) {
    searchHistory = [cityName, ...searchHistory.slice(0, 4)]; // Limit to 5 items
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
    displaySearchHistory();
  }
}

// Function to display search history
function displaySearchHistory() {
  const searchHistory =
    JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY)) || [];
  const html = searchHistory
    .map(
      (city) =>
        `<button type="button" class="btn btn-secondary mr-2">${city}</button>`
    )
    .join("");
  searchHistorySection.innerHTML = `<h2 class="mb-3">Search History</h2>${html}`;
}

// Function to handle clicking on a city in the search history
async function handleSearchHistoryClick(event) {
  if (event.target.matches(".btn")) {
    const cityName = event.target.textContent;
    try {
      const weatherData = await fetchWeatherData(cityName);
      displayCurrentWeather(weatherData.current, cityName);
      displayForecast(weatherData.daily);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      alert("Error fetching weather data. Please try again.");
    }
  }
}

// Display search history on page load
displaySearchHistory();
