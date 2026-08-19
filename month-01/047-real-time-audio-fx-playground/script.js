// Global Audio Context and Nodes
let audioContext;
let currentSource = null; // Can be AudioBufferSourceNode or MediaStreamSourceNode
let analyser;
let gainNode;
let filterNode;
let audioBuffer = null; // To store decoded audio for file playback
let mediaStream = null; // To store microphone stream

// DOM Elements
const audioFileInput = document.getElementById('audioFile');
const micInputBtn = document.getElementById('micInputBtn');
const playPauseBtn = document.getElementById('playPauseBtn');
const stopBtn = document.getElementById('stopBtn');
const volumeSlider = document.getElementById('volume');
const filterTypeSelect = document.getElementById('filterType');
const filterFrequencySlider = document.getElementById('filterFrequency');
const filterFrequencyValue = document.getElementById('filterFrequencyValue');
const filterQSlider = document.getElementById('filterQ');
const filterQValue = document.getElementById('filterQValue');
const audioVisualizer = document.getElementById('audioVisualizer');
const canvasCtx = audioVisualizer.getContext('2d');

let animationFrameId;

// Initialize Audio Context and Nodes
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        gainNode = audioContext.createGain();
        filterNode = audioContext.createBiquadFilter();

        // Default analyser settings
        analyser.fftSize = 2048; // Good balance for time-domain visualization

        // Connect nodes: Source -> Gain -> Filter -> Analyser -> Destination
        // Source node will be connected dynamically
        gainNode.connect(filterNode);
        filterNode.connect(analyser);
        analyser.connect(audioContext.destination);

        // Set initial values for controls
        gainNode.gain.value = volumeSlider.value;
        filterNode.type = filterTypeSelect.value;
        filterNode.frequency.value = filterFrequencySlider.value;
        filterNode.Q.value = filterQSlider.value;
    }
}

// Function to stop current audio source and clean up
function stopCurrentSource() {
    if (currentSource) {
        if (currentSource.stop) { // AudioBufferSourceNode has stop()
            try {
                currentSource.stop(0);
            } catch (e) {
                // May throw if already stopped or not started. Ignore.
            }
        }
        currentSource.disconnect();
        currentSource = null;
    }
    if (mediaStream) { // Stop microphone stream tracks
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
        micInputBtn.textContent = 'Use Microphone';
        micInputBtn.classList.remove('active');
    }
    playPauseBtn.textContent = 'Play';
    playPauseBtn.disabled = true;
    stopBtn.disabled = true;

    if (audioContext && audioContext.state === 'running') {
        audioContext.suspend(); // Suspend context to save resources when nothing is playing
    }

    // Cancel visualization
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        clearCanvas();
    }
}

// Play AudioBuffer (from file)
function playAudioBuffer(buffer) {
    stopCurrentSource(); // Stop any existing source

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true; // Loop audio files for continuous playback
    source.connect(gainNode); // Connect to the FX chain
    source.start(0);

    currentSource = source;
    playPauseBtn.textContent = 'Pause';
    playPauseBtn.disabled = false;
    stopBtn.disabled = false;

    if (audioContext.state === 'suspended') {
        audioContext.resume(); // Resume if context was suspended by stopCurrentSource
    }
    drawVisualizer();
}

// Handle File Upload
audioFileInput.addEventListener('change', async (event) => {
    initAudio();
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    stopCurrentSource(); // Stop mic if active or previous file

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            audioBuffer = await audioContext.decodeAudioData(e.target.result);
            playAudioBuffer(audioBuffer);
            playPauseBtn.disabled = false;
            stopBtn.disabled = false;
            micInputBtn.classList.remove('active'); // Deactivate mic button styling
            micInputBtn.textContent = 'Use Microphone';
        } catch (error) {
            console.error('Error decoding audio data:', error);
            alert('Error decoding audio file. Please try another one.');
            playPauseBtn.disabled = true;
            stopBtn.disabled = true;
        }
    };
    reader.readAsArrayBuffer(file);
});

