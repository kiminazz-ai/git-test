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