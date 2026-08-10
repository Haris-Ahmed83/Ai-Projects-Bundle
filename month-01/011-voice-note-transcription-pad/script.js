document.addEventListener('DOMContentLoaded', () => {
    const recordButton = document.getElementById('recordButton');
    const currentTranscription = document.getElementById('currentTranscription');
    const notesList = document.getElementById('notesList');
    const clearNotesButton = document.getElementById('clearNotesButton');
    const statusMessage = document.getElementById('statusMessage');

    let isRecording = false;
    let notes = [];

    // Check for Web Speech API compatibility
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        updateStatus('Web Speech API is not supported in this browser. Please use Chrome or Edge.', true);
        recordButton.disabled = true;
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening
    recognition.interimResults = true; // Get partial results
    recognition.lang = 'en-US'; // Set language

    // --- Helper Functions ---
    function updateStatus(message, isError = false) {
        statusMessage.textContent = message;
        if (isError) {
            statusMessage.classList.add('error');
        } else {
            statusMessage.classList.remove('error');
        }
    }

    function saveNotes() {
        localStorage.setItem('voiceNotes', JSON.stringify(notes));
    }

    function loadNotes() {
        const storedNotes = localStorage.getItem('voiceNotes');
        if (storedNotes) {
            notes = JSON.parse(storedNotes);
        }
        displayNotes();
    }

    function displayNotes() {
        notesList.innerHTML = ''; // Clear existing notes
        if (notes.length === 0) {
            notesList.innerHTML = '<p style="text-align: center; color: #777;">No notes saved yet.</p>';
            clearNotesButton.disabled = true;
            return;
        }

        clearNotesButton.disabled = false;
        // Display notes in reverse chronological order (newest first)
        notes.slice().reverse().forEach((note) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <p>${note.text}</p>
                <span class="note-timestamp">${new Date(note.timestamp).toLocaleString()}</span>
            `;
            notesList.appendChild(listItem); 
        });
    }

    // --- Speech Recognition Event Handlers ---
    recognition.onstart = () => {
        isRecording = true;
        recordButton.textContent = 'Stop Recording';
        recordButton.style.backgroundColor = '#e74c3c';
        updateStatus('Listening... Speak now.');
        currentTranscription.textContent = ''; // Clear previous interim text
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript; // Accumulate final transcripts
            } else {
                interimTranscript += transcript;
            }
        }

        currentTranscription.textContent = interimTranscript;

        if (finalTranscript) {
            const newNote = {
                text: finalTranscript.trim(),
                timestamp: Date.now()
            };
            notes.push(newNote);
            saveNotes();
            displayNotes();
            currentTranscription.textContent = ''; // Clear current transcription area after final result
            updateStatus('Note transcribed! Listening...'); // Keep status as listening
        }
    };

    recognition.onerror = (event) => {
        let errorMessage = 'Speech recognition error: ';
        switch (event.error) {
            case 'no-speech':
                errorMessage += 'No speech detected. Please try again.';
                break;
            case 'not-allowed':
                errorMessage += 'Microphone access denied. Please allow microphone access in your browser settings.';
                break;
            case 'aborted':
                errorMessage += 'Speech recognition aborted.';
                break;
            case 'audio-capture':
                errorMessage += 'No microphone found or access denied.';
                break;
            case 'network':
                errorMessage += 'Network error. Please check your internet connection.';
                break;
            default:
                errorMessage += event.error;
        }
        updateStatus(errorMessage, true);
        isRecording = false; // Ensure recording state is reset on error
        recordButton.textContent = 'Start Recording';
        recordButton.style.backgroundColor = '#2ecc71';
    };

    recognition.onend = () => {
        if (isRecording) { // If it ended but we still intended to record (e.g., due to browser timeout)
            // The browser might stop listening after a period of silence or API limits.
            // We'll reset the UI, but the user will have to manually restart.
            isRecording = false;
            recordButton.textContent = 'Start Recording';
            recordButton.style.backgroundColor = '#2ecc71';
            updateStatus('Recording stopped automatically (e.g., due to silence). Click "Start Recording" to begin again.');
        } else {
            // User explicitly stopped it
            updateStatus('Recording stopped. Click "Start Recording" to begin again.');
        }
    };

    // --- Button Event Listeners ---
    recordButton.addEventListener('click', () => {
        if (isRecording) {
            recognition.stop();
            // onend will handle the final UI update
        } else {
            try {
                recognition.start();
            } catch (error) {
                // This can happen if recognition is already active, though onend should prevent most cases.
                // Or if there's a problem starting the service.
                updateStatus('Failed to start recognition: ' + error.message, true);
                isRecording = false; // Reset state
                recordButton.textContent = 'Start Recording';
                recordButton.style.backgroundColor = '#2ecc71';
            }
        }
    });

    clearNotesButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all saved notes? This action cannot be undone.')) {
            notes = [];
            saveNotes();
            displayNotes();
            updateStatus('All notes cleared.');
        }
    });

    // --- Initial Load ---
    loadNotes();
});
