document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const copyButton = document.getElementById('copyButton');
    const clearButton = document.getElementById('clearButton');
    const finalTranscriptElem = document.getElementById('finalTranscript');
    const interimTranscriptElem = document.getElementById('interimTranscript');
    const statusMessageElem = document.getElementById('statusMessage');

    let recognition;
    let isTranscribing = false;
    let finalTranscriptText = ''; // Stores the accumulated final transcript

    // Check for Web Speech API support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        statusMessageElem.textContent = 'Web Speech API is not supported in this browser. Please use Chrome or Edge.';
        startButton.disabled = true;
        return;
    }

    // Initialize SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening
    recognition.interimResults = true; // Show results while speaking
    recognition.lang = 'en-US'; // Set language

    // Event handlers for SpeechRecognition
    recognition.onstart = () => {
        isTranscribing = true;
        startButton.textContent = 'Stop Transcription';
        startButton.classList.add('stop');
        copyButton.disabled = false;
        clearButton.disabled = false;
        statusMessageElem.textContent = 'Listening... Speak now.';
        finalTranscriptElem.textContent = finalTranscriptText; // Ensure previous text is displayed
    };

    recognition.onresult = (event) => {
        let currentInterim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscriptText += transcript + ' ';
            } else {
                currentInterim += transcript;
            }
        }
        finalTranscriptElem.textContent = finalTranscriptText;
        interimTranscriptElem.textContent = currentInterim;
        // Scroll to bottom if new content is added
        finalTranscriptElem.parentElement.scrollTop = finalTranscriptElem.parentElement.scrollHeight;
    };

    recognition.onerror = (event) => {
        isTranscribing = false;
        startButton.textContent = 'Start Transcription';
        startButton.classList.remove('stop');
        statusMessageElem.textContent = `Error: ${event.error}`;
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
            statusMessageElem.textContent += ' Please allow microphone access.';
        } else if (event.error === 'no-speech') {
            statusMessageElem.textContent = 'No speech detected. Try again.';
        }
        interimTranscriptElem.textContent = ''; // Clear interim text
        // Disable copy/clear if no final text
        if (finalTranscriptText.trim() === '') {
            copyButton.disabled = true;
            clearButton.disabled = true;
        }
    };

    recognition.onend = () => {
        // If onend fires but we were still in transcribing state, it means it stopped unexpectedly
        if (isTranscribing) {
            statusMessageElem.textContent = 'Recognition session ended unexpectedly. Click Start to resume.';
        } else {
            statusMessageElem.textContent = 'Transcription stopped.';
        }
        isTranscribing = false; // Reset state
        startButton.textContent = 'Start Transcription';
        startButton.classList.remove('stop');
        interimTranscriptElem.textContent = ''; // Clear interim text

        // Disable copy/clear if no final text and not transcribing
        if (finalTranscriptText.trim() === '') {
            copyButton.disabled = true;
            clearButton.disabled = true;
        }
    };

    // UI button event listeners
    startButton.addEventListener('click', () => {
        if (isTranscribing) {
            recognition.stop();
        } else {
            try {
                recognition.start();
            } catch (e) {
                console.error('Error starting recognition:', e);
                statusMessageElem.textContent = 'Could not start recognition. Is your microphone connected or are permissions denied?';
                startButton.classList.remove('stop');
                startButton.textContent = 'Start Transcription';
            }
        }
    });

    copyButton.addEventListener('click', () => {
        if (finalTranscriptText.trim() !== '') {
            navigator.clipboard.writeText(finalTranscriptText.trim())
                .then(() => {
                    statusMessageElem.textContent = 'Text copied to clipboard!';
                    setTimeout(() => {
                        statusMessageElem.textContent = isTranscribing ? 'Listening...' : 'Transcription stopped.';
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy text:', err);
                    statusMessageElem.textContent = 'Failed to copy text.';
                });
        }
    });

    clearButton.addEventListener('click', () => {
        finalTranscriptText = '';
        finalTranscriptElem.textContent = '';
        interimTranscriptElem.textContent = '';
        statusMessageElem.textContent = 'Transcription cleared.';
        copyButton.disabled = true;
        clearButton.disabled = true;
        if (isTranscribing) {
            statusMessageElem.textContent = 'Listening... (Transcription cleared)';
        } else {
            statusMessageElem.textContent = 'Click "Start Transcription" to begin.';
        }
    });
});
