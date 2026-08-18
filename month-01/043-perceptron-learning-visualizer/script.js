// --- DOM Elements --- 
const canvas = document.getElementById('perceptronCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const iterationsDisplay = document.getElementById('iterationsDisplay');
const accuracyDisplay = document.getElementById('accuracyDisplay');
const weight1Display = document.getElementById('weight1Display');
const weight2Display = document.getElementById('weight2Display');
const biasDisplay = document.getElementById('biasDisplay');

// --- Perceptron Class ---
class Perceptron {
    constructor(learningRate = 0.05) {
        this.weights = [this.randomWeight(), this.randomWeight()]; // For x and y
        this.bias = this.randomWeight();
        this.learningRate = learningRate;
    }

    randomWeight() {
        return Math.random() * 2 - 1; // Between -1 and 1
    }

    // Activation function (step function)
    activate(sum) {
        return sum >= 0 ? 1 : -1;
    }

    // Predict the class for given inputs
    predict(inputs) {
        const sum = inputs[0] * this.weights[0] + inputs[1] * this.weights[1] + this.bias;
        return this.activate(sum);
    }

    // Train the perceptron with a given input and target
    train(inputs, target) {
        const prediction = this.predict(inputs);
        const error = target - prediction;

        if (error !== 0) {
            // Adjust weights and bias
            this.weights[0] += error * inputs[0] * this.learningRate;
            this.weights[1] += error * inputs[1] * this.learningRate;
            this.bias += error * this.learningRate;
            return true; // Weights adjusted
        }
        return false; // No adjustment needed
    }

    // Reset weights and bias
    reset() {
        this.weights = [this.randomWeight(), this.randomWeight()];
        this.bias = this.randomWeight();
    }
}

// --- Global Variables ---
let perceptron = new Perceptron();
let dataPoints = []; // Stores {x, y, label: 1 or -1}
let training = false;
let animationFrameId = null;
let iterations = 0;

// --- Canvas Coordinate Mapping ---
// Map logical coordinates (-1 to 1) to canvas coordinates (0 to width/height)
function mapToCanvasX(logicalX) {
    return (logicalX + 1) / 2 * canvas.width;
}

function mapToCanvasY(logicalY) {
    // Canvas Y is inverted, so (1 - logicalY)
    return (1 - logicalY) / 2 * canvas.height;
}

// Map canvas coordinates to logical coordinates
function mapToLogicalX(canvasX) {
    return (canvasX / canvas.width) * 2 - 1;
}

function mapToLogicalY(canvasY) {
    return 1 - (canvasY / canvas.height) * 2;
}

// --- Drawing Functions ---
function drawPoint(point) {
    ctx.beginPath();
    ctx.arc(mapToCanvasX(point.x), mapToCanvasY(point.y), 5, 0, Math.PI * 2);
    ctx.fillStyle = point.label === 1 ? '#e74c3c' : '#3498db'; // Red for +1, Blue for -1
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function drawDecisionBoundary() {
    // The decision boundary is defined by W1*x + W2*y + B = 0
    const w1 = perceptron.weights[0];
    const w2 = perceptron.weights[1];
    const bias = perceptron.bias;

    let p1 = { x: -1, y: 0 }; // Default points
    let p2 = { x: 1, y: 0 };

    // Handle vertical line case (W2 is near zero)
    if (Math.abs(w2) < 0.0001) {
        if (Math.abs(w1) > 0.0001) {
            p1.x = p2.x = -bias / w1;
            p1.y = -1; // Y spans full logical range
            p2.y = 1;
        } else {
            // Both W1 and W2 are near zero, no clear boundary
            return; 
        }
    } else {
        // General case: y = (-W1*x - B) / W2
        p1.y = (-w1 * p1.x - bias) / w2;
        p2.y = (-w1 * p2.x - bias) / w2;
    }

    // Extend line points if they are outside the logical bounds, to ensure they span the canvas
    // This simple extension is usually sufficient for visualization.
    if (p1.y < -1 || p1.y > 1 || p2.y < -1 || p2.y > 1) {
        // Recalculate using y-bounds if x-bounds led to off-canvas y
        p1 = { x: 0, y: -1 }; 
        p2 = { x: 0, y: 1 };
        if (Math.abs(w1) < 0.0001) {
             if (Math.abs(w2) > 0.0001) {
                p1.y = p2.y = -bias / w2;
                p1.x = -1;
                p2.x = 1;
            } else {
                 return; // Still no clear boundary
            }
        } else {
            p1.x = (-w2 * p1.y - bias) / w1;
            p2.x = (-w2 * p2.y - bias) / w1;
        }
    }

    // Draw the line
    ctx.beginPath();
    ctx.moveTo(mapToCanvasX(p1.x), mapToCanvasY(p1.y));
    ctx.lineTo(mapToCanvasX(p2.x), mapToCanvasY(p2.y));
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.stroke();
}


function drawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    dataPoints.forEach(drawPoint); // Draw all data points
    drawDecisionBoundary(); // Draw the current decision boundary
}

// --- Training Logic ---
function calculateAccuracy() {
    if (dataPoints.length === 0) return 0;
    let correct = 0;
    for (const point of dataPoints) {
        const prediction = perceptron.predict([point.x, point.y]);
        if (prediction === point.label) {
            correct++;
        }
    }
    return (correct / dataPoints.length) * 100;
}

function updateStats() {
    iterationsDisplay.textContent = iterations;
    accuracyDisplay.textContent = `${calculateAccuracy().toFixed(2)}%`;
    weight1Display.textContent = perceptron.weights[0].toFixed(2);
    weight2Display.textContent = perceptron.weights[1].toFixed(2);
    biasDisplay.textContent = perceptron.bias.toFixed(2);
}

function trainLoop() {
    if (training && dataPoints.length > 0) {
        // Pick a random data point for training (Stochastic Gradient Descent)
        const randomIndex = Math.floor(Math.random() * dataPoints.length);
        const point = dataPoints[randomIndex];

        // Train the perceptron
        const adjusted = perceptron.train([point.x, point.y], point.label);
        if (adjusted) {
            iterations++;
        }
        
        // Update display and redraw
        updateStats();
        drawAll();
        
        animationFrameId = requestAnimationFrame(trainLoop);
    } else if (training && dataPoints.length === 0) {
        // If training is active but no data points, stop loop
        stopTraining();
        alert("Add data points to start training!");
    }
}

function startTraining() {
    if (dataPoints.length === 0) {
        alert("Please add some data points before starting training!");
        return;
    }
    training = true;
    startButton.textContent = 'Stop Training';
    startButton.classList.add('stop');
    trainLoop();
}

function stopTraining() {
    training = false;
    startButton.textContent = 'Start Training';
    startButton.classList.remove('stop');
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

function resetVisualization() {
    stopTraining();
    perceptron.reset();
    dataPoints = [];
    iterations = 0;
    updateStats();
    drawAll(); // Clear canvas and draw initial (empty) state
}

// --- Event Listeners ---
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;

    const logicalX = mapToLogicalX(canvasX);
    const logicalY = mapToLogicalY(canvasY);

    // Determine selected class from radio buttons
    let selectedClass = parseInt(document.querySelector('input[name="add_class"]:checked').value);

    dataPoints.push({ x: logicalX, y: logicalY, label: selectedClass });
    drawAll();
    updateStats(); // Update stats immediately after adding point, accuracy will change
});

startButton.addEventListener('click', () => {
    if (training) {
        stopTraining();
    } else {
        startTraining();
    }
});

resetButton.addEventListener('click', resetVisualization);

// --- Initial Setup ---
resetVisualization(); // Initialize everything on page load
