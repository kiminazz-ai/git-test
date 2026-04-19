// -------------------------------------------------------
// Weather App — app.js
// Uses OpenWeatherMap free API
// Get your own free API key at: https://openweathermap.org/api
// -------------------------------------------------------

const API_KEY = "bd5e378503939ddaee76f12ad7a97608"; // Replace with your own key

const weatherIcons = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Drizzle: "🌦️",
  Thunderstorm: "⛈️",
  Snow: "❄️",
  Mist: "🌫️",
  Fog: "🌫️",
  Haze: "🌫️",
  Smoke: "🌫️",
  Dust: "🌫️",
  Sand: "🌫️",
  Ash: "🌫️",
  Squall: "💨",
  Tornado: "🌪️",
};

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// -------------------------------------------------------
// Dark Mode Toggle
// -------------------------------------------------------
function toggleTheme() {
  const html = document.documentElement;
  const btn = document.getElementById("theme-toggle");
  const isDark = html.getAttribute("data-theme") === "dark";

  if (isDark) {
    html.setAttribute("data-theme", "light");
    btn.textContent = "🌙";
    localStorage.setItem("theme", "light");
  } else {
    html.setAttribute("data-theme", "dark");
    btn.textContent = "☀️";
    localStorage.setItem("theme", "dark");
  }
}

// Load saved theme on startup
function loadTheme() {
  const saved = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
  document.getElementById("theme-toggle").textContent = saved === "dark" ? "☀️" : "🌙";
}

// -------------------------------------------------------
// Status helper
// -------------------------------------------------------
function setStatus(message, type = "") {
  const status = document.getElementById("status");
  status.textContent = message;
  status.className = type;
}

// -------------------------------------------------------
// Main fetch function
// -------------------------------------------------------
async function fetchWeather() {
  const city = document.getElementById("city-input").value.trim();
  if (!city) return;

  const card = document.getElementById("weather-card");
  card.style.display = "none";
  setStatus("Fetching weather...", "loading");

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
      ),
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
      ),
    ]);

    if (!currentRes.ok) throw new Error("City not found. Please try another name.");

    const current = await currentRes.json();
    const forecast = await forecastRes.json();

    renderCurrent(current);
    renderForecast(forecast);

    setStatus("");
    card.style.display = "block";
  } catch (err) {
    setStatus(err.message || "Something went wrong. Please try again.", "error");
  }
}

// -------------------------------------------------------
// Render current weather
// -------------------------------------------------------
function renderCurrent(data) {
  const now = new Date();

  document.getElementById("city-display").textContent =
    `${data.name}, ${data.sys.country}`;

  document.getElementById("date-display").textContent =
    now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  document.getElementById("main-icon").textContent =
    weatherIcons[data.weather[0].main] || "🌡️";

  document.getElementById("temp-display").textContent =
    `${Math.round(data.main.temp)}°C`;

  const desc = data.weather[0].description;
  document.getElementById("condition-display").textContent =
    desc.charAt(0).toUpperCase() + desc.slice(1);

  document.getElementById("feels-like").textContent =
    `${Math.round(data.main.feels_like)}°C`;

  document.getElementById("humidity").textContent =
    `${data.main.humidity}%`;

  document.getElementById("wind").textContent =
    `${Math.round(data.wind.speed)} m/s`;
}

// -------------------------------------------------------
// Render 5-day forecast
// -------------------------------------------------------
function renderForecast(data) {
  const dailyMap = {};

  data.list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const key = date.toDateString();
    if (!dailyMap[key]) {
      dailyMap[key] = {
        temps: [],
        main: item.weather[0].main,
        day: date.getDay(),
      };
    }
    dailyMap[key].temps.push(item.main.temp);
  });

  const days = Object.keys(dailyMap).slice(0, 5);

  document.getElementById("forecast-row").innerHTML = days
    .map((key) => {
      const d = dailyMap[key];
      const avgTemp = Math.round(
        d.temps.reduce((a, b) => a + b, 0) / d.temps.length
      );
      return `
        <div class="fday">
          <div class="fday-name">${dayNames[d.day]}</div>
          <div class="fday-icon">${weatherIcons[d.main] || "🌡️"}</div>
          <div class="fday-temp">${avgTemp}°C</div>
        </div>`;
    })
    .join("");
}

// -------------------------------------------------------
// Event listeners & init
// -------------------------------------------------------
document.getElementById("city-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") fetchWeather();
});

loadTheme();

document.getElementById("city-input").value = "Kuantan";
fetchWeather();

// ... existing code above ...

async function fetchWeather() {
  const city = document.getElementById("city-input").value.trim();
  if (!city) return;

  const card = document.getElementById("weather-card");
  card.style.display = "none";
  setStatus("Fetching data...", "loading");

  try {
    // We add a third fetch for Prayer Times
    const [currentRes, forecastRes, prayerRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`),
      fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=&method=2`)
    ]);

    if (!currentRes.ok) throw new Error("City not found.");
    
    const current = await currentRes.json();
    const forecast = await forecastRes.json();
    const prayerData = await prayerRes.json();

    renderCurrent(current);
    renderForecast(forecast);
    renderPrayers(prayerData.data.timings); // Call the new prayer render function

    setStatus("");
    card.style.display = "block";
  } catch (err) {
    setStatus(err.message || "Something went wrong.", "error");
  }
}

// New function to render Prayer Times
function renderPrayers(timings) {
  const prayers = [
    { name: "Fajr", time: timings.Fajr },
    { name: "Dhuhr", time: timings.Dhuhr },
    { name: "Asr", time: timings.Asr },
    { name: "Maghrib", time: timings.Maghrib },
    { name: "Isha", time: timings.Isha }
  ];

  document.getElementById("prayer-row").innerHTML = prayers
    .map(p => `
        <div class="prayer-item">
          <div class="prayer-name">${p.name}</div>
          <div class="prayer-time">${p.time}</div>
        </div>
    `).join("");
}
// Clock feature
function updateClock() {
    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    // Add leading zero (e.g. 09 instead of 9)
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    const timeString = `${hours}:${minutes}:${seconds}`;

    document.getElementById("clock").textContent = timeString;
}

// Run every second
setInterval(updateClock, 1000);

// Run once immediately
updateClock();
