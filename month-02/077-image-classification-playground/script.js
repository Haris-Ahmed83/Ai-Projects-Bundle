const video = document.getElementById('webcam');
const statusElement = document.getElementById('status');
const predictionsElement = document.getElementById('predictions');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');

let model;
let liveStream;
let isPredicting = false;

async function loadModel() {
    statusElement.textContent = 'Loading MobileNet model... This might take a moment.';
    try {
        model = await mobilenet.load();
        statusElement.textContent = 'Model loaded successfully! Click "Start Classification" to begin.';
        startButton.disabled = false;
    } catch (error) {
        statusElement.textContent = `Error loading model: ${error.message}`;
        statusElement.classList.add('error');
        console.error('Model loading error:', error);
    }
}

async function setupWebcam() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            liveStream = stream; // Store the stream to stop it later
            return new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    video.play(); // Ensure video starts playing
                    resolve();
                };
            });
        } catch (error) {
            statusElement.textContent = `Webcam access denied: ${error.message}. Please allow camera access.`;
            statusElement.classList.add('error');
            console.error('Webcam access error:', error);
            throw error; // Re-throw to prevent further execution in startClassification
        }
    } else {
        statusElement.textContent = 'Webcam not supported by your browser.';
        statusElement.classList.add('error');
        throw new Error('Webcam not supported');
    }
}

async function predict() {
    if (!isPredicting) {
        return;
    }

    // Classify the image in the video stream.
    const predictions = await model.classify(video);

    // Display the predictions.
    predictionsElement.innerHTML = '';
    if (predictions.length === 0) {
        predictionsElement.innerHTML = '<li>No predictions found.</li>';
    } else {
        predictions.forEach(prediction => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${prediction.className}</strong>: ${Math.round(prediction.probability * 100)}%`;
            predictionsElement.appendChild(li);
        });
    }

    // Call this function again to keep predicting when the browser is ready.
    requestAnimationFrame(predict);
}

async function startClassification() {
    if (!model) {
        statusElement.textContent = 'Model not loaded yet.';
        return;
    }

    predictionsElement.innerHTML = '<li>Starting webcam...</li>';
    startButton.disabled = true;
    stopButton.disabled = true; 

    try {
        await setupWebcam();
        isPredicting = true;
        stopButton.disabled = false;
        statusElement.textContent = 'Real-time classification active. Look at your webcam!';
        predict(); // Start the prediction loop
    } catch (error) {
        // Webcam setup failed, re-enable start button
        startButton.disabled = false;
        stopButton.disabled = true;
        predictionsElement.innerHTML = '<li>Failed to start webcam.</li>';
    }
}

function stopClassification() {
    isPredicting = false;
    if (liveStream) {
        liveStream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    startButton.disabled = false;
    stopButton.disabled = true;
    statusElement.textContent = 'Classification stopped.';
    predictionsElement.innerHTML = '<li>Classification stopped. Click "Start Classification" to resume.</li>';
}

// Event Listeners
startButton.addEventListener('click', startClassification);
stopButton.addEventListener('click', stopClassification);

// Initial load
window.onload = loadModel;
