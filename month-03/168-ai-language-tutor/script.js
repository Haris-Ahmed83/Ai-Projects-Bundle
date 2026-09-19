document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('userInput');
    const targetLanguage = document.getElementById('targetLanguage');
    const submitTextBtn = document.getElementById('submitText');
    const speechInputBtn = document.getElementById('speechInputBtn'); // Disabled in HTML
    const aiResponseDiv = document.getElementById('aiResponse');
    const loadingIndicator = document.getElementById('loadingIndicator');

    // --- Core AI Simulation Logic ---
    function getMockAIResponse(text, language) {
        text = text.trim();
        if (!text) {
            return "Please type something for me to provide feedback on!";
        }

        let response = `In ${language.charAt(0).toUpperCase() + language.slice(1)}: `;

        // Simple mock NLP/correction logic
        if (language === 'english') {
            if (text.toLowerCase().includes('i is')) {
                response += `You wrote: "${text}". A common mistake! Remember, for "I", we use "am". So, "${text.replace(/i is/i, 'I am')}" would be more correct. Great effort!`;
            } else if (text.toLowerCase().includes('he are') || text.toLowerCase().includes('she are') || text.toLowerCase().includes('it are')) {
                response += `You wrote: "${text}". Be careful with subject-verb agreement! For "he/she/it", we use "is". For example, "He is happy." Keep practicing!`;
            } else if (text.toLowerCase().includes('go to home')) {
                response += `You wrote: "${text}". In English, we usually say "go home" (without 'to'). "Go to the house" is also correct. English prepositions can be tricky!`;
            } else if (text.toLowerCase().startsWith('hello')) {
                response += `You said "${text}". Excellent start! That's a perfect greeting. How else can I help you practice today?`;
            } else {
                response += `You wrote: "${text}". That's a good sentence! Perhaps you could try describing your day, or asking a question? I'm here to help you improve your ${language} skills.`;
            }
        } else if (language === 'spanish') {
            if (text.toLowerCase().includes('yo soy bien')) {
                response += `You wrote: "${text}". Close! "Yo soy bien" literally means "I am well" but "estar" is used for temporary states like "being well". So, "Yo estoy bien" is correct. ¡Buen intento! (Good try!)`;
            } else if (text.toLowerCase().includes('tu es')) {
                response += `You wrote: "${text}". Remember, for "tú" (you - singular informal), the verb "ser" (to be) conjugates as "eres". So, "Tú eres..." is correct. ¡Sigue practicando! (Keep practicing!)`;
            } else if (text.toLowerCase().includes('yo tener')) {
                response += `You wrote: "${text}". "Tener" (to have) for "yo" (I) is "tengo". So, "Yo tengo..." is correct. ¡Muy bien! (Very good!)`;
            } else if (text.toLowerCase().startsWith('hola')) {
                response += `You said "${text}". ¡Hola! That's a perfect Spanish greeting. What else would you like to practice?`;
            } else {
                response += `You wrote: "${text}". ¡Excelente! That's a well-formed sentence in Spanish. Try practicing with different verb conjugations next!`;
            }
        } else if (language === 'french') {
            if (text.toLowerCase().includes('je suis bon')) {
                response += `You wrote: "${text}". "Je suis bon" can mean "I am good" but often implies "I am good at something". For "I am well/fine", you usually say "Je vais bien." C'est un bon début ! (It's a good start!)`;
            } else if (text.toLowerCase().includes('tu est')) {
                response += `You wrote: "${text}". For "tu" (you - singular informal), the verb "être" (to be) conjugates as "es". So, "Tu es..." is correct. Continuez à pratiquer ! (Keep practicing!)`;
            } else if (text.toLowerCase().includes('je avoir')) {
                response += `You wrote: "${text}". "Avoir" (to have) for "je" (I) is "j'ai". So, "J'ai..." is correct. Bravo ! (Well done!)`;
            } else if (text.toLowerCase().startsWith('bonjour')) {
                response += `You said "${text}". Bonjour ! That's a perfect French greeting. Comment puis-je vous aider à pratiquer davantage ? (How can I help you practice more?)`;
            } else {
                response += `You wrote: "${text}". Magnifique ! That's a great sentence in French. Try forming a question or describing an object next.`;
            }
        } else {
            response += `I don't have specific rules for ${language} yet, but you wrote: "${text}". Keep up the great work learning new languages!`;
        }

        return response;
    }

    // --- Event Handlers ---
    submitTextBtn.addEventListener('click', () => {
        const text = userInput.value;
        const language = targetLanguage.value;

        // Show loading, clear previous response
        aiResponseDiv.innerHTML = '';
        loadingIndicator.classList.remove('hidden');
        submitTextBtn.disabled = true; // Prevent multiple submissions

        // Simulate API call delay
        setTimeout(() => {
            const aiFeedback = getMockAIResponse(text, language);
            aiResponseDiv.innerHTML = `<p>${aiFeedback}</p>`;
            loadingIndicator.classList.add('hidden');
            submitTextBtn.disabled = false;
        }, 1500); // Simulate 1.5 seconds of AI processing
    });

    // Placeholder for Speech Recognition (requires browser permissions and more complex logic)
    speechInputBtn.addEventListener('click', () => {
        alert("Speech input is a work in progress! Please use text input for now.");
        console.log("Speech input button clicked, but functionality is disabled for this demo.");
        // A real implementation would involve:
        // const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        // const recognition = new SpeechRecognition();
        // recognition.lang = targetLanguage.value === 'english' ? 'en-US' : (targetLanguage.value === 'spanish' ? 'es-ES' : 'fr-FR');
        // recognition.interimResults = false;
        // recognition.maxAlternatives = 1;
        // recognition.start();
        // recognition.onresult = (event) => {
        //     const speechResult = event.results[0][0].transcript;
        //     userInput.value = speechResult;
        //     submitTextBtn.click(); // Automatically submit transcribed speech
        // };
        // recognition.onerror = (event) => {
        //     console.error('Speech recognition error:', event.error);
        //     aiResponseDiv.innerHTML = `<p class="error">Speech recognition failed: ${event.error}</p>`;
        // };
    });

    // Initial message on load
    aiResponseDiv.innerHTML = `<p>Your AI tutor is ready! Type something in the box above and click "Get AI Feedback" to start.</p>`;
});
