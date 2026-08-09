const imageUpload = document.getElementById('imageUpload');
const webcamToggle = document.getElementById('webcamToggle');
const imageDisplay = document.getElementById('imageDisplay');
const webcamVideo = document.getElementById('webcamVideo');
const webcamCanvas = document.getElementById('webcamCanvas');
const captureButton = document.getElementById('captureButton');
const predictionList = document.getElementById('predictionList');
const loadingSpinner = document.getElementById('loading');

let model;
let webcamStream;
let isWebcamActive = false;

// Function to load the MobileNet model
async function loadModel() {
    loadingSpinner.style.display = 'block';
    predictionList.innerHTML = '<li>Loading AI model... Please wait.</li>';
    try {
        model = await mobilenet.load();
        predictionList.innerHTML = '<li>AI model loaded successfully!</li>';
    } catch (error) {
        console.error("Error loading model:", error);
        predictionList.innerHTML = `<li style="color: red;">Failed to load AI model: ${error.message}</li>`;
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

// Function to make predictions
async function predictImage(sourceElement) {
    if (!model) {
        predictionList.innerHTML = '<li style="color: orange;">Model not loaded yet. Please wait.</li>';
        return;
    }

    loadingSpinner.style.display = 'block';
    predictionList.innerHTML = '<li>Analyzing image...</li>';

    try {
        const predictions = await model.classify(sourceElement);
        displayPredictions(predictions);
    } catch (error) {
        console.error("Error during prediction:", error);
        predictionList.innerHTML = `<li style="color: red;">Error analyzing image: ${error.message}</li>`;
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

// Function to display predictions
function displayPredictions(predictions) {
    if (predictions.length === 0) {
        predictionList.innerHTML = '<li>No clear predictions found.</li>';
        return;
    }

    predictionList.innerHTML = '';
    predictions.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${p.className}</span> <strong>${(p.probability * 100).toFixed(2)}%</strong>`;
        predictionList.appendChild(li);
    });
}

// Handle image upload
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        if (isWebcamActive) {
            stopWebcam();
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            imageDisplay.src = e.target.result;
            imageDisplay.style.display = 'block';
            webcamVideo.style.display = 'none';
            captureButton.style.display = 'none';
            imageDisplay.onload = () => predictImage(imageDisplay); // Ensure image is loaded before predicting
        };
        reader.readAsDataURL(file);
    } else {
        imageDisplay.src = "https://via.placeholder.com/300?text=Upload+or+Webcam";
        predictionList.innerHTML = '<li>No image selected.</li>';
    }
});

// Start webcam
async function startWebcam() {
    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
        webcamVideo.srcObject = webcamStream;
        webcamVideo.style.display = 'block';
        imageDisplay.style.display = 'none';
        captureButton.style.display = 'block';
        webcamToggle.textContent = 'Stop Webcam';
        isWebcamActive = true;
        predictionList.innerHTML = '<li>Webcam active. Click "Capture Frame" to analyze.</li>';
    } catch (err) {
        console.error("Error accessing webcam: ", err);
        predictionList.innerHTML = `<li style="color: red;">Error accessing webcam: ${err.message}</li>`;
        webcamToggle.textContent = 'Use Webcam';
        isWebcamActive = false;
    }
}

// Stop webcam
function stopWebcam() {
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamVideo.srcObject = null;
    }
    webcamVideo.style.display = 'none';
    imageDisplay.style.display = 'block';
    captureButton.style.display = 'none';
    webcamToggle.textContent = 'Use Webcam';
    isWebcamActive = false;
    imageDisplay.src = "https://via.placeholder.com/300?text=Upload+or+Webcam";
    predictionList.innerHTML = '<li>No image loaded yet.</li>';
}

// Toggle webcam
webcamToggle.addEventListener('click', () => {
    if (isWebcamActive) {
        stopWebcam();
    } else {
        startWebcam();
    }
});

// Capture frame from webcam
captureButton.addEventListener('click', () => {
    if (webcamVideo.srcObject) {
        const context = webcamCanvas.getContext('2d');
        webcamCanvas.width = webcamVideo.videoWidth;
        webcamCanvas.height = webcamVideo.videoHeight;
        context.drawImage(webcamVideo, 0, 0, webcamCanvas.width, webcamCanvas.height);
        
        imageDisplay.src = webcamCanvas.toDataURL('image/jpeg');
        imageDisplay.style.display = 'block';
        webcamVideo.style.display = 'none';
        captureButton.style.display = 'none'; // Hide capture button after capturing
        
        predictImage(webcamCanvas);
    }
});

// Initialize the app
loadModel();
