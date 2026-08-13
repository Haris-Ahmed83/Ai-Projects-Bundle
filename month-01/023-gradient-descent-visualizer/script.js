// DOM Elements
const canvas = document.getElementById('gdCanvas');
const ctx = canvas.getContext('2d');
const learningRateInput = document.getElementById('learningRate');
const startXInput = document.getElementById('startX');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const currentXDisplay = document.getElementById('currentXDisplay');
const currentYDisplay = document.getElementById('currentYDisplay');
const iterationDisplay = document.getElementById('iterationDisplay');

// Visualization Parameters
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const xMin = -10; // Minimum X value for function plot
const xMax = 15;  // Maximum X value for function plot
const yMin = 0;   // Minimum Y value for canvas display
const yMaxDisplay = 180; // Maximum Y value for canvas display, adjusted for f(x)

// Scaling functions to map model coordinates to canvas coordinates
function mapXToCanvas(x) {
    return (x - xMin) / (xMax - xMin) * canvasWidth;
}

function mapYToCanvas(y) {
    // Canvas Y-axis is inverted (0 at top, height at bottom)
    return canvasHeight - ((y - yMin) / (yMaxDisplay - yMin) * canvasHeight);
}

// Gradient Descent State
let learningRate = parseFloat(learningRateInput.value);
let currentX = parseFloat(startXInput.value);
let iterations = 0;
let path = []; // Stores [x, y] points of the descent path
let animationId = null;
let isRunning = false;
let stepDelay = 100; // Milliseconds per gradient descent step
let lastStepTime = 0;

// Function to minimize: f(x) = x^2 - 4x + 5
// Global minimum at x=2, f(2) = 1
function f(x) {
    return x * x - 4 * x + 5;
}

// Derivative of the function: f'(x) = 2x - 4
function df(x) {
    return 2 * x - 4;
}

// Drawing functions
function clearCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

function drawAxes() {
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;

    // X-axis (where Y=0 in model coordinates)
    const yAxisPosition = mapYToCanvas(0);
    ctx.beginPath();
    ctx.moveTo(0, yAxisPosition);
    ctx.lineTo(canvasWidth, yAxisPosition);
    ctx.stroke();

    // Y-axis (where X=0 in model coordinates)
    const xAxisPosition = mapXToCanvas(0);
    ctx.beginPath();
    ctx.moveTo(xAxisPosition, 0);
    ctx.lineTo(xAxisPosition, canvasHeight);
    ctx.stroke();
}

function drawFunction() {
    ctx.strokeStyle = '#3498db'; // Blue
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < canvasWidth; i++) {
        const x = xMin + (i / canvasWidth) * (xMax - xMin); // Map canvasX to modelX
        const y = f(x);
        const canvasX = mapXToCanvas(x);
        const canvasY = mapYToCanvas(y);

        // Ensure drawing stays within canvas bounds for Y
        if (canvasY >= 0 && canvasY <= canvasHeight) {
            if (i === 0) {
                ctx.moveTo(canvasX, canvasY);
            } else {
                ctx.lineTo(canvasX, canvasY);
            }
        }
    }
    ctx.stroke();
}

function drawPath() {
    if (path.length < 2) return;

    ctx.strokeStyle = '#e74c3c'; // Red
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(mapXToCanvas(path[0][0]), mapYToCanvas(path[0][1]));

    for (let i = 1; i < path.length; i++) {
        ctx.lineTo(mapXToCanvas(path[i][0]), mapYToCanvas(path[i][1]));
    }
    ctx.stroke();
}

function drawCurrentPoint() {
    const canvasX = mapXToCanvas(currentX);
    const canvasY = mapYToCanvas(f(currentX));

    ctx.fillStyle = '#2ecc71'; // Green
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw a smaller circle for the starting point
    if (path.length > 0) {
        const startCanvasX = mapXToCanvas(path[0][0]);
        const startCanvasY = mapYToCanvas(path[0][1]);
        ctx.fillStyle = '#f39c12'; // Orange
        ctx.beginPath();
        ctx.arc(startCanvasX, startCanvasY, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

function updateDisplays() {
    currentXDisplay.textContent = currentX.toFixed(4);
    currentYDisplay.textContent = f(currentX).toFixed(4);
    iterationDisplay.textContent = iterations;
}

// Gradient Descent Logic
function gradientDescentStep() {
    const gradient = df(currentX);
    currentX -= learningRate * gradient;
    iterations++;
    path.push([currentX, f(currentX)]);
    updateDisplays();
}

function reset() {
    cancelAnimationFrame(animationId); // Stop any ongoing animation
    isRunning = false;
    startButton.textContent = 'Start';
    startButton.classList.remove('stop');

    learningRate = parseFloat(learningRateInput.value);
    currentX = parseFloat(startXInput.value);
    iterations = 0;
    path = [[currentX, f(currentX)]]; // Add initial point to path

    updateDisplays();
    drawVisualization(); // Redraw with new initial state
}

function drawVisualization() {
    clearCanvas();
    drawAxes();
    drawFunction();
    drawPath();
    drawCurrentPoint();
}

// Animation Loop
function animate(currentTime) {
    if (isRunning) {
        if (currentTime - lastStepTime > stepDelay) {
            gradientDescentStep();
            lastStepTime = currentTime;
        }
    }

    drawVisualization();
    animationId = requestAnimationFrame(animate);
}

// Event Listeners
startButton.addEventListener('click', () => {
    isRunning = !isRunning;
    if (isRunning) {
        startButton.textContent = 'Stop';
        startButton.classList.add('stop');
        lastStepTime = performance.now(); // Initialize lastStepTime on start
        if (!animationId) { // Only start a new animation loop if not already running
            animationId = requestAnimationFrame(animate);
        }
    } else {
        startButton.textContent = 'Start';
        startButton.classList.remove('stop');
        // No need to cancelAnimationFrame if animate loop continues to draw even when stopped
    }
});

resetButton.addEventListener('click', reset);

// Update parameters on input change
learningRateInput.addEventListener('change', () => {
    learningRate = parseFloat(learningRateInput.value);
    // It's good practice to reset when learning rate changes to see the effect from scratch
    reset(); 
});

startXInput.addEventListener('change', () => {
    // Always reset when starting X changes, as it defines a new starting condition
    reset();
});

// Initial setup
reset(); // Call reset once to set initial state and draw
animationId = requestAnimationFrame(animate); // Start the animation loop to keep canvas updated
