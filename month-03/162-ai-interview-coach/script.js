document.addEventListener('DOMContentLoaded', () => {
    const aiQuestionDiv = document.getElementById('ai-question');
    const userTranscriptDiv = document.getElementById('user-transcript');
    const aiFeedbackDiv = document.getElementById('ai-feedback');
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const recordingIndicator = document.getElementById('recording-indicator');

    let recognition; // Will hold the SpeechRecognition object
    let interviewActive = false;
    let currentQuestionIndex = 0;
    let currentTranscript = '';

    const interviewQuestions = [
        "Tell me about yourself and why you're interested in this role.",
        "What are your greatest strengths and weaknesses?",
        "Can you describe a challenging situation you faced at work and how you handled it?",
        "Where do you see yourself in five years?",
        "Why do you want to work for our company?",
        "Do you have any questions for me?"
    ];

    // --- Speech Recognition Setup ---
    if (!('webkitSpeechRecognition' in window)) {
        aiQuestionDiv.textContent = "Speech Recognition is not supported in your browser. Please use Chrome for best experience.";
        startBtn.disabled = true;
        return;
    }

    recognition = new webkitSpeechRecognition();
    recognition.continuous = false; // Listen for one phrase at a time
    recognition.interimResults = true; // Show results while user is speaking
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        recordingIndicator.classList.add('active');
        userTranscriptDiv.textContent = 'Listening...';
        startBtn.disabled = true;
        stopBtn.disabled = false;
        console.log('Speech recognition started');
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        currentTranscript = finalTranscript; // Store final transcript
        userTranscriptDiv.textContent = finalTranscript || interimTranscript;
    };

    recognition.onend = () => {
        recordingIndicator.classList.remove('active');
        console.log('Speech recognition ended');

        if (interviewActive) {
            if (currentTranscript.trim() === '') {
                aiFeedbackDiv.textContent = "It seems you didn't provide a response. Remember to speak clearly and try again.";
            } else {
                // Process the answer and provide feedback
                const feedback = generateFeedback(interviewQuestions[currentQuestionIndex], currentTranscript);
                aiFeedbackDiv.textContent = feedback;
            }
            userTranscriptDiv.textContent = currentTranscript || "No response detected.";
            currentTranscript = ''; // Reset for next answer

            // Move to next question or end interview
            currentQuestionIndex++;
            if (currentQuestionIndex < interviewQuestions.length) {
                aiQuestionDiv.textContent = interviewQuestions[currentQuestionIndex];
                setTimeout(() => {
                    if (interviewActive) {
                        recognition.start();
                    }
                }, 1000); // Give a small pause before listening for next question
            } else {
                endInterview();
            }
        } else {
            // If interview was manually stopped, don't restart recognition
            userTranscriptDiv.textContent = "";
            aiQuestionDiv.textContent = "Interview has ended. Click 'Start Interview' to practice again.";
            aiFeedbackDiv.textContent = "Interview concluded. Good job!";
            startBtn.disabled = false;
            stopBtn.disabled = true;
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        recordingIndicator.classList.remove('active');
        if (interviewActive) {
            aiFeedbackDiv.textContent = `Error during speech recognition: ${event.error}. Please try again.`;
            // Attempt to restart if it's not a 'no-speech' error and interview is active
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                setTimeout(() => {
                    if (interviewActive) recognition.start();
                }, 500);
            } else if (event.error === 'no-speech') {
                 // If no speech detected, provide feedback and proceed
                aiFeedbackDiv.textContent = "No speech detected. Please speak clearly after the question.";
                // Manually trigger next question logic if 'no-speech' and interview is active
                currentQuestionIndex++;
                if (currentQuestionIndex < interviewQuestions.length) {
                    aiQuestionDiv.textContent = interviewQuestions[currentQuestionIndex];
                    setTimeout(() => { if (interviewActive) recognition.start(); }, 1000);
                } else {
                    endInterview();
                }
            } else if (event.error === 'not-allowed') {
                 aiQuestionDiv.textContent = "Microphone access denied. Please allow microphone access in your browser settings to use the AI Interview Coach.";
                 endInterview(false); // End interview without prompting next question
            }
        }
        startBtn.disabled = false;
        stopBtn.disabled = true;
    };

    // --- Interview Control Functions ---
    function startInterview() {
        interviewActive = true;
        currentQuestionIndex = 0;
        currentTranscript = '';
        aiQuestionDiv.textContent = interviewQuestions[currentQuestionIndex];
        userTranscriptDiv.textContent = '';
        aiFeedbackDiv.textContent = 'Listen to the question and speak your answer.';
        startBtn.disabled = true;
        stopBtn.disabled = false;
        try {
            recognition.start();
        } catch (e) {
            console.error("Recognition start failed: ", e);
            aiFeedbackDiv.textContent = "Could not start microphone. Please ensure your microphone is connected and allowed.";
            endInterview(false);
        }
    }

    function endInterview(displayMessage = true) {
        interviewActive = false;
        recognition.stop(); // This will trigger onend event
        if (displayMessage) {
            aiQuestionDiv.textContent = "Interview has ended. Click 'Start Interview' to practice again.";
            aiFeedbackDiv.textContent = "Interview concluded. Good job!";
        }
        userTranscriptDiv.textContent = "";
        startBtn.disabled = false;
        stopBtn.disabled = true;
    }

    // --- AI Feedback Logic (Simulated) ---
    function generateFeedback(question, transcript) {
        if (!transcript || transcript.trim() === '') {
            return "It seems you didn't provide a response. Remember to speak clearly.";
        }

        const feedbacks = [
            "Excellent point! Consider adding a specific example to strengthen your answer.",
            "Your response was clear and concise. Next time, try to elaborate a bit more on your experience.",
            "Good job addressing the question. Think about how you can tie this back to the specific role you're applying for.",
            "That's a solid start. Can you think of a time when you demonstrated this skill?",
            "You've covered the basics well. To make your answer stand out, focus on the impact of your actions.",
            "Try to articulate your thoughts more directly. Practice structuring your answers.",
            "Your confidence came through! Keep practicing your delivery.",
            "Make sure to maintain good posture and 'eye contact' (with your camera) to show engagement.",
            "Consider pausing briefly before answering to collect your thoughts.",
            "Great energy! Ensure your answers directly address the core of the question."
        ];

        let specificFeedback = '';
        const words = transcript.toLowerCase().split(/\s+/);

        // Very basic keyword analysis for content feedback
        if (question.includes("strengths and weaknesses") && !words.some(word => ['strength', 'weakness'].includes(word))) {
            specificFeedback += "Make sure to clearly identify both a strength and a weakness in your answer. ";
        } else if (question.includes("challenging situation") && !words.some(word => ['situation', 'challenge', 'problem'].includes(word))) {
            specificFeedback += "Ensure you describe a specific situation, task, action, and result (STAR method). ";
        }

        // Length-based feedback
        if (words.length < 15) {
            specificFeedback += "Your answer was a bit brief. Try to provide more detail and context. ";
        } else if (words.length > 70) {
            specificFeedback += "Your answer was quite detailed. Practice being more concise while still conveying your main points. ";
        }

        // Combine with a random general feedback
        const generalFeedback = feedbacks[Math.floor(Math.random() * feedbacks.length)];
        return (specificFeedback || "") + generalFeedback;
    }

    // --- Event Listeners ---
    startBtn.addEventListener('click', startInterview);
    stopBtn.addEventListener('click', () => endInterview(true));

    // Initial state setup
    stopBtn.disabled = true;
});
