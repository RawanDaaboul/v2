// Game variables
let countries = [];
let usedCountries = new Set(); // Track used countries to avoid repetition
let currentCountries = [];
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;

// DOM elements
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const leftFlag = document.getElementById('leftFlag');
const leftName = document.getElementById('leftName');
const leftPopulation = document.getElementById('leftPopulation');
const rightFlag = document.getElementById('rightFlag');
const rightName = document.getElementById('rightName');
const rightPopulation = document.getElementById('rightPopulation');
const higherBtn = document.getElementById('higherBtn');
const lowerBtn = document.getElementById('lowerBtn');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const playAgainBtn = document.getElementById('playAgainBtn');
const loadingElement = document.getElementById('loading');
const gameContainer = document.getElementById('gameContainer');
const startGameBtn = document.getElementById('startGameBtn');

// Import country data (assuming it's in a separate file)
// Or define it here if it's a small dataset
// For example:
const countryData = [
    // { name: { common: 'Country 1' }, population: 100000, flags: { png: 'url1' } },
    // { name: { common: 'Country 2' }, population: 200000, flags: { png: 'url2' } },
    // Add more countries as needed
];

// Initialize the game
async function initGame() {
    loadingElement.classList.remove('hidden');
    gameContainer.classList.add('hidden');
    
    // Update high score display
    highScoreElement.textContent = highScore;
    
    try {
        console.log('Fetching countries data...');
        // Set a timeout for the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        // Fetch countries data
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,population,flags', {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Fetched ${data.length} countries`);
        
        // Filter out countries with populations below 21,000
        countries = data
            .filter(country => country.population >= 21000)
            .sort(() => Math.random() - 0.5); // Shuffle the array
        
        console.log(`Filtered to ${countries.length} countries with population >= 21,000`);
        
        if (countries.length < 10) {
            throw new Error('Not enough valid countries found');
        }
        
    } catch (error) {
        console.error('Error fetching countries:', error);
        
        // Use fallback data if API fails
        console.log('Using fallback country data');
        countries = [...countryData.filter(country => country.population >= 21000)]
            .sort(() => Math.random() - 0.5);
    } finally {
        // Reset used countries tracking
        usedCountries = new Set();
        
        // Start the game
        startNewRound();
        
        // Hide loading screen and show game
        loadingElement.classList.add('hidden');
        gameContainer.classList.remove('hidden');
    }
}

// Function to start a new round
function startNewRound() {
    if (countries.length === 0 || usedCountries.size === countries.length) {
        // Game over or restart if all countries have been used
        gameOver();
        return;
    }

    currentCountries = [];
    while (currentCountries.length < 2) {
        const randomIndex = Math.floor(Math.random() * countries.length);
        const country = countries[randomIndex];
        if (!usedCountries.has(country)) {
            currentCountries.push(country);
            usedCountries.add(country);
        }
    }

    let leftCountry = currentCountries[0];
    let rightCountry = currentCountries[1];

    leftFlag.src = leftCountry.flags.png;
    leftName.textContent = leftCountry.name.common;
    leftPopulation.textContent = leftCountry.population.toLocaleString();

    rightFlag.src = rightCountry.flags.png;
    rightName.textContent = rightCountry.name.common;
    rightPopulation.textContent = rightCountry.population.toLocaleString();
}

function checkAnswer(choice) {
    const leftPopulationValue = currentCountries[0].population;
    const rightPopulationValue = currentCountries[1].population;

    let correct = false;
    if ((choice === 'higher' && rightPopulationValue > leftPopulationValue) ||
        (choice === 'lower' && rightPopulationValue < leftPopulationValue)) {
        correct = true;
    }

    if (correct) {
        score++;
        scoreElement.textContent = score;
        startNewRound();
    } else {
        gameOver();
    }
}

function gameOver() {
    gameOverElement.classList.remove('hidden');
    finalScoreElement.textContent = score;
    gameContainer.classList.add('hidden');

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', score);
        highScoreElement.textContent = highScore;
    }
}

function resetGame() {
    gameOverElement.classList.add('hidden');
    score = 0;
    scoreElement.textContent = score;
    usedCountries.clear();
    countries = countries.sort(() => Math.random() - 0.5); // Shuffle countries again
    startNewRound();
    gameContainer.classList.remove('hidden');
}

// Event listeners
higherBtn.addEventListener('click', () => checkAnswer('higher'));
lowerBtn.addEventListener('click', () => checkAnswer('lower'));
playAgainBtn.addEventListener('click', resetGame);
startGameBtn.addEventListener('click', () => {
    initGame();
});

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', function() {
    // Start with a slight delay to ensure everything is loaded
    setTimeout(initGame, 500);
});