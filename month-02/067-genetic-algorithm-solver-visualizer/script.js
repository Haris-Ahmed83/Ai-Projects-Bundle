// script.js

// --- Configuration ---
const ALLOWED_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789.,!?-';
const MAX_POPULATION_DISPLAY = 10; // How many top individuals to show

// --- DOM Elements ---
const targetInput = document.getElementById('targetString');
const populationSizeInput = document.getElementById('populationSize');
const mutationRateInput = document.getElementById('mutationRate');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const generationSpan = document.getElementById('generation');
const bestFitnessSpan = document.getElementById('bestFitness');
const bestIndividualSpan = document.getElementById('bestIndividual');
const populationDisplayDiv = document.getElementById('populationDisplay');

// --- Global Variables ---
let population;
let generationCount = 0;
let isRunning = false;
let animationFrameId;

// --- Individual Class (Candidate Solution) ---
class Individual {
    constructor(dnaLength) {
        this.dna = this.generateRandomDna(dnaLength);
        this.fitness = 0; // Will be calculated later
    }

    generateRandomDna(length) {
        let dna = '';
        for (let i = 0; i < length; i++) {
            dna += ALLOWED_CHARS.charAt(Math.floor(Math.random() * ALLOWED_CHARS.length));
        }
        return dna;
    }

    calculateFitness(target) {
        let score = 0;
        for (let i = 0; i < this.dna.length; i++) {
            if (this.dna[i] === target[i]) {
                score++;
            }
        }
        // Normalize fitness to be between 0 and 1
        this.fitness = score / target.length;
    }

    // Crossover: Combines DNA from two parents
    static crossover(parentA, parentB) {
        const dnaLength = parentA.dna.length;
        const childDna = new Array(dnaLength);
        const midpoint = Math.floor(Math.random() * dnaLength);

        for (let i = 0; i < dnaLength; i++) {
            if (i > midpoint) {
                childDna[i] = parentA.dna[i];
            } else {
                childDna[i] = parentB.dna[i];
            }
        }
        const child = new Individual(dnaLength); // Create new individual with dummy DNA length
        child.dna = childDna.join(''); // Assign combined DNA
        return child;
    }

    // Mutation: Randomly changes a character in the DNA
    static mutate(individual, mutationRate) {
        let dnaChars = individual.dna.split('');
        for (let i = 0; i < dnaChars.length; i++) {
            if (Math.random() < mutationRate) {
                dnaChars[i] = ALLOWED_CHARS.charAt(Math.floor(Math.random() * ALLOWED_CHARS.length));
            }
        }
        individual.dna = dnaChars.join('');
    }
}

// --- Population Class ---
class Population {
    constructor(target, populationSize, mutationRate) {
        this.target = target;
        this.populationSize = populationSize;
        this.mutationRate = mutationRate;
        this.individuals = [];
        this.bestIndividual = null;
        this.maxFitness = 0;

        this.populate();
        this.calculateAllFitness();
        this.updateBestIndividual();
    }

    populate() {
        for (let i = 0; i < this.populationSize; i++) {
            this.individuals.push(new Individual(this.target.length));
        }
    }

    calculateAllFitness() {
        for (let individual of this.individuals) {
            individual.calculateFitness(this.target);
        }
    }

    updateBestIndividual() {
        let best = this.individuals[0];
        for (let i = 1; i < this.individuals.length; i++) {
            if (this.individuals[i].fitness > best.fitness) {
                best = this.individuals[i];
            }
        }
        this.bestIndividual = best;
        this.maxFitness = best.fitness;
    }

    // Selection: Creates a mating pool based on fitness (roulette wheel selection)
    selection() {
        const matingPool = [];
        // Max fitness can be 0 if all individuals are equally bad. Handle this to prevent division by zero.
        const totalFitness = this.individuals.reduce((sum, ind) => sum + ind.fitness, 0);

        if (totalFitness === 0) {
            // If all fitness is zero, just add all individuals to the mating pool uniformly
            for (let i = 0; i < this.individuals.length; i++) {
                matingPool.push(this.individuals[i]);
            }
        } else {
            for (let i = 0; i < this.individuals.length; i++) {
                // Number of times an individual is added to the mating pool is proportional to its fitness
                // Scaled by total fitness to keep pool size reasonable or simply use frequency
                let numToAdd = Math.floor((this.individuals[i].fitness / totalFitness) * this.populationSize * 2); // Multiplier to increase pool size
                if (numToAdd === 0 && this.individuals[i].fitness > 0) numToAdd = 1; // Ensure even low fitness individuals get a chance

                for (let j = 0; j < numToAdd; j++) {
                    matingPool.push(this.individuals[i]);
                }
            }
            // If the mating pool is still empty (e.g., very low mutation rate causing all to be zero, or very small pop size)
            // ensure there's at least the initial population to pick from
            if (matingPool.length === 0 && this.individuals.length > 0) {
                 matingPool.push(...this.individuals);
            }
        }
       
        // If matingPool is still empty, something went wrong, fall back to adding all individuals directly.
        if (matingPool.length === 0) {
            return this.individuals;
        }
        return matingPool;
    }

