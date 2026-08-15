document.addEventListener('DOMContentLoaded', init);

// --- Constants ---
const CELL_TYPE = {
    EMPTY: 'empty',
    AGENT: 'agent',
    START: 'start',
    GOAL: 'goal',
    OBSTACLE: 'obstacle'
};

const ACTIONS = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
};

const ACTION_VECTORS = [
    { dr: -1, dc: 0 }, // UP
    { dr: 0, dc: 1 },  // RIGHT
    { dr: 1, dc: 0 },  // DOWN
    { dr: 0, dc: -1 }  // LEFT
];

const REWARDS = {
    GOAL: 100,
    OBSTACLE: -100,
    STEP: -1
};

// --- DOM Elements ---
let gridContainer;
let gridSizeInput;
let resetButton;
let learnButton;
let speedSlider;
let speedValueDisplay;
let episodeDisplay;
let stepsDisplay;
let epsilonDisplay;
let statusDisplay;

// --- Game State Variables ---
let gridSize = 10;
let grid = []; // 2D array representing the world
let agent = { r: 0, c: 0 };
let startPos = { r: 0, c: 0 };
let goalPos = { r: 0, c: 0 };
let qTable = {}; // Stores Q-values: qTable['r,c'] = [q_up, q_right, q_down, q_left]

// --- RL Parameters ---
let learningRate = 0.1; // Alpha
let discountFactor = 0.9; // Gamma
let epsilon = 1.0; // Epsilon-greedy exploration rate
let epsilonDecay = 0.995; // How much epsilon decays each episode
let minEpsilon = 0.05;

// --- Simulation Control ---
let gameInterval = null;
let isLearning = false;
let episodeCount = 0;
let totalSteps = 0;
let currentEpisodeSteps = 0;

// --- Initialization ---
function init() {
    // Get DOM elements
    gridContainer = document.getElementById('grid-container');
    gridSizeInput = document.getElementById('grid-size');
    resetButton = document.getElementById('reset-button');
    learnButton = document.getElementById('learn-button');
    speedSlider = document.getElementById('speed-slider');
    speedValueDisplay = document.getElementById('speed-value');
    episodeDisplay = document.getElementById('episode-display');
    stepsDisplay = document.getElementById('steps-display');
    epsilonDisplay = document.getElementById('epsilon-display');
    statusDisplay = document.getElementById('status-display');

    // Set up event listeners
    resetButton.addEventListener('click', resetGame);
    learnButton.addEventListener('click', toggleLearning);
    gridSizeInput.addEventListener('change', () => {
        gridSize = parseInt(gridSizeInput.value);
        resetGame();
    });
    speedSlider.addEventListener('input', () => {
        speedValueDisplay.textContent = speedSlider.value + 'ms';
        if (isLearning) {
            clearInterval(gameInterval);
            gameInterval = setInterval(agentStep, parseInt(speedSlider.value));
        }
    });

    // Initial setup
    gridSize = parseInt(gridSizeInput.value);
    speedValueDisplay.textContent = speedSlider.value + 'ms';
    resetGame();
}

// --- Game Logic ---
function resetGame() {
    stopLearning();

    // Clear previous grid
    grid = Array(gridSize).fill(0).map(() => Array(gridSize).fill(CELL_TYPE.EMPTY));
    qTable = {}; // Reset Q-table

    // Place Start and Goal randomly (ensure they are not the same)
    startPos = getRandomEmptyCell();
    goalPos = getRandomEmptyCell();
    while (startPos.r === goalPos.r && startPos.c === goalPos.c) {
        goalPos = getRandomEmptyCell();
    }
    grid[startPos.r][startPos.c] = CELL_TYPE.START;
    grid[goalPos.r][goalPos.c] = CELL_TYPE.GOAL;

    // Place obstacles (approx 15-20% of cells)
    const numObstacles = Math.floor(gridSize * gridSize * 0.15);
    for (let i = 0; i < numObstacles; i++) {
        let obsPos = getRandomEmptyCell();
        // Ensure obstacles don't replace start/goal or other obstacles
        while (grid[obsPos.r][obsPos.c] !== CELL_TYPE.EMPTY) {
            obsPos = getRandomEmptyCell();
        }
        grid[obsPos.r][obsPos.c] = CELL_TYPE.OBSTACLE;
    }

    // Reset agent to start position
    agent.r = startPos.r;
    agent.c = startPos.c;

    // Reset RL parameters and stats
    epsilon = 1.0;
    episodeCount = 0;
    totalSteps = 0;
    currentEpisodeSteps = 0;

    // Update UI
    renderGrid();
    updateInfoDisplay();
    statusDisplay.textContent = "Grid reset. Press 'Start Learning' to begin.";
    learnButton.textContent = "Start Learning";
    learnButton.disabled = false;
}

function getRandomEmptyCell() {
    let r, c;
    do {
        r = Math.floor(Math.random() * gridSize);
        c = Math.floor(Math.random() * gridSize);
    } while (grid[r][c] !== CELL_TYPE.EMPTY);
    return { r, c };
}

function renderGrid() {
    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
    gridContainer.style.setProperty('--grid-size', gridSize);

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('cell', grid[r][c]);

            // Add agent class if agent is at this position
            if (agent.r === r && agent.c === c) {
                cellDiv.classList.add(CELL_TYPE.AGENT);
            }
            gridContainer.appendChild(cellDiv);
        }
    }
}

