// DOM Elements
const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');
const statusDiv = document.getElementById('status');
const feedbackOutput = document.getElementById('feedbackOutput');
const speechCanvas = document.getElementById('speechCanvas');
const ctx = speechCanvas.getContext('2d');

let mediaRecorder;
let audioChunks = [];
let audioBlob;
let streamRef; // To keep track of the media stream

// --- Web Audio API & Recording --- 

// Request microphone access and set up MediaRecorder
async function setupAudio() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef = stream; // Store stream to stop tracks later if needed
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            audioChunks = []; // Clear chunks for next recording
            statusDiv.textContent = 'Recording stopped. Analyzing speech...';
            analyzeSpeech(audioBlob); // Simulate AI analysis
        };

        recordBtn.disabled = false;
        statusDiv.textContent = 'Ready to record. Click "Start Recording".';

    } catch (err) {
        console.error('Error accessing microphone:', err);
        statusDiv.textContent = 'Error: Microphone access denied or not available. Please allow microphone access.';
        recordBtn.disabled = true;
        stopBtn.disabled = true;
    }
}

// Event listener for Start Recording button
recordBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'inactive') {
        audioChunks = []; // Ensure chunks are empty for a new recording
        mediaRecorder.start();
        recordBtn.disabled = true;
        stopBtn.disabled = false;
        statusDiv.textContent = 'Recording started... Speak clearly!';
        feedbackOutput.innerHTML = '<p>Recording in progress. Speak clearly!</p>';
        clearCanvas(); // Clear previous visualization
    }
});

// Event listener for Stop Recording button
stopBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        recordBtn.disabled = false;
        stopBtn.disabled = true;
        statusDiv.textContent = 'Stopping recording... Please wait for analysis.';
    }
});

// Initialize audio setup when the script loads
setupAudio();

// --- AI Analysis Simulation ---

function analyzeSpeech(audioBlob) {
    // In a real application, audioBlob would be sent to a backend AI service
    // for actual processing (e.g., using WebSockets or Fetch API).
    // For this client-side demo, we simulate the AI analysis with a delay.

    feedbackOutput.innerHTML = '<p>Analyzing your speech with advanced AI...</p>';

    setTimeout(() => {
        // Simulate various speech metrics
        const pace = (Math.random() * (180 - 100) + 100).toFixed(0); // Words per minute
        const tone = ['Confident', 'Engaging', 'Monotone', 'Varied', 'Calm'][Math.floor(Math.random() * 5)];
        const fillerWords = (Math.random() * 10).toFixed(0); // Count of filler words
        const clarity = (Math.random() * (95 - 70) + 70).toFixed(0); // Percentage
        const suggestions = [
            "Try to vary your pace to keep the audience engaged.",
            "Focus on enunciating words clearly, especially at the end of sentences.",
            "Practice pausing naturally instead of using filler words. Silence can be powerful.",
            "Maintain eye contact and use hand gestures to convey confidence and connect.",
            "Review your speech structure for better flow and impact. Start strong, end strong.",
            "Incorporate vocal exercises to improve tone and projection."
        ];
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

        const feedbackHTML = `
            <h3>Analysis Results:</h3>
            <ul>
                <li><strong>Pace:</strong> ${pace} words/minute 
                    <span style="color: ${pace > 160 || pace < 120 ? '#ff8c00' : '#28a745'};">
                    (${pace > 160 ? 'A bit fast' : (pace < 120 ? 'A bit slow' : 'Optimal')})</span></li>
                <li><strong>Tone:</strong> ${tone}</li>
                <li><strong>Filler Words:</strong> ${fillerWords} 
                    <span style="color: ${fillerWords > 5 ? '#ff8c00' : '#28a745'};">
                    (${fillerWords > 5 ? 'Needs attention' : 'Good'})</span></li>
                <li><strong>Clarity:</strong> ${clarity}% 
                    <span style="color: ${clarity < 80 ? '#ff8c00' : '#28a745'};">
                    (${clarity < 80 ? 'Improve clarity' : 'Excellent'})</span></li>
            </ul>
            <h3>Personalized Tip:</h3>
            <p>${randomSuggestion}</p>
        `;
        feedbackOutput.innerHTML = feedbackHTML;
        statusDiv.textContent = 'Analysis complete! Record again for new feedback.';

        // Simulate data for visualization (e.g., volume over time, or confidence scores)
        const speechData = Array.from({ length: 30 }, () => Math.random() * 80 + 20); // Random values between 20-100
        drawVisualization(speechData);

    }, 2000); // Simulate AI processing time with a 2-second delay
}

// --- Data Visualization (Canvas) ---

// Clear the canvas area
function clearCanvas() {
    ctx.clearRect(0, 0, speechCanvas.width, speechCanvas.height);
}

// Draw a simple bar chart visualization on the canvas
function drawVisualization(data) {
    clearCanvas();
    const width = speechCanvas.width;
    const height = speechCanvas.height;
    const barWidth = width / data.length;

    ctx.fillStyle = '#4CAF50'; // Green color for bars
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;

    for (let i = 0; i < data.length; i++) {
        const barHeight = (data[i] / 100) * height; // Scale data (0-100) to canvas height
        const x = i * barWidth;
        const y = height - barHeight; // Draw bars from the bottom up

        ctx.fillRect(x, y, barWidth - 1, barHeight); // -1 for a small gap between bars
        ctx.strokeRect(x, y, barWidth - 1, barHeight); // Outline for clarity
    }

    // Add a simple label
    ctx.fillStyle = '#555';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Speech Segments / Metrics Over Time', width / 2, height - 5);
}

// Adjust canvas resolution for high-DPI screens
function setCanvasResolution() {
    const dpr = window.devicePixelRatio || 1;
    const rect = speechCanvas.getBoundingClientRect();
    speechCanvas.width = rect.width * dpr;
    speechCanvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    // Redraw visualization if data exists (e.g., after analysis)
    // This is a simplified approach. In a real app, you'd store the last data.
    if (feedbackOutput.innerHTML.includes('Analysis Results:')) {
        // Re-simulate data to redraw; not ideal but functional for this demo
        const dummyData = Array.from({ length: 30 }, () => Math.random() * 80 + 20);
        drawVisualization(dummyData);
    } else {
        clearCanvas();
    }
}

// Set initial canvas resolution and update on window resize
setCanvasResolution();
window.addEventListener('resize', setCanvasResolution);
