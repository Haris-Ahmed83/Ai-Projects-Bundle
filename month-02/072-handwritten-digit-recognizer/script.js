const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const predictBtn = document.getElementById('predictBtn');
const clearBtn = document.getElementById('clearBtn');
const predictionResult = document.getElementById('predictionResult');
const statusDiv = document.getElementById('status');

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let model; // To store the loaded TensorFlow.js model

// --- Canvas Drawing Setup ---
ctx.lineWidth = 20; // Thickness of the drawing line
ctx.lineCap = 'round'; // Round caps for smoother lines
ctx.strokeStyle = '#000'; // Black ink
ctx.fillStyle = '#fff'; // White background for the canvas
ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill canvas with white background initially

// --- Helper to get canvas coordinates, handling mouse and touch events ---
function getCanvasCoordinates(event) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (event.touches) {
        // For touch events
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        // For mouse events
        clientX = event.clientX;
        clientY = event.clientY;
    }

    return [
        clientX - rect.left, // X coordinate relative to the canvas
        clientY - rect.top   // Y coordinate relative to the canvas
    ];
}

// --- Canvas Drawing Functions ---
function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = getCanvasCoordinates(e);
    ctx.beginPath(); // Start a new path
    ctx.moveTo(lastX, lastY); // Move to the starting point
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault(); // Prevent scrolling on touch devices while drawing
    const [currentX, currentY] = getCanvasCoordinates(e);
    ctx.lineTo(currentX, currentY); // Draw a line to the current point
    ctx.stroke(); // Render the line
    [lastX, lastY] = [currentX, currentY]; // Update last position
}

function stopDrawing() {
    isDrawing = false;
    ctx.closePath(); // Close the current path
}

// --- Event Listeners for Drawing (Mouse and Touch) ---
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing); // Stop drawing if mouse leaves canvas area

canvas.addEventListener('touchstart', startDrawing, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchcancel', stopDrawing); // Handle when touch is interrupted

// --- Model Loading Function ---
async function loadModel() {
    statusDiv.textContent = 'Loading AI model... This might take a moment.';
    try {
        // Load a pre-trained MNIST model from Google Cloud Storage
        // This model is a simple convolutional neural network (CNN) trained on the MNIST dataset.
        // It expects 28x28 grayscale images with white digits on a black background.
        model = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/mnist_model_v2/model.json');
        statusDiv.textContent = 'AI model loaded successfully!';
        predictBtn.disabled = false; // Enable predict button once model is ready
    } catch (error) {
        console.error('Failed to load model:', error);
        statusDiv.textContent = 'Error loading model. Please check your internet connection.';
        predictBtn.disabled = true;
    }
}

// --- Prediction Function ---
async function predictDigit() {
    if (!model) {
        predictionResult.textContent = 'Model not loaded yet. Please wait.';
        return;
    }

    // 1. Create a temporary 28x28 canvas for preprocessing the drawn digit.
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 28;
    tempCanvas.height = 28;
    const tempCtx = tempCanvas.getContext('2d');

    // 2. Draw the content of the main drawing canvas onto the smaller canvas.
    // We draw with a black background first, then the drawn digit, to match MNIST model's expectation.
    tempCtx.fillStyle = '#000'; // Set background to black
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0, 28, 28); // Scale down the drawing

    // 3. Get the image data from the scaled-down canvas.
    const imageData = tempCtx.getImageData(0, 0, 28, 28);

    // 4. Preprocess the image data for the TensorFlow.js model.
    // Convert to grayscale tensor, normalize pixel values, and ensure correct shape.
    let tensor = tf.browser.fromPixels(imageData, 1) // 1 for grayscale channel
        .toFloat() // Convert to float32
        .div(tf.scalar(255)); // Normalize pixel values to [0, 1]

    // The MNIST model expects white digits on a black background.
    // Our drawing is black on white, so we invert the colors.
    tensor = tf.scalar(1).sub(tensor); // Invert colors (1 - pixel_value)

    // Add a batch dimension to the tensor. Model expects [batch_size, height, width, channels].
    // For a single image, batch_size is 1, so shape becomes [1, 28, 28, 1].
    const inputTensor = tensor.expandDims(0); 

    // 5. Make the prediction using the loaded model.
    const prediction = model.predict(inputTensor);

    // 6. Get the raw prediction scores and find the digit with the highest score.
    const scores = Array.from(prediction.dataSync()); // Convert tensor to a JavaScript array
    const predictedDigit = scores.indexOf(Math.max(...scores)); // Get index of max score (the predicted digit)
    const confidence = Math.max(...scores) * 100; // Calculate confidence percentage

    // 7. Display the result to the user.
    predictionResult.textContent = `Predicted: ${predictedDigit} (Confidence: ${confidence.toFixed(2)}%)`;

    // 8. Dispose of TensorFlow.js tensors to free up GPU memory.
    tf.dispose([tensor, inputTensor, prediction]);
}

// --- Clear Canvas Function ---
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear all pixels
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Re-fill with white background
    predictionResult.textContent = ''; // Clear previous prediction result
}

// --- Initialization ---
predictBtn.disabled = true; // Disable predict button until the model is loaded
loadModel(); // Start loading the AI model when the script runs

// Assign event listeners to buttons
predictBtn.addEventListener('click', predictDigit);
clearBtn.addEventListener('click', clearCanvas);
