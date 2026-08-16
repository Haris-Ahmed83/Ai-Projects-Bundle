const analyzeBtn = document.getElementById('analyzeBtn');
const textInput = document.getElementById('textInput');
const positiveScoreSpan = document.getElementById('positiveScore');
const neutralScoreSpan = document.getElementById('neutralScore');
const negativeScoreSpan = document.getElementById('negativeScore');
const positiveBar = document.getElementById('positiveBar');
const neutralBar = document.getElementById('neutralBar');
const negativeBar = document.getElementById('negativeBar');
const resultsContainer = document.getElementById('resultsContainer');

// Very simplified keyword lists for demonstration
const positiveWords = [
    'good', 'great', 'excellent', 'fantastic', 'awesome', 'amazing', 'love', 'happy',
    'joy', 'positive', 'wonderful', 'superb', 'brilliant', 'delightful', 'charming',
    'fabulous', 'optimistic', 'benefit', 'success', 'advantage', 'enjoy', 'like', 'best'
];

const negativeWords = [
    'bad', 'terrible', 'horrible', 'awful', 'hate', 'sad', 'angry', 'negative',
    'poor', 'disappointing', 'frustrating', 'ugly', 'fail', 'problem', 'worry',
    'stress', 'dislike', 'unhappy', 'misfortune', 'detriment', 'loss', 'difficult', 'worst'
];

function analyzeSentiment(text) {
    const cleanedText = text.toLowerCase().replace(/[.,!?;:"'()\d]/g, ''); // Remove punctuation and numbers
    const words = cleanedText.split(/\s+/).filter(word => word.length > 0); // Split by whitespace and filter empty strings

    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    if (words.length === 0) {
        return { positive: 0, neutral: 0, negative: 0 };
    }

    words.forEach(word => {
        if (positiveWords.includes(word)) {
            positiveCount++;
        } else if (negativeWords.includes(word)) {
            negativeCount++;
        } else {
            neutralCount++;
        }
    });

    const totalCount = positiveCount + negativeCount + neutralCount;

    const positivePercentage = (totalCount === 0) ? 0 : (positiveCount / totalCount) * 100;
    const negativePercentage = (totalCount === 0) ? 0 : (negativeCount / totalCount) * 100;
    const neutralPercentage = (totalCount === 0) ? 0 : (neutralCount / totalCount) * 100;

    return {
        positive: positivePercentage.toFixed(1),
        neutral: neutralPercentage.toFixed(1),
        negative: negativePercentage.toFixed(1)
    };
}

function displayResults(sentiment) {
    resultsContainer.style.display = 'block'; // Show results container

    positiveScoreSpan.textContent = `${sentiment.positive}%`;
    neutralScoreSpan.textContent = `${sentiment.neutral}%`;
    negativeScoreSpan.textContent = `${sentiment.negative}%`;

    positiveBar.style.width = `${sentiment.positive}%`;
    neutralBar.style.width = `${sentiment.neutral}%`;
    negativeBar.style.width = `${sentiment.negative}%`;
}

analyzeBtn.addEventListener('click', () => {
    const text = textInput.value;
    if (text.trim() === '') {
        alert('Please enter some text to analyze.');
        resultsContainer.style.display = 'none'; // Hide results if input is empty
        return;
    }

    const sentiment = analyzeSentiment(text);
    displayResults(sentiment);
});

// Initial state: hide results
resultsContainer.style.display = 'none';
