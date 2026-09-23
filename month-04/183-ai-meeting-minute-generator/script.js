document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const startRecordingBtn = document.getElementById('startRecording');
    const stopRecordingBtn = document.getElementById('stopRecording');
    const recordingStatus = document.getElementById('recordingStatus');
    const liveTranscriptPreview = document.getElementById('liveTranscriptPreview');
    const audioFileUpload = document.getElementById('audioFileUpload');
    const uploadAndProcessBtn = document.getElementById('uploadAndProcess');
    const transcriptionOutput = document.getElementById('transcriptionOutput');
    const summaryOutput = document.getElementById('summaryOutput');
    const loadingIndicator = document.getElementById('loadingIndicator');

    let recognition; // Web Speech API Recognition object
    let finalTranscript = '';
    let isRecording = false;

    // --- Web Speech API (Live Audio) ---
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true; // Get real-time interim results
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            isRecording = true;
            recordingStatus.textContent = 'Recording...';
            recordingStatus.classList.add('recording');
            startRecordingBtn.disabled = true;
            stopRecordingBtn.disabled = false;
            liveTranscriptPreview.textContent = ''; // Clear previous preview
            console.log('Speech recognition started');
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript + ' ';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            liveTranscriptPreview.textContent = finalTranscript + interimTranscript;
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            recordingStatus.textContent = `Error: ${event.error}`;
            recordingStatus.classList.remove('recording');
            startRecordingBtn.disabled = false;
            stopRecordingBtn.disabled = true;
            isRecording = false;
        };

        recognition.onend = () => {
            console.log('Speech recognition ended');
            isRecording = false;
            recordingStatus.textContent = 'Idle';
            recordingStatus.classList.remove('recording');
            startRecordingBtn.disabled = false;
            stopRecordingBtn.disabled = true;
            processTranscription(finalTranscript);
            finalTranscript = ''; // Reset for next recording
        };

        startRecordingBtn.addEventListener('click', () => {
            transcriptionOutput.textContent = '';
            summaryOutput.textContent = '';
            finalTranscript = ''; // Ensure finalTranscript is clear
            recognition.start();
        });

        stopRecordingBtn.addEventListener('click', () => {
            recognition.stop();
        });

    } else {
        startRecordingBtn.disabled = true;
        stopRecordingBtn.disabled = true;
        recordingStatus.textContent = 'Speech Recognition not supported in this browser.';
        recordingStatus.style.color = 'red';
    }

    // --- File Upload Handling ---
    audioFileUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            uploadAndProcessBtn.disabled = false;
        } else {
            uploadAndProcessBtn.disabled = true;
        }
    });

    uploadAndProcessBtn.addEventListener('click', () => {
        const file = audioFileUpload.files[0];
        if (!file) return;

        transcriptionOutput.textContent = '';
        summaryOutput.textContent = '';
        loadingIndicator.style.display = 'block';
        uploadAndProcessBtn.disabled = true; // Disable button during processing

        const reader = new FileReader();
        reader.onload = (e) => {
            let fileContent = e.target.result;
            let simulatedTranscription = '';

            if (file.type.startsWith('audio/')) {
                // Simulate audio transcription for actual audio files
                simulatedTranscription = `[Simulated Audio Transcription for ${file.name}]
                Welcome to the quarterly project review meeting. Today, we'll discuss the progress on Project Alpha, review budget allocations, and identify next steps for Phase 2. The team has done an excellent job, and we're currently on track. However, we've identified a potential risk regarding the third-party API integration. John, could you provide an update on the API status? We need to make a decision on whether to proceed with the current vendor or explore alternatives. Mary, please take an action item to research alternative vendors and present your findings by next Tuesday. The main goal for this quarter is to complete the core development. We will reconvene next Friday to review the updated plan.`;
            } else if (file.type === 'text/plain') {
                // Use actual content for text files
                simulatedTranscription = `[Transcription from Text File: ${file.name}]
                ${fileContent}`;
            } else {
                // Fallback for other file types
                simulatedTranscription = `[Simulated Transcription for ${file.name} (Unsupported file type)]
                This is a generic simulated transcription. For a real application, this would be processed by a backend service. Key discussion points included project scope, resource allocation, and a new marketing strategy. A decision was made to postpone the launch by two weeks. Action item for the marketing team: update the launch calendar.`;
            }

            // Simulate a network delay for AI processing
            setTimeout(() => {
                processTranscription(simulatedTranscription);
                uploadAndProcessBtn.disabled = false;
                audioFileUpload.value = null; // Clear file input
            }, 2000); // 2-second delay
        };

        reader.onerror = () => {
            loadingIndicator.style.display = 'none';
            transcriptionOutput.textContent = 'Error reading file.';
            uploadAndProcessBtn.disabled = false;
        };

        // For audio files, we don't need to read content on client-side
        // We just trigger the simulated transcription directly by calling onload.
        // For text files, we read the content first.
        if (file.type === 'text/plain') {
            reader.readAsText(file);
        } else {
            reader.onload(); // Manually trigger onload to proceed with simulation
        }
    });

    // --- Core Processing (Simulated AI) ---
    function processTranscription(text) {
        loadingIndicator.style.display = 'block';
        transcriptionOutput.textContent = text.trim() || 'No transcription available.';

        // Simulate AI summarization with a delay
        setTimeout(() => {
            const summary = summarizeText(text);
            summaryOutput.textContent = summary.trim() || 'No summary could be generated.';
            loadingIndicator.style.display = 'none';
        }, 1500); // Simulate AI processing time
    }

    function summarizeText(text) {
        // --- This is a SIMULATED AI summarization. --- 
        // In a real application, this would involve sending the transcription
        // to a backend service with Natural Language Processing (NLP) capabilities,
        // e.g., using OpenAI GPT, Google Cloud NLP, or a custom ML model.
        // The 'React' concept mentioned in the prompt would typically be used
        // for building the frontend UI components and managing application state
        // when interacting with such backend APIs in a more complex application.

        if (!text || text.length < 50) {
            return "Not enough content to generate a meaningful summary.";
        }

        const sentences = text.match(/[^.!?]+[.!?]*/g) || [];
        let keyPoints = [];

        const keywords = [
            "action item", "decision", "next steps", "goal", "problem", 
            "risk", "update", "plan", "review", "agreement"
        ];

        // Extract sentences containing key keywords
        sentences.forEach(sentence => {
            const lowerSentence = sentence.toLowerCase();
            if (keywords.some(keyword => lowerSentence.includes(keyword))) {
                keyPoints.push(sentence.trim());
            }
        });

        // If few key points, take first 2-3 sentences and last 1-2 sentences as a fallback
        if (keyPoints.length < 3 && sentences.length > 5) {
            keyPoints = [
                sentences[0].trim(),
                sentences[1] ? sentences[1].trim() : '',
                '...' + (sentences[sentences.length - 2] ? sentences[sentences.length - 2].trim() : ''),
                sentences[sentences.length - 1].trim()
            ].filter(s => s !== '' && s !== '...');
        }
        
        // Ensure unique points and limit length for conciseness
        keyPoints = Array.from(new Set(keyPoints)).slice(0, 5); // Max 5 unique key points

        if (keyPoints.length === 0) {
            return "No specific key points identified, but the discussion covered general meeting topics.";
        }

        return "Key AI-Identified Summary Points:\n" + keyPoints.map(point => `- ${point}`).join('\n');
    }

    // Initial state setup
    uploadAndProcessBtn.disabled = true;
});
