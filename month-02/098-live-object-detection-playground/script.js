const webcamVideo = document.getElementById('webcamVideo');
const webcamCanvas = document.getElementById('webcamCanvas');
const webcamCtx = webcamCanvas.getContext('2d');
const webcamToggleBtn = document.getElementById('webcamToggleBtn');
const webcamStatus = document.getElementById('webcamStatus');

const imageUpload = document.getElementById('imageUpload');
const uploadedImage = document.getElementById('uploadedImage');
const imageCanvas = document.getElementById('imageCanvas');
const imageCtx = imageCanvas.getContext('2d');
const detectImageBtn = document.getElementById('detectImageBtn');
const imageStatus = document.getElementById('imageStatus');

let model = null;
let webcamStream = null;
let animationFrameId = null;
let isWebcamActive = false;

// --- Model Loading ---
async function loadModel() {
    webcamStatus.textContent = 'Loading object detection model...';
    imageStatus.textContent = 'Loading object detection model...';
    try {
        model = await cocoSsd.load();
        webcamStatus.textContent = 'Model loaded. Click "Start Webcam" to begin.';
        imageStatus.textContent = 'Model loaded. Upload an image to detect objects.';
        webcamToggleBtn.disabled = false; // Enable webcam button once model is loaded
    } catch (error) {
        console.error('Failed to load model:', error);
        webcamStatus.textContent = 'Error loading model! Please refresh.';
        imageStatus.textContent = 'Error loading model! Please refresh.';
    }
}

// --- Webcam Functions ---
async function startWebcam() {
    webcamStatus.textContent = 'Requesting webcam access...';
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }, // Prefer rear camera on mobile
            audio: false
        });
        webcamVideo.srcObject = stream;
        webcamStream = stream;
        isWebcamActive = true;
        webcamToggleBtn.textContent = 'Stop Webcam';
        webcamStatus.textContent = 'Webcam started. Detecting objects...';

        webcamVideo.onloadedmetadata = () => {
            // Set canvas dimensions to match video stream
            webcamCanvas.width = webcamVideo.videoWidth;
            webcamCanvas.height = webcamVideo.videoHeight;
            detectObjectsInWebcam(); // Start the detection loop
        };

    } catch (err) {
        console.error('Error accessing webcam:', err);
        webcamStatus.textContent = 'Error: Could not access webcam. Make sure you grant permission and try again.';
        isWebcamActive = false;
        webcamToggleBtn.textContent = 'Start Webcam';
        // No need to disable, user might try again after granting permission
    }
}

function stopWebcam() {
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamVideo.srcObject = null;
        webcamStream = null;
    }
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId); // Stop the detection loop
        animationFrameId = null;
    }
    webcamCtx.clearRect(0, 0, webcamCanvas.width, webcamCanvas.height); // Clear canvas
    webcamStatus.textContent = 'Webcam stopped.';
    webcamToggleBtn.textContent = 'Start Webcam';
    isWebcamActive = false;
}

async function detectObjectsInWebcam() {
    if (!isWebcamActive || !model) return; // Stop if webcam is inactive or model not loaded

    // Draw the video frame onto the canvas
    webcamCtx.drawImage(webcamVideo, 0, 0, webcamCanvas.width, webcamCanvas.height);

    // Perform detection
    const predictions = await model.detect(webcamVideo);

    // Draw bounding boxes and labels
    drawPredictions(predictions, webcamCtx, webcamCanvas.width, webcamCanvas.height);

    // Loop back for the next frame
    animationFrameId = requestAnimationFrame(detectObjectsInWebcam);
}

// --- Image Upload Functions ---
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        if (!model) {
            imageStatus.textContent = 'Model is still loading, please wait.';
            return;
        }
        imageStatus.textContent = 'Image selected. Click "Detect Objects".';
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedImage.src = e.target.result;
            uploadedImage.style.display = 'block';
            detectImageBtn.disabled = false; // Enable detect button

            uploadedImage.onload = () => {
                // Set canvas dimensions to match image dimensions
                imageCanvas.width = uploadedImage.naturalWidth;
                imageCanvas.height = uploadedImage.naturalHeight;
                // Draw the image onto the canvas (clears previous content)
                imageCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
                imageCtx.drawImage(uploadedImage, 0, 0, imageCanvas.width, imageCanvas.height);
            };
        };
        reader.readAsDataURL(file);
    } else {
        uploadedImage.style.display = 'none';
        imageCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
        detectImageBtn.disabled = true;
        imageStatus.textContent = 'No image selected.';
    }
});

detectImageBtn.addEventListener('click', async () => {
    if (!model || !uploadedImage.src) {
        imageStatus.textContent = 'Please upload an image and ensure the model is loaded.';
        return;
    }

    imageStatus.textContent = 'Detecting objects in image...';
    detectImageBtn.disabled = true; // Disable during detection

    try {
        // Clear previous drawings and redraw the image before new detections
        imageCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
        imageCtx.drawImage(uploadedImage, 0, 0, imageCanvas.width, imageCanvas.height);

        const predictions = await model.detect(uploadedImage);
        drawPredictions(predictions, imageCtx, imageCanvas.width, imageCanvas.height);
        imageStatus.textContent = `Detected ${predictions.length} objects.`;
    } catch (error) {
        console.error('Error detecting objects in image:', error);
        imageStatus.textContent = 'Error detecting objects.';
    } finally {
        detectImageBtn.disabled = false; // Re-enable after detection
    }
});


// --- Drawing Function (Shared) ---
function drawPredictions(predictions, ctx, canvasWidth, canvasHeight) {
    ctx.font = '18px Arial';
    ctx.strokeStyle = '#00FFFF'; // Cyan for box borders
    ctx.lineWidth = 3;
    ctx.fillStyle = '#00FFFF'; // Cyan for text background

    predictions.forEach(prediction => {
        const [x, y, width, height] = prediction.bbox;

        // Draw bounding box
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.stroke();

        // Prepare text label
        const text = `${prediction.class} (${Math.round(prediction.score * 100)}%)`;
        const textWidth = ctx.measureText(text).width;
        const textHeight = parseInt(ctx.font, 10); // Get actual text height from font size

        // Draw label background (adjust position to be above the box if possible)
        const textY = y > textHeight ? y - textHeight - 5 : y + 5; // 5px padding
        ctx.fillRect(x, textY, textWidth + 10, textHeight + 5); // 10px horizontal, 5px vertical padding

        // Draw label text
        ctx.fillStyle = '#000000'; // Black text
        ctx.fillText(text, x + 5, textY + textHeight); // 5px padding
        ctx.fillStyle = '#00FFFF'; // Reset fill style for next box background
    });
}

// --- Event Listeners and Initialization ---
webcamToggleBtn.addEventListener('click', () => {
    if (isWebcamActive) {
        stopWebcam();
    } else {
        startWebcam();
    }
});

// Initial model loading when the script starts
loadModel();