// Handle Microphone Input
micInputBtn.addEventListener('click', async () => {
    initAudio();

    if (mediaStream) { // If mic is currently active, stop it
        stopCurrentSource();
        return;
    }

    try {
        stopCurrentSource(); // Stop file playback if active

        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioContext.createMediaStreamSource(mediaStream);
        source.connect(gainNode); // Connect to the FX chain

        currentSource = source;
        playPauseBtn.textContent = 'Playing (Mic)'; // Mic stream is 'playing' continuously
        playPauseBtn.disabled = true; // Can't pause a mic stream directly this way with button
        stopBtn.disabled = false;
        micInputBtn.textContent = 'Mic ON';
        micInputBtn.classList.add('active');
        audioFileInput.value = ''; // Clear file input

        if (audioContext.state === 'suspended') {
            audioContext.resume(); // Resume if context was suspended by stopCurrentSource
        }
        drawVisualizer();

    } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Could not access microphone. Please ensure permissions are granted.');
        playPauseBtn.disabled = true;
        stopBtn.disabled = true;
        micInputBtn.textContent = 'Use Microphone';
        micInputBtn.classList.remove('active');
    }
});

// Play/Pause button for file audio (suspends/resumes context)
playPauseBtn.addEventListener('click', () => {
    if (mediaStream) return; // This button is for file audio only when mic is not active
    if (!audioBuffer) return; 

    if (audioContext.state === 'running') {
        audioContext.suspend();
        playPauseBtn.textContent = 'Play';
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    } else if (audioContext.state === 'suspended') {
        audioContext.resume();
        playPauseBtn.textContent = 'Pause';
        drawVisualizer(); // Restart visualization
    } else if (audioContext.state === 'closed') {
        // If context closed, re-initialize and play
        initAudio();
        playAudioBuffer(audioBuffer);
    }
});

// Stop button
stopBtn.addEventListener('click', () => {
    stopCurrentSource();
    audioBuffer = null; // Clear loaded buffer
    playPauseBtn.textContent = 'Play';
    playPauseBtn.disabled = true;
    stopBtn.disabled = true;
});


// Volume Control
volumeSlider.addEventListener('input', () => {
    if (gainNode) {
        gainNode.gain.value = parseFloat(volumeSlider.value); // Ensure float value
    }
});

// Filter Controls
filterTypeSelect.addEventListener('change', () => {
    if (filterNode) {
        filterNode.type = filterTypeSelect.value;
    }
});

filterFrequencySlider.addEventListener('input', () => {
    if (filterNode) {
        filterNode.frequency.value = parseFloat(filterFrequencySlider.value);
        filterFrequencyValue.textContent = `${filterFrequencySlider.value} Hz`;
    }
});

filterQSlider.addEventListener('input', () => {
    if (filterNode) {
        filterNode.Q.value = parseFloat(filterQSlider.value);
        filterQValue.textContent = filterQSlider.value;
    }
});

// Initial display for filter values
filterFrequencyValue.textContent = `${filterFrequencySlider.value} Hz`;
filterQValue.textContent = filterQSlider.value;


// Audio Visualization
function clearCanvas() {
    canvasCtx.clearRect(0, 0, audioVisualizer.width, audioVisualizer.height);
    canvasCtx.fillStyle = '#111'; // Match canvas background color from CSS
    canvasCtx.fillRect(0, 0, audioVisualizer.width, audioVisualizer.height);
}

function drawVisualizer() {
    if (!analyser || audioContext.state === 'suspended' || audioContext.state === 'closed') {
        return;
    }

    animationFrameId = requestAnimationFrame(drawVisualizer);

    const bufferLength = analyser.fftSize; // or analyser.frequencyBinCount for frequency data
    const dataArray = new Uint8Array(bufferLength); // For time-domain data (waveform)
    analyser.getByteTimeDomainData(dataArray); // Populate with waveform data

    canvasCtx.clearRect(0, 0, audioVisualizer.width, audioVisualizer.height);
    canvasCtx.fillStyle = '#111';
    canvasCtx.fillRect(0, 0, audioVisualizer.width, audioVisualizer.height); // Clear with background

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = '#f1fa8c'; // Yellowish color

    canvasCtx.beginPath();

    const sliceWidth = audioVisualizer.width * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0; // Data is 0-255, normalize to 0-2
        const y = v * audioVisualizer.height / 2; // Scale to canvas height

        if (i === 0) {
            canvasCtx.moveTo(x, y);
        } else {
            canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    canvasCtx.lineTo(audioVisualizer.width, audioVisualizer.height / 2); // Ensure line reaches end
    canvasCtx.stroke();
}

// Initial state for buttons and canvas
playPauseBtn.disabled = true;
stopBtn.disabled = true;
clearCanvas(); // Clear canvas on load
