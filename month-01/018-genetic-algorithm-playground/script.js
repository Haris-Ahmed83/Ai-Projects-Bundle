class Individual {
    constructor(dna) {
        this.dna = dna;
        this.fitness = 0;
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
}

class GeneticAlgorithm {
    constructor(target, populationSize, mutationRate, possibleChars) {
        this.target = target;
        this.populationSize = populationSize;
        this.mutationRate = mutationRate; // e.g., 0.01 for 1%
        this.possibleChars = possibleChars;

        this.population = [];
        this.generation = 0;
        this.bestIndividual = null;
        this.foundTarget = false;

        this.initializePopulation();
    }

    initializePopulation() {
        for (let i = 0; i < this.populationSize; i++) {
            let dna = '';
            for (let j = 0; j < this.target.length; j++) {
                dna += this.possibleChars.charAt(Math.floor(Math.random() * this.possibleChars.length));
            }
            this.population.push(new Individual(dna));
        }
    }

    evaluatePopulation() {
        let maxFitness = 0;
        let bestCurrentIndividual = null;

        for (const individual of this.population) {
            individual.calculateFitness(this.target);
            if (individual.fitness > maxFitness) {
                maxFitness = individual.fitness;
                bestCurrentIndividual = individual;
            }
        }

        if (!this.bestIndividual || (bestCurrentIndividual && bestCurrentIndividual.fitness > this.bestIndividual.fitness)) {
            this.bestIndividual = bestCurrentIndividual; // Update overall best
        }

        if (this.bestIndividual && this.bestIndividual.dna === this.target) {
            this.foundTarget = true;
        }
    }

    // Selection: Roulette Wheel
    pickOne() {
        let index = 0;
        let r = Math.random();

        // Sum all fitness values
        const totalFitness = this.population.reduce((sum, ind) => sum + ind.fitness, 0);

        // If total fitness is 0 (e.g., very first generation with all random, no matches),
        // pick a random individual to avoid division by zero or infinite loop.
        if (totalFitness === 0) {
            return this.population[Math.floor(Math.random() * this.population.length)];
        }

        let currentFitnessSum = 0;
        for (let i = 0; i < this.population.length; i++) {
            currentFitnessSum += this.population[i].fitness / totalFitness; // Normalized fitness
            if (r <= currentFitnessSum) {
                index = i;
                break;
            }
        }
        return this.population[index];
    }

    crossover(parentA, parentB) {
        let midpoint = Math.floor(Math.random() * parentA.dna.length);
        let childDNA = parentA.dna.substring(0, midpoint) + parentB.dna.substring(midpoint);
        return new Individual(childDNA);
    }

    mutate(individual) {
        let dnaArray = individual.dna.split('');
        for (let i = 0; i < dnaArray.length; i++) {
            if (Math.random() < this.mutationRate) {
                dnaArray[i] = this.possibleChars.charAt(Math.floor(Math.random() * this.possibleChars.length));
            }
        }
        individual.dna = dnaArray.join('');
    }

    evolve() {
        if (this.foundTarget) return;

        this.generation++;
        this.evaluatePopulation();

        if (this.foundTarget) return; // Check again after evaluation

        const newPopulation = [];
        // Elitism: Keep the best individual from the previous generation
        if (this.bestIndividual) {
            newPopulation.push(this.bestIndividual);
        }

        const numOffspring = this.populationSize - newPopulation.length; // Remaining slots to fill

        for (let i = 0; i < numOffspring; i++) {
            const parentA = this.pickOne();
            const parentB = this.pickOne();
            const child = this.crossover(parentA, parentB);
            this.mutate(child);
            newPopulation.push(child);
        }
        this.population = newPopulation;
    }
}

// DOM Elements
const targetPhraseInput = document.getElementById('targetPhrase');
const populationSizeInput = document.getElementById('populationSize');
const mutationRateInput = document.getElementById('mutationRate');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

const generationSpan = document.getElementById('generation');
const bestPhraseSpan = document.getElementById('bestPhrase');
const bestFitnessSpan = document.getElementById('bestFitness');
const populationOutput = document.getElementById('populationOutput');
const canvas = document.getElementById('visualizationCanvas');
const ctx = canvas.getContext('2d');

// GA Variables
let ga;
let intervalId;
const possibleCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,!?'\"!@#$%^&*()_+-=[]{};:\|<>/~";

// Function to update UI
function updateUI() {
    if (!ga) return;

    generationSpan.textContent = ga.generation;
    bestPhraseSpan.textContent = ga.bestIndividual ? ga.bestIndividual.dna : 'N/A';
    bestFitnessSpan.textContent = ga.bestIndividual ? (ga.bestIndividual.fitness * 100).toFixed(2) + '%' : 'N/A';

    // Display a sample of the current population
    populationOutput.innerHTML = '';
    const displayCount = Math.min(10, ga.population.length); // Display up to 10 individuals
    // Sort population by fitness for better sample visibility (optional)
    const sortedPopulation = [...ga.population].sort((a, b) => b.fitness - a.fitness);

    for (let i = 0; i < displayCount; i++) {
        const p = document.createElement('p');
        p.textContent = sortedPopulation[i].dna + ` (F: ${(sortedPopulation[i].fitness * 100).toFixed(1)}%)`;
        populationOutput.appendChild(p);
    }

    // Canvas Visualization (simple fitness bar)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (ga.bestIndividual) {
        const barWidth = canvas.width * ga.bestIndividual.fitness;
        ctx.fillStyle = '#4CAF50'; // Green color
        ctx.fillRect(0, 0, barWidth, canvas.height);
        ctx.strokeStyle = '#333';
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }
}

// Start GA simulation
function startSimulation() {
    const target = targetPhraseInput.value.trim();
    const popSize = parseInt(populationSizeInput.value);
    const mutationRate = parseFloat(mutationRateInput.value);

    if (!target) {
        alert('Please enter a target phrase.');
        return;
    }
    if (popSize <= 0 || isNaN(popSize)) {
        alert('Population size must be a positive number.');
        return;
    }
    if (mutationRate < 0 || mutationRate > 1 || isNaN(mutationRate)) {
        alert('Mutation rate must be between 0 and 1.');
        return;
    }

    ga = new GeneticAlgorithm(target, popSize, mutationRate, possibleCharacters);
    ga.evaluatePopulation(); // Initial evaluation

    startBtn.disabled = true;
    stopBtn.disabled = false;
    targetPhraseInput.disabled = true;
    populationSizeInput.disabled = true;
    mutationRateInput.disabled = true;

    intervalId = setInterval(() => {
        ga.evolve();
        updateUI();
        if (ga.foundTarget) {
            stopSimulation();
            alert(`Target phrase found in ${ga.generation} generations!`);
        }
    }, 50); // Run every 50ms
}

// Stop GA simulation
function stopSimulation() {
    clearInterval(intervalId);
    intervalId = null;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    targetPhraseInput.disabled = false;
    populationSizeInput.disabled = false;
    mutationRateInput.disabled = false;
}

// Event Listeners
startBtn.addEventListener('click', startSimulation);
stopBtn.addEventListener('click', stopSimulation);

// Initial UI update (empty)
updateUI();
