document.addEventListener('DOMContentLoaded', () => {
    const journalEntryTextarea = document.getElementById('journalEntry');
    const submitEntryButton = document.getElementById('submitEntry');
    const pastEntriesList = document.getElementById('pastEntriesList');
    const noEntriesMessage = pastEntriesList.querySelector('.no-entries-message');

    const aiSentimentDiv = document.getElementById('aiSentiment');
    const aiThemesDiv = document.getElementById('aiThemes');
    const aiTrendsDiv = document.getElementById('aiTrends');
    const aiPromptsDiv = document.getElementById('aiPrompts');

    let journalEntries = [];

    // --- AI Simulation Data ---
    const positiveWords = ['happy', 'joy', 'good', 'great', 'love', 'excited', 'positive', 'fantastic', 'amazing', 'grateful', 'blessed', 'optimistic', 'hopeful', 'success'];
    const negativeWords = ['sad', 'bad', 'stress', 'anxious', 'worried', 'frustrated', 'difficult', 'tired', 'down', 'struggle', 'lonely', 'angry', 'upset', 'fail'];

    const themeKeywords = {
        'Work & Career': ['job', 'work', 'office', 'project', 'colleagues', 'career', 'promotion', 'deadline', 'meeting'],
        'Relationships': ['family', 'friends', 'partner', 'spouse', 'children', 'parents', 'social', 'relationship', 'loved ones'],
        'Well-being & Health': ['health', 'exercise', 'sleep', 'mindfulness', 'meditation', 'diet', 'gym', 'wellness', 'self-care'],
        'Personal Growth': ['learn', 'grow', 'skill', 'challenge', 'goal', 'develop', 'improve', 'future', 'reflection'],
        'Daily Life': ['routine', 'chores', 'errands', 'home', 'commute', 'weather', 'food', 'daily']
    };

    // --- Core Functions ---

    function loadEntries() {
        const storedEntries = localStorage.getItem('journalEntries');
        if (storedEntries) {
            journalEntries = JSON.parse(storedEntries);
            renderEntries();
            updateAIInsights();
        }
    }

    function saveEntries() {
        localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
    }

    function addEntry() {
        const text = journalEntryTextarea.value.trim();
        if (text) {
            const entry = {
                id: Date.now(),
                date: new Date().toISOString(),
                text: text,
                analysis: analyzeText(text) // Run AI analysis
            };
            journalEntries.unshift(entry); // Add to the beginning
            saveEntries();
            journalEntryTextarea.value = '';
            renderEntries();
            updateAIInsights();
        }
    }

    function renderEntries() {
        pastEntriesList.innerHTML = ''; // Clear existing entries
        if (journalEntries.length === 0) {
            pastEntriesList.innerHTML = '<p class="no-entries-message">No entries yet. Start journaling!</p>';
            return;
        }
        // Remove the 'no entries' message if it exists and there are entries
        const existingNoEntriesMessage = pastEntriesList.querySelector('.no-entries-message');
        if (existingNoEntriesMessage) {
            existingNoEntriesMessage.remove();
        }

        journalEntries.forEach(entry => {
            const entryCard = document.createElement('div');
            entryCard.classList.add('entry-card');

            const date = new Date(entry.date).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const sentimentClass = getSentimentClass(entry.analysis.sentimentScore);
            const sentimentText = getSentimentText(entry.analysis.sentimentScore);

            entryCard.innerHTML = `
                <span class="entry-date">${date}</span>
                <p class="entry-text">${entry.text}</p>
                <p class="entry-sentiment">Sentiment: <span class="${sentimentClass}">${sentimentText}</span></p>
                <p class="entry-themes">Themes: <span>${entry.analysis.themes.length > 0 ? entry.analysis.themes.join(', ') : 'N/A'}</span></p>
            `;
            pastEntriesList.appendChild(entryCard);
        });
    }

    // --- AI Simulation Functions ---

    function analyzeText(text) {
        const lowerText = text.toLowerCase();
        const words = lowerText.match(/\b\w+\b/g) || [];

        // Sentiment Analysis
        let sentimentScore = 0;
        words.forEach(word => {
            if (positiveWords.includes(word)) {
                sentimentScore++;
            } else if (negativeWords.includes(word)) {
                sentimentScore--;
            }
        });

        // Theme Identification
        const identifiedThemes = new Set();
        for (const theme in themeKeywords) {
            if (themeKeywords[theme].some(keyword => lowerText.includes(keyword))) {
                identifiedThemes.add(theme);
            }
        }

        return {
            sentimentScore: sentimentScore,
            themes: Array.from(identifiedThemes)
        };
    }

    function getSentimentClass(score) {
        if (score > 1) return 'sentiment-positive';
        if (score < -1) return 'sentiment-negative';
        return 'sentiment-neutral';
    }

    function getSentimentText(score) {
        if (score > 1) return 'Positive';
        if (score < -1) return 'Negative';
        return 'Neutral';
    }

    function updateAIInsights() {
        if (journalEntries.length === 0) {
            aiSentimentDiv.innerHTML = '<h3>Overall Mood</h3><p>No entries yet.</p>';
            aiThemesDiv.innerHTML = '<h3>Recurring Themes</h3><p>No entries yet.</p>';
            aiTrendsDiv.innerHTML = '<h3>Emotional Trends</h3><p>No entries yet.</p>';
            aiPromptsDiv.innerHTML = '<h3>Reflection Prompt</h3><p>Write your first entry to get started!</p>';
            return;
        }

        // Overall Mood (Average Sentiment)
        const totalSentiment = journalEntries.reduce((sum, entry) => sum + entry.analysis.sentimentScore, 0);
        const avgSentiment = totalSentiment / journalEntries.length;
        const avgSentimentClass = getSentimentClass(avgSentiment);
        const avgSentimentText = getSentimentText(avgSentiment);
        aiSentimentDiv.innerHTML = `
            <h3>Overall Mood</h3>
            <p>Your average mood seems: <span class="${avgSentimentClass}">${avgSentimentText}</span></p>
        `;

        // Recurring Themes
        const allThemes = journalEntries.flatMap(entry => entry.analysis.themes);
        const themeCounts = {};
        allThemes.forEach(theme => {
            themeCounts[theme] = (themeCounts[theme] || 0) + 1;
        });
        const sortedThemes = Object.entries(themeCounts).sort(([, countA], [, countB]) => countB - countA);
        const topThemes = sortedThemes.slice(0, 3).map(([theme]) => theme);
        aiThemesDiv.innerHTML = `
            <h3>Recurring Themes</h3>
            <p>${topThemes.length > 0 ? topThemes.join(', ') : 'No prominent themes yet.'}</p>
        `;

        // Emotional Trends (Simplified)
        let trendSummary = "Continue journaling to observe trends.";
        if (journalEntries.length >= 3) {
            // Compare sentiment of the last 3 entries vs the 3 before that
            const recentSentiments = journalEntries.slice(0, 3).map(e => e.analysis.sentimentScore);
            const pastSentiments = journalEntries.slice(3, 6).map(e => e.analysis.sentimentScore);

            const recentAvg = recentSentiments.length > 0 ? recentSentiments.reduce((a, b) => a + b, 0) / recentSentiments.length : 0;
            const pastAvg = pastSentiments.length > 0 ? pastSentiments.reduce((a, b) => a + b, 0) / pastSentiments.length : 0;

            if (recentAvg > pastAvg + 1) { // +1 for a noticeable positive change
                trendSummary = "Your recent entries show a positive shift in mood! Keep up the good work.";
            } else if (recentAvg < pastAvg - 1) { // -1 for a noticeable negative change
                trendSummary = "There seems to be a slight dip in mood recently. Pay attention to how you're feeling.";
            } else {
                trendSummary = "Your emotional state appears relatively stable over recent entries.";
            }
        }
        aiTrendsDiv.innerHTML = `
            <h3>Emotional Trends</h3>
            <p>${trendSummary}</p>
        `;

        // Personalized Insight/Prompt
        let reflectionPrompt = "What's one thing you're grateful for today?";
        if (avgSentiment < -1) {
            reflectionPrompt = "It seems you've been feeling down. What's one small step you can take to feel better?";
        } else if (avgSentiment > 1) {
            reflectionPrompt = "You've been experiencing positive emotions! What contributed to this, and how can you cultivate more of it?";
        } else if (topThemes.includes('Work & Career')) {
            reflectionPrompt = "Reflect on your work-life balance. Is there anything you can adjust to reduce stress or increase satisfaction?";
        } else if (topThemes.includes('Relationships')) {
            reflectionPrompt = "Consider your relationships. Is there someone you need to connect with, or an interaction you'd like to improve?";
        } else if (topThemes.includes('Well-being & Health')) {
            reflectionPrompt = "How are you prioritizing your well-being? What's one healthy habit you can reinforce or start?";
        }
        aiPromptsDiv.innerHTML = `
            <h3>Reflection Prompt</h3>
            <p>${reflectionPrompt}</p>
        `;
    }


    // --- Event Listeners & Initial Load ---
    submitEntryButton.addEventListener('click', addEntry);
    loadEntries();
});
