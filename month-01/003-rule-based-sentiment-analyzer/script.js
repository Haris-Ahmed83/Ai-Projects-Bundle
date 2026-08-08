document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const sentimentOutput = document.getElementById('sentimentOutput');
    const keywordsFoundSpan = document.getElementById('keywordsFound');
    const resultDiv = document.getElementById('result');

    // Define keyword lists for sentiment analysis
    const positiveKeywords = [
        'good', 'great', 'excellent', 'awesome', 'fantastic', 'fabulous', 'wonderful', 'love',
        'happy', 'joy', 'positive', 'amazing', 'superb', 'beautiful', 'delightful', 'perfect',
        'enjoy', 'like', 'recommend', 'best', 'thrilled', 'excited', 'impressed', 'charming', 'pleasure'
    ];

    const negativeKeywords = [
        'bad', 'terrible', 'horrible', 'awful', 'hate', 'dislike', 'poor', 'worst',
        'sad', 'unhappy', 'negative', 'ugly', 'disappointing', 'frustrating', 'problem',
        'stress', 'boring', 'mess', 'fail', 'waste', 'difficult', 'annoying', 'regret', 'dreadful', 'unpleasant'
    ];

    // Event listener for the analyze button
    analyzeBtn.addEventListener('click', analyzeSentiment);

    // Function to analyze sentiment based on keywords
    function analyzeSentiment() {
        const text = textInput.value.toLowerCase(); // Convert to lowercase for case-insensitivity
        let positiveScore = 0;
        let negativeScore = 0;
        const foundKeywords = [];

        // If no text, reset and return
        if (text.trim() === '') {
            resetResult('Neutral', 'None', 'sentiment-neutral', 'neutral');
            return;
        }

        // Check for positive keywords
        positiveKeywords.forEach(keyword => {
            if (text.includes(keyword)) {
                positiveScore++;
                foundKeywords.push(keyword);
            }
        });

        // Check for negative keywords
        negativeKeywords.forEach(keyword => {
            if (text.includes(keyword)) {
                negativeScore++;
                foundKeywords.push(keyword);
            }
        });

        let sentiment = 'Neutral';
        let sentimentClass = 'sentiment-neutral';
        let resultClass = 'neutral';

        // Determine overall sentiment
        if (positiveScore > negativeScore) {
            sentiment = 'Positive';
            sentimentClass = 'sentiment-positive';
            resultClass = 'positive';
        } else if (negativeScore > positiveScore) {
            sentiment = 'Negative';
            sentimentClass = 'sentiment-negative';
            resultClass = 'negative';
        }
        // If scores are equal, it remains 'Neutral'

        // Update the UI with the analysis results
        resetResult(sentiment, foundKeywords.length > 0 ? foundKeywords.join(', ') : 'None', sentimentClass, resultClass);
    }

    // Helper function to update UI elements and their classes
    function resetResult(sentiment, keywords, sentimentTextClass, resultBoxClass) {
        sentimentOutput.textContent = sentiment;
        keywordsFoundSpan.textContent = keywords;

        // Apply sentiment-specific styling to the sentiment text
        sentimentOutput.className = sentimentTextClass;

        // Apply sentiment-specific styling to the result box border
        resultDiv.className = `result ${resultBoxClass}`;
    }

    // Initialize result display on page load
    resetResult('Neutral', 'None', 'sentiment-neutral', 'neutral');
});
