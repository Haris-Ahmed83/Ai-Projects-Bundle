document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultDiv = document.getElementById('result');

    const positiveKeywords = [
        'good', 'great', 'excellent', 'amazing', 'fantastic', 'wonderful',
        'love', 'like', 'happy', 'joy', 'positive', 'superb', 'brilliant',
        'awesome', 'delightful', 'charming', 'fabulous', 'optimistic', 'benefit'
    ];

    const negativeKeywords = [
        'bad', 'terrible', 'horrible', 'awful', 'dreadful', 'poor',
        'hate', 'dislike', 'sad', 'unhappy', 'negative', 'worst', 'frustrating',
        'problem', 'issue', 'difficult', 'struggle', 'misery', 'pain', 'stress'
    ];

    function analyzeSentiment() {
        const text = textInput.value.toLowerCase();
        let positiveScore = 0;
        let negativeScore = 0;

        if (text.trim() === '') {
            updateResult('N/A', 'initial');
            return;
        }

        // Count positive keywords
        positiveKeywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g'); // '\b' for whole word match
            const matches = text.match(regex);
            if (matches) {
                positiveScore += matches.length;
            }
        });

        // Count negative keywords
        negativeKeywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            const matches = text.match(regex);
            if (matches) {
                negativeScore += matches.length;
            }
        });

        let sentiment = 'Neutral';
        let sentimentClass = 'neutral';

        if (positiveScore > negativeScore) {
            sentiment = 'Positive';
            sentimentClass = 'positive';
        } else if (negativeScore > positiveScore) {
            sentiment = 'Negative';
            sentimentClass = 'negative';
        } else if (positiveScore === 0 && negativeScore === 0) {
            sentiment = 'Neutral'; // If no keywords found, it's neutral.
            sentimentClass = 'neutral';
        } else {
            sentiment = 'Neutral'; // Equal positive and negative counts
            sentimentClass = 'neutral';
        }

        updateResult(sentiment, sentimentClass);
    }

    function updateResult(sentiment, className) {
        resultDiv.innerHTML = `Sentiment: <span class="${className}">${sentiment}</span>`;

        // Remove previous sentiment classes and add the new one
        resultDiv.classList.remove('positive', 'negative', 'neutral', 'initial');
        resultDiv.classList.add(className);
    }

    // Initial state
    updateResult('N/A', 'initial');

    analyzeBtn.addEventListener('click', analyzeSentiment);

    // Optional: Analyze on text input change for a more interactive experience
    // textInput.addEventListener('input', analyzeSentiment);
});
