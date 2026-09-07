document.addEventListener('DOMContentLoaded', () => {
    const chatHistory = document.getElementById('chat-history');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const journalEntry = document.getElementById('journal-entry');
    const saveJournalBtn = document.getElementById('save-journal-btn');
    const journalFeedback = document.getElementById('journal-feedback');

    // --- Chat functionality --- 

    const botResponses = {
        greeting: [
            "Hello! I'm your AI Mood Companion. How are you feeling today?",
            "Hi there! What's on your mind? Share how you're doing.",
            "Welcome! I'm here to listen. How are you genuinely feeling today?"
        ],
        mood_acknowledgement: [
            "Thanks for sharing that. It's perfectly okay to feel [mood]. Would you like to explore why you're feeling this way, or would you prefer a mindfulness exercise?",
            "I hear you. [mood] is a valid feeling. Sometimes just acknowledging it can help. What's one thing that might make you feel a little better?",
            "It sounds like you're feeling [mood]. Remember, all feelings are temporary and provide valuable information. Is there anything specific contributing to this?",
            "Thank you for your honesty. When you're feeling [mood], it's important to be kind to yourself. Perhaps we could try a short breathing exercise?"
        ],
        mindfulness_prompt: [
            "Let's try a simple breathing exercise. Inhale slowly for 4 counts, hold for 4, exhale for 6. Repeat a few times. How do you feel after?",
            "Take a moment to notice 5 things you can see, 4 things you can hear, 3 things you can feel, 2 things you can smell, and 1 thing you can taste. What did you notice?",
            "Find a comfortable position. Gently close your eyes or soften your gaze. Bring your attention to the sensations of your breath. Just observe without judgment. Do this for a minute. What was that like?",
            "Consider one thing you are grateful for today, no matter how small. How does thinking about it make you feel?"
        ],
        journal_suggestion: [
            "That's a great thought for your journal! The journal section is just below. Feel free to elaborate there.",
            "Would you like to write about that in your private journal? It's a great space to explore deeper thoughts.",
            "That sounds like a good topic for reflection. You can use the journal area below to write more about it."
        ],
        general_response: [
            "I understand. What else is on your mind?",
            "Thank you for sharing. Is there anything else you'd like to discuss?",
            "Okay. How about we try a mindfulness prompt, or would you like to just chat?",
            "That's interesting. Tell me more, or ask me for a different kind of prompt."
        ]
    };

    const moodKeywords = ['happy', 'sad', 'anxious', 'stressed', 'great', 'good', 'bad', 'tired', 'frustrated', 'calm', 'peaceful', 'overwhelmed'];
    const mindfulnessKeywords = ['mindfulness', 'breathe', 'exercise', 'meditate', 'calm me', 'relax', 'focus'];
    const journalKeywords = ['journal', 'write', 'entry', 'reflect'];

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        messageDiv.textContent = text;
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight; // Auto-scroll to bottom
    }

    function getBotResponse(userMessage) {
        userMessage = userMessage.toLowerCase();

        // Check for specific mood keywords
        for (const keyword of moodKeywords) {
            if (userMessage.includes(keyword)) {
                return botResponses.mood_acknowledgement[Math.floor(Math.random() * botResponses.mood_acknowledgement.length)].replace('[mood]', keyword);
            }
        }

        // Check for mindfulness keywords
        for (const keyword of mindfulnessKeywords) {
            if (userMessage.includes(keyword)) {
                return botResponses.mindfulness_prompt[Math.floor(Math.random() * botResponses.mindfulness_prompt.length)];
            }
        }

        // Check for journal keywords
        for (const keyword of journalKeywords) {
            if (userMessage.includes(keyword)) {
                return botResponses.journal_suggestion[Math.floor(Math.random() * botResponses.journal_suggestion.length)];
            }
        }

        // Default general responses
        return botResponses.general_response[Math.floor(Math.random() * botResponses.general_response.length)];
    }

    function sendMessage() {
        const messageText = userInput.value.trim();
        if (messageText === '') return;

        addMessage(messageText, 'user');
        userInput.value = '';

        // Simulate AI typing delay
        setTimeout(() => {
            const botResponse = getBotResponse(messageText);
            addMessage(botResponse, 'bot');
            saveChatHistory();
        }, 800);
    }

    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // --- Local Storage for Chat History --- 
    function saveChatHistory() {
        localStorage.setItem('chatHistory', chatHistory.innerHTML);
    }

    function loadChatHistory() {
        const savedChat = localStorage.getItem('chatHistory');
        if (savedChat) {
            chatHistory.innerHTML = savedChat;
            chatHistory.scrollTop = chatHistory.scrollHeight;
        } else {
            // Initial bot message if no history
            addMessage(botResponses.greeting[Math.floor(Math.random() * botResponses.greeting.length)], 'bot');
        }
    }

    // --- Journal functionality --- 
    function saveJournalEntry() {
        localStorage.setItem('journalEntry', journalEntry.value);
        journalFeedback.textContent = 'Journal saved successfully!';
        setTimeout(() => {
            journalFeedback.textContent = '';
        }, 3000);
    }

    function loadJournalEntry() {
        const savedEntry = localStorage.getItem('journalEntry');
        if (savedEntry) {
            journalEntry.value = savedEntry;
        }
    }

    saveJournalBtn.addEventListener('click', saveJournalEntry);

    // --- Initialize on load --- 
    loadChatHistory();
    loadJournalEntry();
});