    // Evolve to the next generation
    evolve() {
        const matingPool = this.selection();
        const newIndividuals = [];

        // Always carry over the best individual (elitism)
        if (this.bestIndividual) {
            const elite = new Individual(this.target.length);
            elite.dna = this.bestIndividual.dna;
            newIndividuals.push(elite);
        }

        while (newIndividuals.length < this.populationSize) {
            // Pick two parents from the mating pool
            const parentA = matingPool[Math.floor(Math.random() * matingPool.length)];
            const parentB = matingPool[Math.floor(Math.random() * matingPool.length)];

            // Crossover
            const child = Individual.crossover(parentA, parentB);

            // Mutate
            Individual.mutate(child, this.mutationRate);

            newIndividuals.push(child);
        }

        this.individuals = newIndividuals;
        this.calculateAllFitness();
        this.updateBestIndividual();
    }
}

// --- Simulation Logic ---
function initializeSimulation() {
    const target = targetInput.value;
    const popSize = parseInt(populationSizeInput.value);
    const mutRate = parseFloat(mutationRateInput.value);

    // Basic validation
    if (!target || target.length === 0) {
        alert('Please enter a target string!');
        return false;
    }
    if (isNaN(popSize) || popSize < 10) {
        alert('Population size must be a number greater than or equal to 10!');
        return false;
    }
    if (isNaN(mutRate) || mutRate < 0 || mutRate > 1) {
        alert('Mutation rate must be a number between 0 and 1!');
        return false;
    }

    generationCount = 0;
    population = new Population(target, popSize, mutRate);
    updateDisplay();
    return true;
}

function startSimulation() {
    if (!initializeSimulation()) {
        return;
    }

    isRunning = true;
    startButton.disabled = true;
    stopButton.disabled = false;
    targetInput.disabled = true;
    populationSizeInput.disabled = true;
    mutationRateInput.disabled = true;

    loop();
}

function stopSimulation() {
    isRunning = false;
    startButton.disabled = false;
    stopButton.disabled = true;
    targetInput.disabled = false;
    populationSizeInput.disabled = false;
    mutationRateInput.disabled = false;

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
}

function loop() {
    if (!isRunning) {
        return;
    }

    population.evolve();
    generationCount++;
    updateDisplay();

    // Check for perfect solution
    if (population.maxFitness >= 1.0) { // Using >= because of potential floating point inaccuracies, though 1.0 is exact for this fitness func
        stopSimulation();
        alert(`Solution found in ${generationCount} generations!`);
        return;
    }

    animationFrameId = requestAnimationFrame(loop);
}

function updateDisplay() {
    generationSpan.textContent = generationCount;
    bestFitnessSpan.textContent = population.bestIndividual ? population.bestIndividual.fitness.toFixed(4) : '0.0000';
    bestIndividualSpan.textContent = population.bestIndividual ? population.bestIndividual.dna : '';

    // Sort individuals by fitness for display
    const sortedIndividuals = [...population.individuals].sort((a, b) => b.fitness - a.fitness);

    populationDisplayDiv.innerHTML = ''; // Clear previous display
    for (let i = 0; i < Math.min(MAX_POPULATION_DISPLAY, sortedIndividuals.length); i++) {
        const individual = sortedIndividuals[i];
        const item = document.createElement('div');
        item.classList.add('individual-item');
        item.innerHTML = `
            <span>${individual.dna}</span>
            <span class="fitness-score">${individual.fitness.toFixed(4)}</span>
        `;
        populationDisplayDiv.appendChild(item);
    }
}

// --- Event Listeners ---
startButton.addEventListener('click', startSimulation);
stopButton.addEventListener('click', stopSimulation);

// Initial display update
initializeSimulation(); // This will set initial population and display based on default values.
