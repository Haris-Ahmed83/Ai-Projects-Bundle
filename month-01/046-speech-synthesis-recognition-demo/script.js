document.addEventListener('DOMContentLoaded', () => {
    // --- Speech Synthesis Elements ---
    const textToSpeakInput = document.getElementById('text-to-speak');
    const voiceSelect = document.getElementById('voice-select');
    const pitchInput = document.getElementById('pitch');
    const pitchValueSpan = document.getElementById('pitch-value');
    const rateInput = document.getElementById('rate');
    const rateValueSpan = document.getElementById('rate-value');
    const speakButton = document.getElementById('speak-button');
    const stopSynthesisButton = document.getElementById('stop-synthesis-button');

    // --- Speech Recognition Elements ---
    const startRecognitionButton = document.getElementById('start-recognition-button');
    const stopRecognitionButton = document.getElementById('stop-recognition-button');
    const recognitionResult = document.getElementById('recognition-result');
    const recognitionWarning = document.getElementById('recognition-warning');

    const synth = window.speechSynthesis;
    let voices = [];

    // --- Speech Synthesis Functions ---

    function populateVoiceList() {
        voices = synth.getVoices().sort((a, b) => a.name.localeCompare(b.name));
        voiceSelect.innerHTML = ''; // Clear previous options

        if (voices.length === 0) {
            const option = document.createElement('option');
            option.textContent = 'No voices available';
            voiceSelect.appendChild(option);
            speakButton.disabled = true;
            return;
        }

        for (const voice of voices) {
            const option = document.createElement('option');
            option.textContent = `${voice.name} (${voice.lang})`;
            option.setAttribute('data-lang', voice.lang);
            option.setAttribute('data-name', voice.name);
            voiceSelect.appendChild(option);
        }

        // Set a default voice if available (e.g., an English voice)
        const defaultVoice = voices.find(v => v.lang.startsWith('en-') && v.default) || voices.find(v => v.lang.startsWith('en-'));
        if (defaultVoice) {
            voiceSelect.value = `${defaultVoice.name} (${defaultVoice.lang})`;
        }
    }

    // Event listener for when voices change (they might load asynchronously)
    synth.onvoiceschanged = populateVoiceList;

    // Populate voices immediately if they are already loaded
    if (synth.getVoices().length > 0) {
        populateVoiceList();
    }

    function speakText() {
        if (synth.speaking) {
            console.log('Already speaking...');
            return;
        }

        if (textToSpeakInput.value.trim() === '') {
            alert('Please enter text to speak.');
            return;
        }

        const utterance = new SpeechSynthesisUtterance(textToSpeakInput.value);

        const selectedOption = voiceSelect.selectedOptions[0];
        if (selectedOption && selectedOption.dataset.name) {
            utterance.voice = voices.find(voice => voice.name === selectedOption.dataset.name);
        }

        utterance.pitch = parseFloat(pitchInput.value);
        utterance.rate = parseFloat(rateInput.value);

        utterance.onstart = () => {
            speakButton.disabled = true;
            stopSynthesisButton.disabled = false;
        };

        utterance.onend = () => {
            speakButton.disabled = false;
            stopSynthesisButton.disabled = true;
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            speakButton.disabled = false;
            stopSynthesisButton.disabled = true;
            alert('Speech synthesis error: ' + event.error);
        };

        synth.speak(utterance);
    }

    function stopSpeaking() {
        if (synth.speaking) {
            synth.cancel();
        }
        speakButton.disabled = false;
        stopSynthesisButton.disabled = true;
    }

    // Update pitch/rate value displays
    pitchInput.addEventListener('input', () => {
        pitchValueSpan.textContent = pitchInput.value;
    });

    rateInput.addEventListener('input', () => {
        rateValueSpan.textContent = rateInput.value;
    });

    // Synthesis event listeners
    speakButton.addEventListener('click', speakText);
    stopSynthesisButton.addEventListener('click', stopSpeaking);
    stopSynthesisButton.disabled = true; // Initially disabled

    // --- Speech Recognition Functions ---

    // Check for browser compatibility
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    let recognition;
    let recognizing = false;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true; // Keep listening
        recognition.interimResults = true; // Show results as they come in
        recognition.lang = 'en-US'; // Set default language

        recognition.onstart = () => {
            recognizing = true;
            startRecognitionButton.textContent = 'Listening...';
            startRecognitionButton.disabled = true;
            stopRecognitionButton.disabled = false;
            recognitionResult.textContent = 'Say something...';
            recognitionWarning.textContent = ''; // Clear any previous warning
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            recognitionResult.textContent = finalTranscript + interimTranscript; // Display both
        };

        recognition.onerror = (event) => {
            recognizing = false;
            startRecognitionButton.textContent = 'Start Listening';
            startRecognitionButton.disabled = false;
            stopRecognitionButton.disabled = true;
            console.error('Speech recognition error:', event.error);
            recognitionWarning.textContent = `Error: ${event.error}. Please ensure microphone access and try again.`;
            if (event.error === 'no-speech') {
                recognitionWarning.textContent = 'No speech detected. Please try again.';
            } else if (event.error === 'not-allowed') {
                recognitionWarning.textContent = 'Microphone access denied. Please allow microphone in browser settings.';
            } else if (event.error === 'network') {
                recognitionWarning.textContent = 'Network error during recognition. Please check your connection.';
            }
        };

        recognition.onend = () => {
            recognizing = false;
            startRecognitionButton.textContent = 'Start Listening';
            startRecognitionButton.disabled = false;
            stopRecognitionButton.disabled = true;
            if (recognitionResult.textContent === 'Say something...') {
                recognitionResult.textContent = 'No speech was recognized.';
            }
        };

        startRecognitionButton.addEventListener('click', () => {
            if (!recognizing) {
                recognition.start();
            }
        });

        stopRecognitionButton.addEventListener('click', () => {
            if (recognizing) {
                recognition.stop();
            }
        });

    } else {
        startRecognitionButton.disabled = true;
        stopRecognitionButton.disabled = true;
        recognitionWarning.textContent = 'Speech Recognition not supported in this browser. Try Chrome or Edge.';
        recognitionResult.textContent = 'Browser does not support Speech Recognition.';
    }
});
