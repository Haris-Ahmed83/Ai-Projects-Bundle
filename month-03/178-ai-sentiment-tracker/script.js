document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('text-input');
    const analyzeButton = document.getElementById('analyze-button');
    const sentimentOutput = document.getElementById('sentiment-output');
    const sentimentLabel = document.getElementById('sentiment-label');
    const sentimentScore = document.getElementById('sentiment-score');
    const sentimentConfidence = document.getElementById('sentiment-confidence');
    const sentimentBar = document.getElementById('sentiment-bar');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorOutput = document.getElementById('error-output');

    // Simple keyword lists for sentiment simulation
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'love', 'amazing', 'fantastic', 'awesome', 'superb', 'wonderful', 'joy', 'best', 'like', 'recommend', 'perfect', 'glad', 'pleased', 'positive'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'sad', 'poor', 'disappointing', 'worst', 'frustrating', 'ugly', 'dislike', 'never', 'negative', 'angry', 'upset', 'horrible'];

    analyzeButton.addEventListener('click', async () => {
        const text = textInput.value.trim();

        // Clear previous results and hide error
        sentimentOutput.classList.add('hidden');
        errorOutput.classList.add('hidden');
        sentimentBar.style.width = '0%';
        sentimentBar.className = 'sentiment-bar'; // Reset classes

        if (text === '') {
            errorOutput.classList.remove('hidden');
            return;
        }

        loadingIndicator.classList.remove('hidden');
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500)); 

        const analysis = analyzeSentiment(text);
        
        loadingIndicator.classList.add('hidden');
        sentimentOutput.classList.remove('hidden');
        displayResults(analysis);
    });

    function analyzeSentiment(text) {
        const lowerText = text.toLowerCase();
        const words = lowerText.match(/\b\w+\b/g) || []; // Extract words

        let positiveCount = 0;
        let negativeCount = 0;

        words.forEach(word => {
            if (positiveWords.includes(word)) {
                positiveCount++;
            } else if (negativeWords.includes(word)) {
                negativeCount++;
            }
        });

        const totalSentimentWords = positiveCount + negativeCount;
        let score = 0;
        let label = 'Neutral';
        let confidence = Math.floor(Math.random() * (95 - 60 + 1)) + 60; // Base confidence 60-95%

        if (totalSentimentWords > 0) {
            score = (positiveCount - negativeCount) / totalSentimentWords; // Range -1 to 1
            if (score > 0.3) {
                label = 'Positive';
            } else if (score < -0.3) {
                label = 'Negative';
            } else {
                label = 'Neutral';
            }
            confidence = Math.min(99, confidence + (totalSentimentWords * 2)); // Higher word count, potentially higher confidence
        } else {
            // If no recognized sentiment words, it's neutral with lower confidence
            label = 'Neutral';
            score = 0; // Explicitly neutral score
            confidence = Math.floor(Math.random() * (70 - 40 + 1)) + 40; // 40-70% for neutral
        }

        // Clamp score between -1 and 1 to ensure it's within expected range
        score = Math.max(-1, Math.min(1, score));

        return {
            label: label,
            score: score.toFixed(2),
            confidence: `${confidence}%`
        };
    }

    function displayResults(analysis) {
        sentimentLabel.textContent = analysis.label;
        sentimentScore.textContent = analysis.score;
        sentimentConfidence.textContent = analysis.confidence;

        // Clear previous classes and apply new one
        sentimentBar.classList.remove('positive', 'negative', 'neutral'); 
        sentimentBar.classList.add(analysis.label.toLowerCase());

        // Map score from -1 to 1 to a width from 0% to 100%
        // -1 -> 0%, 0 -> 50%, 1 -> 100%
        const numericalScore = parseFloat(analysis.score);
        const barWidth = (numericalScore + 1) / 2 * 100; 
        
        sentimentBar.style.width = `${barWidth}%`;
    }
});
