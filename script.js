const weatherBox = document.getElementById('omar-weather-app');
const spawnArea = document.getElementById('icon-spawn-area');
const weatherEmojis = ['☀️', '☁️', '🌧️', '⚡', '❄️'];

// Create 25 icons
for (let i = 0; i < 25; i++) {
    const emoji = document.createElement('span');
    emoji.classList.add('interactive-weather-icon');
    emoji.innerText = weatherEmojis[Math.floor(Math.random() * weatherEmojis.length)];
    
    // Set random initial positions inside the container
    emoji.style.left = Math.random() * 95 + '%';
    emoji.style.top = Math.random() * 95 + '%';
    
    spawnArea.appendChild(emoji);
}

// Fixed Interaction Logic
weatherBox.addEventListener('mousemove', (e) => {
    const allIcons = document.querySelectorAll('.interactive-weather-icon');
    
    allIcons.forEach(icon => {
        const rect = icon.getBoundingClientRect();
        const iconX = rect.left + rect.width / 2;
        const iconY = rect.top + rect.height / 2;
        
        // Calculate distance between cursor and emoji
        const distance = Math.hypot(e.clientX - iconX, e.clientY - iconY);
        
        if (distance < 120) {
            const angle = Math.atan2(iconY - e.clientY, iconX - e.clientX);
            // Push distance
            const force = 40; 
            const moveX = Math.cos(angle) * force;
            const moveY = Math.sin(angle) * force;
            
            icon.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.4)`;
        } else {
            icon.style.transform = `translate(0, 0) scale(1)`;
        }
    });
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