function updateInfoDisplay() {
    episodeDisplay.textContent = episodeCount;
    stepsDisplay.textContent = totalSteps;
    epsilonDisplay.textContent = epsilon.toFixed(3);
}

// --- Q-Learning Core Functions ---
function getStateKey(r, c) {
    return `${r},${c}`;
}

function getQValues(r, c) {
    const key = getStateKey(r, c);
    if (!qTable[key]) {
        qTable[key] = Array(Object.keys(ACTIONS).length).fill(0);
    }
    return qTable[key];
}

function chooseAction(r, c) {
    // Epsilon-greedy strategy
    if (Math.random() < epsilon) {
        // Explore: choose a random action
        return Math.floor(Math.random() * Object.keys(ACTIONS).length);
    } else {
        // Exploit: choose the action with the highest Q-value
        const qValues = getQValues(r, c);
        let maxQ = -Infinity;
        let bestAction = 0;
        for (let i = 0; i < qValues.length; i++) {
            if (qValues[i] > maxQ) {
                maxQ = qValues[i];
                bestAction = i;
            }
        }
        // Handle ties by picking randomly among tied best actions
        const bestActions = [];
        for(let i = 0; i < qValues.length; i++){
            if(qValues[i] === maxQ){
                bestActions.push(i);
            }
        }
        return bestActions[Math.floor(Math.random() * bestActions.length)];
    }
}

function agentStep() {
    currentEpisodeSteps++;
    totalSteps++;

    const oldR = agent.r;
    const oldC = agent.c;
    const action = chooseAction(oldR, oldC);

    let newR = oldR + ACTION_VECTORS[action].dr;
    let newC = oldC + ACTION_VECTORS[action].dc;

    let reward;
    let isTerminal = false;

    // Check boundaries and obstacles
    if (newR < 0 || newR >= gridSize || newC < 0 || newC >= gridSize || grid[newR][newC] === CELL_TYPE.OBSTACLE) {
        // Invalid move or hit obstacle, agent stays in place but gets penalty
        newR = oldR; // Agent doesn't move
        newC = oldC;
        reward = REWARDS.OBSTACLE; // Penalty for hitting obstacle/wall
        isTerminal = true; // Obstacle/wall hit can be considered a terminal state for that step, or just a bad reward
    } else if (grid[newR][newC] === CELL_TYPE.GOAL) {
        // Reached goal
        agent.r = newR;
        agent.c = newC;
        reward = REWARDS.GOAL;
        isTerminal = true;
    } else {
        // Normal move
        agent.r = newR;
        agent.c = newC;
        reward = REWARDS.STEP; // Small penalty for each step
    }

    // Q-learning update
    const oldQValues = getQValues(oldR, oldC);
    const oldQ = oldQValues[action];

    let maxQNewState = 0;
    if (!isTerminal) {
        maxQNewState = Math.max(...getQValues(agent.r, agent.c));
    }

    const newQ = oldQ + learningRate * (reward + discountFactor * maxQNewState - oldQ);
    oldQValues[action] = newQ;

    renderGrid();
    updateInfoDisplay();

    if (isTerminal && grid[agent.r][agent.c] === CELL_TYPE.GOAL) {
        statusDisplay.textContent = `Episode ${episodeCount + 1}: Goal reached in ${currentEpisodeSteps} steps!`;
        endEpisode();
    } else if (isTerminal && grid[agent.r][agent.c] === CELL_TYPE.OBSTACLE) {
        statusDisplay.textContent = `Episode ${episodeCount + 1}: Hit obstacle in ${currentEpisodeSteps} steps!`;
        endEpisode(); // End episode if obstacle hit
    }

    if(isLearning && episodeCount >= 1000){ // Stop after N episodes to see the learned behavior
        statusDisplay.textContent = `Learning stopped after ${episodeCount} episodes. Agent should now navigate efficiently.`;
        stopLearning();
    }
}

function endEpisode() {
    episodeCount++;
    currentEpisodeSteps = 0;
    epsilon = Math.max(minEpsilon, epsilon * epsilonDecay); // Decay epsilon

    // Reset agent to start for the next episode
    agent.r = startPos.r;
    agent.c = startPos.c;

    // If learning has been running for a while, increase speed to show results quicker
    if (episodeCount > 100 && speedSlider.value < 500) {
        speedSlider.value = Math.max(10, parseInt(speedSlider.value) - 10);
        speedValueDisplay.textContent = speedSlider.value + 'ms';
        if (isLearning) {
            clearInterval(gameInterval);
            gameInterval = setInterval(agentStep, parseInt(speedSlider.value));
        }
    }
    
    renderGrid();
    updateInfoDisplay();
}

function toggleLearning() {
    if (isLearning) {
        stopLearning();
    } else {
        startLearning();
    }
}

function startLearning() {
    isLearning = true;
    learnButton.textContent = 'Stop Learning';
    resetButton.disabled = true;
    statusDisplay.textContent = "Learning in progress...";
    gameInterval = setInterval(agentStep, parseInt(speedSlider.value));
}

function stopLearning() {
    isLearning = false;
    clearInterval(gameInterval);
    gameInterval = null;
    learnButton.textContent = 'Start Learning';
    resetButton.disabled = false;
    if (!statusDisplay.textContent.includes("Goal reached") && !statusDisplay.textContent.includes("Hit obstacle")) {
        statusDisplay.textContent = "Learning paused.";
    }
}
