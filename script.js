// Import country data (replace with your actual import method)
// For example, if countryData is in a separate file:
// import countryData from './country-data.js';
// Or if it's a global variable defined elsewhere:
// const countryData = window.countryData; // Assuming it's attached to the window object

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

// Initialize the game
function initGame() {
    try {
        // Update high score display
        highScoreElement.textContent = highScore;
        
        // Filter countries with population over 21,000
        const filteredCountries = countryData.filter(country => country.population >= 21000);
        
        // Shuffle the countries array
        countries = shuffleArray([...filteredCountries]);
        
        // Reset used countries tracking
        usedCountries = new Set();
        
        // Start the game
        startNewRound();
        
        // Hide loading screen and show game
        loadingElement.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error initializing game:', error);
        alert('There was an error starting the game. Please refresh the page and try again.');
    }
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    // Create a copy of the array to avoid modifying the original
    const newArray = [...array];
    
    // Fisher-Yates shuffle algorithm
    for (let i = newArray.length - 1; i > 0; i--) {
        // Generate a random index between 0 and i
        const j = Math.floor(Math.random() * (i + 1));
        
        // Swap elements at indices i and j
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    
    return newArray;
}

// Get a random country that hasn't been used recently
function getRandomCountry() {
    // If we've used too many countries, reset the tracking
    if (usedCountries.size > countries.length * 0.7) {
        usedCountries.clear();
    }
    
    // Try to find a country that hasn't been used recently
    let attempts = 0;
    let country;
    
    do {
        // Get a random index
        const randomIndex = Math.floor(Math.random() * countries.length);
        country = countries[randomIndex];
        attempts++;
        
        // If we've tried too many times, just use any country
        if (attempts > 10) {
            break;
        }
    } while (usedCountries.has(country.name.common));
    
    // Mark this country as used
    usedCountries.add(country.name.common);
    
    return country;
}

// Start a new round
function startNewRound() {
    // If this is the first round or we need new countries
    if (currentCountries.length < 2) {
        // Get two random countries
        const country1 = getRandomCountry();
        let country2;
        
        // Make sure the second country is different from the first
        do {
            country2 = getRandomCountry();
        } while (country2.name.common === country1.name.common);
        
        currentCountries = [country1, country2];
    } else {
        // Move the right country to the left
        currentCountries[0] = currentCountries[1];
        
        // Get a new right country that's different from the left
        let newCountry;
        do {
            newCountry = getRandomCountry();
        } while (newCountry.name.common === currentCountries[0].name.common);
        
        currentCountries[1] = newCountry;
    }
    
    // Update the display
    updateCountryDisplay();
}

// Update the country display
function updateCountryDisplay() {
    const leftCountry = currentCountries[0];
    const rightCountry = currentCountries[1];
    
    // Update left country
    leftFlag.src = leftCountry.flags.png;
    leftFlag.onerror = function() {
        // If flag image fails to load, use a placeholder
        this.src = `https://via.placeholder.com/320x160/cccccc/666666?text=${encodeURIComponent(leftCountry.name.common)}`;
    };
    leftName.textContent = leftCountry.name.common;
    leftPopulation.textContent = formatPopulation(leftCountry.population);
    
    // Update right country
    rightFlag.src = rightCountry.flags.png;
    rightFlag.onerror = function() {
        // If flag image fails to load, use a placeholder
        this.src = `https://via.placeholder.com/320x160/cccccc/666666?text=${encodeURIComponent(rightCountry.name.common)}`;
    };
    rightName.textContent = rightCountry.name.common;
    rightPopulation.textContent = formatPopulation(rightCountry.population);
    
    // Hide right country population
    document.querySelector('.right .population').classList.add('hidden');
}

// Format population number with commas
function formatPopulation(population) {
    return population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Check if the guess is correct
function checkGuess(isHigher) {
    const leftPopulation = currentCountries[0].population;
    const rightPopulation = currentCountries[1].population;
    
    // Reveal the right country's population
    document.querySelector('.right .population').classList.remove('hidden');
    
    if ((isHigher && rightPopulation > leftPopulation) || 
        (!isHigher && rightPopulation < leftPopulation)) {
        // Correct guess
        score++;
        scoreElement.textContent = score;
        
        // Update high score if needed
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('highScore', highScore);
        }
        
        // Visual feedback
        document.getElementById('rightCountry').classList.add('correct');
        
        // Disable buttons temporarily
        disableButtons();
        
        // Move to next round after a delay
        setTimeout(() => {
            document.getElementById('rightCountry').classList.remove('correct');
            document.querySelector('.right .population').classList.add('hidden');
            startNewRound();
            enableButtons();
        }, 1500);
    } else {
        // Incorrect guess
        document.getElementById('rightCountry').classList.add('incorrect');
        
        // Disable buttons
        disableButtons();
        
        // Show game over after a delay
        setTimeout(() => {
            gameOver();
        }, 1500);
    }
}

// Disable the buttons
function disableButtons() {
    higherBtn.disabled = true;
    lowerBtn.disabled = true;
}

// Enable the buttons
function enableButtons() {
    higherBtn.disabled = false;
    lowerBtn.disabled = false;
}

// Game over
function gameOver() {
    finalScoreElement.textContent = score;
    gameOverElement.classList.remove('hidden');
    gameContainer.classList.add('hidden');
}

// Reset the game
function resetGame() {
    score = 0;
    scoreElement.textContent = score;
    currentCountries = [];
    
    // Reshuffle countries
    countries = shuffleArray([...countryData.filter(country => country.population >= 21000)]);
    
    // Reset used countries tracking
    usedCountries = new Set();
    
    gameOverElement.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    document.querySelector('.right .population').classList.add('hidden');
    document.getElementById('rightCountry').classList.remove('incorrect');
    enableButtons();
    startNewRound();
}

// Event listeners
higherBtn.addEventListener('click', () => checkGuess(true));
lowerBtn.addEventListener('click', () => checkGuess(false));
playAgainBtn.addEventListener('click', resetGame);
startGameBtn.addEventListener('click', initGame);

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', function() {
    // Start with a slight delay to ensure everything is loaded
    setTimeout(initGame, 500);
});   