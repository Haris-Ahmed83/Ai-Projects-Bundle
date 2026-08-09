class Perceptron {
    constructor(learningRate = 0.1) {
        // We have 2 inputs (x, y) and a bias
        // Weights are initialized randomly between -1 and 1
        this.weights = [Math.random() * 2 - 1, Math.random() * 2 - 1]; // w0 for x, w1 for y
        this.bias = Math.random() * 2 - 1;
        this.learningRate = learningRate;
    }

    // Activation function (step function): returns 1 for sum >= 0, -1 for sum < 0
    activate(sum) {
        return sum >= 0 ? 1 : -1;
    }

    // Predict the output for given inputs [x, y]
    predict(inputs) {
        const [x, y] = inputs;
        let sum = x * this.weights[0] + y * this.weights[1] + this.bias;
        return this.activate(sum);
    }

    // Train the perceptron using the perceptron learning rule
    train(inputs, target) {
        const prediction = this.predict(inputs);
        const error = target - prediction; // Calculate the error

        // Adjust weights and bias only if there's an error
        if (error !== 0) {
            const [x, y] = inputs;
            this.weights[0] += this.learningRate * error * x;
            this.weights[1] += this.learningRate * error * y;
            this.bias += this.learningRate * error;
            return true; // Indicates weights were updated
        }
        return false; // No update needed
    }
}

// --- DOM Elements and Configuration ---
const canvas = document.getElementById('perceptronCanvas');
const ctx = canvas.getContext('2d');
const addPositiveBtn = document.getElementById('addPositiveBtn');
const addNegativeBtn = document.getElementById('addNegativeBtn');
const resetBtn = document.getElementById('resetBtn');
const learningRateDisplay = document.getElementById('learningRateDisplay');
const epochsPerFrameDisplay = document.getElementById('epochsPerFrameDisplay');

// --- Global State Variables ---
let perceptron;              // The perceptron instance
let points = [];             // Array to store data points {x, y, label}
let currentLabelToAdd = 1;   // Currently selected label for new points (1 or -1)
const POINT_RADIUS = 5;      // Radius for drawing data points
const LEARNING_RATE = 0.01;  // Learning rate for the perceptron
const EPOCHS_PER_FRAME = 5;  // Number of training steps per animation frame

// --- Drawing Functions ---

// Draws a single data point on the canvas
function drawPoint(point) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, POINT_RADIUS, 0, Math.PI * 2); // Circle for the point
    ctx.fillStyle = point.label === 1 ? '#4CAF50' : '#f44336'; // Green for positive, Red for negative
    ctx.fill();
    ctx.strokeStyle = '#333'; // Dark border
    ctx.lineWidth = 1;
    ctx.stroke();
}

// Draws the decision boundary line based on the perceptron's current weights and bias
function drawLine(perceptron) {
    ctx.beginPath();
    ctx.strokeStyle = '#007bff'; // Blue line
    ctx.lineWidth = 2;

    const [w0, w1] = perceptron.weights; // w0 for x, w1 for y
    const b = perceptron.bias;

    let p1 = { x: 0, y: 0 };           // First point on the line
    let p2 = { x: canvas.width, y: 0 }; // Second point on the line

    const EPSILON = 1e-6; // Small value to check if a weight is effectively zero

    // Handle cases where the line is vertical or horizontal
    if (Math.abs(w1) < EPSILON) { // If w1 is near zero, the line is vertical (w0*x + b = 0)
        if (Math.abs(w0) < EPSILON) { // Both w0 and w1 are near zero, no clear decision boundary
            ctx.stroke();
            return; // Draw nothing
        }
        p1.x = p2.x = -b / w0; // x-intercept
        p1.y = 0;
        p2.y = canvas.height;
    } else {
        // Otherwise, calculate y for x=0 and x=canvas.width (y = (-w0*x - b) / w1)
        p1.y = (-w0 * p1.x - b) / w1;
        p2.y = (-w0 * p2.x - b) / w1;
    }

    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

// --- Main Animation Loop ---
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas

    // Draw all existing data points
    for (const point of points) {
        drawPoint(point);
    }

    // Draw the current decision boundary of the perceptron
    drawLine(perceptron);

    // Train the perceptron multiple times per frame (SGD approach)
    if (points.length > 0) {
        for (let i = 0; i < EPOCHS_PER_FRAME; i++) {
            // Pick a random point from the dataset for stochastic gradient descent
            const randomIndex = Math.floor(Math.random() * points.length);
            const point = points[randomIndex];
            perceptron.train([point.x, point.y], point.label);
        }
    }

    // Request the next animation frame
    requestAnimationFrame(animate);
}

// --- Event Handlers ---

// Handles clicks on the canvas to add new data points
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect(); // Get canvas position relative to viewport
    const x = event.clientX - rect.left;         // Calculate X coordinate relative to canvas
    const y = event.clientY - rect.top;          // Calculate Y coordinate relative to canvas
    points.push({ x, y, label: currentLabelToAdd }); // Add new point to the array
});

// Sets the label for new points to positive (+1)
addPositiveBtn.addEventListener('click', () => {
    currentLabelToAdd = 1;
    addPositiveBtn.classList.add('active');
    addNegativeBtn.classList.remove('active');
});

// Sets the label for new points to negative (-1)
addNegativeBtn.addEventListener('click', () => {
    currentLabelToAdd = -1;
    addNegativeBtn.classList.add('active');
    addPositiveBtn.classList.remove('active');
});

// Resets the visualization: clears points, reinitializes perceptron
resetBtn.addEventListener('click', init);

// --- Initialization ---

// Initializes the perceptron and UI state
function init() {
    perceptron = new Perceptron(LEARNING_RATE);
    points = [];
    currentLabelToAdd = 1;

    // Update button active state
    addPositiveBtn.classList.add('active');
    addNegativeBtn.classList.remove('active');

    // Update info displays
    learningRateDisplay.textContent = LEARNING_RATE;
    epochsPerFrameDisplay.textContent = EPOCHS_PER_FRAME;

    // Start the animation loop
    animate();
}

// Run initialization when the script loads
init();
