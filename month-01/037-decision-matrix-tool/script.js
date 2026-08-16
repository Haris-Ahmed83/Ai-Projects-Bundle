// State variables to hold our data
let options = []; // Stores objects like { id: 'opt-xxxx', name: 'Option Name' }
let criteria = []; // Stores objects like { id: 'crit-xxxx', name: 'Criterion Name', weight: 5 }
let scores = {}; // Stores scores: { 'opt-xxxx': { 'crit-yyyy': 3, 'crit-zzzz': 4 }, ... }

// DOM element references
const optionNameInput = document.getElementById('option-name-input');
const addOptionBtn = document.getElementById('add-option-btn');
const criterionNameInput = document.getElementById('criterion-name-input');
const addCriterionBtn = document.getElementById('add-criterion-btn');
const criteriaListDiv = document.getElementById('criteria-list');
const matrixHeaderRow = document.getElementById('matrix-header-row');
const matrixBody = document.getElementById('matrix-body');
const calculateBtn = document.getElementById('calculate-btn');
const resultsDisplay = document.getElementById('results-display');

// Helper to generate unique IDs for options and criteria
const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// --- Render Functions --- 

/**
 * Renders/updates the list of criteria with their weight sliders.
 */
function renderCriteria() {
    criteriaListDiv.innerHTML = '';
    criteria.forEach(crit => {
        const critItem = document.createElement('div');
        critItem.className = 'criterion-item';
        critItem.dataset.id = crit.id;

        const nameSpan = document.createElement('span');
        nameSpan.textContent = crit.name;

        const weightWrapper = document.createElement('div');
        weightWrapper.className = 'weight-wrapper';
        const weightLabel = document.createElement('label');
        weightLabel.textContent = 'Weight: ';
        const weightInput = document.createElement('input');
        weightInput.type = 'range';
        weightInput.min = '1';
        weightInput.max = '10';
        weightInput.value = crit.weight;
        // Display current weight next to slider
        const weightValueSpan = document.createElement('span');
        weightValueSpan.textContent = crit.weight;

        weightInput.addEventListener('input', (e) => {
            updateWeight(crit.id, parseInt(e.target.value));
            weightValueSpan.textContent = e.target.value;
            renderMatrix(); // Re-render matrix to update criterion header weights
        });

        weightWrapper.append(weightLabel, weightInput, weightValueSpan);

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'X';
        removeBtn.className = 'remove-btn';
        removeBtn.title = 'Remove criterion';
        removeBtn.addEventListener('click', () => removeCriterion(crit.id));

        critItem.append(nameSpan, weightWrapper, removeBtn);
        criteriaListDiv.append(critItem);
    });
}

/**
 * Renders/updates the main decision matrix table.
 */
function renderMatrix() {
    // Clear existing criterion headers except the first (Options \ Criteria cell)
    while (matrixHeaderRow.children.length > 1) {
        matrixHeaderRow.removeChild(matrixHeaderRow.lastChild);
    }
    // Add new criterion headers with current weights
    criteria.forEach(crit => {
        const th = document.createElement('th');
        th.textContent = `${crit.name} (W: ${crit.weight})`;
        matrixHeaderRow.append(th);
    });

    matrixBody.innerHTML = ''; // Clear existing option rows
    options.forEach(opt => {
        const tr = document.createElement('tr');
        tr.dataset.id = opt.id;

        const optionNameTd = document.createElement('td');
        const nameSpan = document.createElement('span');
        nameSpan.textContent = opt.name;
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'X';
        removeBtn.className = 'remove-btn small-btn';
        removeBtn.title = 'Remove option';
        removeBtn.addEventListener('click', () => removeOption(opt.id));
        optionNameTd.append(nameSpan, removeBtn);
        tr.append(optionNameTd);

        // Add score inputs for each criterion
        criteria.forEach(crit => {
            const td = document.createElement('td');
            const scoreInput = document.createElement('input');
            scoreInput.type = 'number';
            scoreInput.min = '1';
            scoreInput.max = '5';
            // Use existing score or default to empty string
            scoreInput.value = scores[opt.id]?.[crit.id] || ''; 
            scoreInput.addEventListener('input', (e) => {
                // Update score, convert to number, default to 0 if invalid
                updateScore(opt.id, crit.id, parseInt(e.target.value) || 0);
            });
            td.append(scoreInput);
            tr.append(td);
        });
        matrixBody.append(tr);
    });
}

// --- Data Manipulation Functions --- 

/**
 * Adds a new option to the decision matrix.
 * @param {string} name - The name of the new option.
 */
function addOption(name) {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const newId = generateId('opt');
    options.push({ id: newId, name: trimmedName });
    scores[newId] = {};
    // Initialize scores for the new option against all existing criteria
    criteria.forEach(crit => {
        scores[newId][crit.id] = 0; // Default score is 0
    });
    renderMatrix();
    optionNameInput.value = ''; // Clear input
    calculateScores();
}

/**
 * Removes an option from the decision matrix.
 * @param {string} optionId - The ID of the option to remove.
 */
function removeOption(optionId) {
    options = options.filter(opt => opt.id !== optionId);
    delete scores[optionId]; // Remove all scores associated with this option
    renderMatrix();
    calculateScores();
}

/**
 * Adds a new criterion to the decision matrix.
 * @param {string} name - The name of the new criterion.
 */
function addCriterion(name) {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const newId = generateId('crit');
    criteria.push({ id: newId, name: trimmedName, weight: 5 }); // Default weight is 5
    // Add new criterion's score entry for all existing options
    options.forEach(opt => {
        scores[opt.id][newId] = 0; // Default score is 0
    });
    renderCriteria();
    renderMatrix();
    criterionNameInput.value = ''; // Clear input
    calculateScores();
}

/**
 * Removes a criterion from the decision matrix.
 * @param {string} criterionId - The ID of the criterion to remove.
 */
function removeCriterion(criterionId) {
    criteria = criteria.filter(crit => crit.id !== criterionId);
    // Remove criterion's score from all options
    options.forEach(opt => {
        if (scores[opt.id]) {
            delete scores[opt.id][criterionId];
        }
    });
    renderCriteria();
    renderMatrix();
    calculateScores();
}

/**
 * Updates the score for a specific option-criterion pair.
 * @param {string} optionId - The ID of the option.
 * @param {string} criterionId - The ID of the criterion.
 * @param {number} value - The new score value.
 */
function updateScore(optionId, criterionId, value) {
    if (!scores[optionId]) scores[optionId] = {};
    scores[optionId][criterionId] = value;
}

/**
 * Updates the weight for a specific criterion.
 * @param {string} criterionId - The ID of the criterion.
 * @param {number} value - The new weight value.
 */
function updateWeight(criterionId, value) {
    const crit = criteria.find(c => c.id === criterionId);
    if (crit) {
        crit.weight = value;
    }
    renderCriteria(); // Re-render criteria list to update the weight span
    renderMatrix(); // Re-render matrix to update criterion headers with new weights
    calculateScores();
}

// --- Calculation Function --- 

/**
 * Calculates and displays the total scores for each option.
 */
function calculateScores() {
    resultsDisplay.innerHTML = '';
    const optionScores = [];

    options.forEach(opt => {
        let totalScore = 0;
        criteria.forEach(crit => {
            const score = scores[opt.id]?.[crit.id] || 0;
            const weight = crit.weight || 1; // Default weight to 1 if undefined
            totalScore += score * weight;
        });
        optionScores.push({ name: opt.name, score: totalScore });
    });

    // Sort results by score in descending order
    optionScores.sort((a, b) => b.score - a.score);

    if (optionScores.length === 0) {
        resultsDisplay.textContent = 'No options or criteria to calculate. Add some above!';
        return;
    }

    const ul = document.createElement('ul');
    optionScores.forEach(res => {
        const li = document.createElement('li');
        const scoreValue = res.score.toFixed(1); // Format score to one decimal place
        li.textContent = `${res.name}: ${scoreValue}`;
        ul.append(li);
    });
    resultsDisplay.append(ul);
}

// --- Event Listeners --- 

addOptionBtn.addEventListener('click', () => addOption(optionNameInput.value));
optionNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addOption(optionNameInput.value);
});

addCriterionBtn.addEventListener('click', () => addCriterion(criterionNameInput.value));
criterionNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addCriterion(criterionNameInput.value);
});

calculateBtn.addEventListener('click', calculateScores);

// --- Initial Setup --- 

/**
 * Initializes the application with some default data and renders the UI.
 */
function initialize() {
    // Add some default options
    addOption('Vacation Spot A');
    addOption('Vacation Spot B');
    addOption('Vacation Spot C');

    // Add some default criteria
    addCriterion('Cost');
    addCriterion('Activities');
    addCriterion('Relaxation');
    addCriterion('Food Quality');

    // Manually set some initial scores for demonstration
    // These scores are set *after* options and criteria are added
    // and ensure the `scores` object structure is ready.

    // Vacation Spot A scores
    scores[options[0].id][criteria[0].id] = 3; // Cost
    scores[options[0].id][criteria[1].id] = 4; // Activities
    scores[options[0].id][criteria[2].id] = 5; // Relaxation
    scores[options[0].id][criteria[3].id] = 4; // Food Quality

    // Vacation Spot B scores
    scores[options[1].id][criteria[0].id] = 5; // Cost
    scores[options[1].id][criteria[1].id] = 3; // Activities
    scores[options[1].id][criteria[2].id] = 4; // Relaxation
    scores[options[1].id][criteria[3].id] = 5; // Food Quality

    // Vacation Spot C scores
    scores[options[2].id][criteria[0].id] = 4; // Cost
    scores[options[2].id][criteria[1].id] = 5; // Activities
    scores[options[2].id][criteria[2].id] = 3; // Relaxation
    scores[options[2].id][criteria[3].id] = 3; // Food Quality

    // Manually set some initial weights
    criteria.find(c => c.name === 'Cost').weight = 8; // Cost is very important
    criteria.find(c => c.name === 'Activities').weight = 6;
    criteria.find(c => c.name === 'Relaxation').weight = 4;
    criteria.find(c => c.name === 'Food Quality').weight = 7;

    // Render initial UI elements
    renderCriteria();
    renderMatrix();
    calculateScores();
}

// Run initialization when the script loads
initialize();
