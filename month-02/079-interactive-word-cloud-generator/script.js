document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const generateButton = document.getElementById('generateButton');
    const wordCloudContainer = document.getElementById('wordCloudContainer');
    const maxWordsInput = document.getElementById('maxWords');
    const minFontSizeInput = document.getElementById('minFontSize');
    const maxFontSizeInput = document.getElementById('maxFontSize');

    // Common English stop words (can be extended)
    const stopWords = new Set([
        "a", "an", "the", "and", "or", "but", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "not", "no", "yes", "for", "with", "on", "at",
        "by", "from", "up", "down", "in", "out", "over", "under", "again", "further", "then", "once",
        "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more",
        "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than",
        "too", "very", "s", "t", "can", "will", "just", "don", "should", "now", "d", "ll", "m", "o",
        "re", "ve", "y", "ain", "aren", "couldn", "didn", "doesn", "hadn", "hasn", "haven", "isn",
        "ma", "mightn", "mustn", "needn", "shan", "shouldn", "wasn", "weren", "won", "wouldn", "about",
        "above", "after", "before", "among", "amongst", "around", "as", "behind", "below", "beside",
        "between", "beyond", "during", "except", "inside", "into", "like", "near", "off", "onto",
        "outside", "past", "round", "since", "through", "throughout", "to", "toward", "towards", "until",
        "upon", "within", "without", "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you",
        "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers",
        "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what",
        "which", "who", "whom", "this", "that", "these", "those", "am", "if", "then", "else", "etc"
    ]);

    generateButton.addEventListener('click', generateWordCloud);

    function generateWordCloud() {
        const text = inputText.value;
        const maxWords = parseInt(maxWordsInput.value);
        const minFontSize = parseInt(minFontSizeInput.value);
        const maxFontSize = parseInt(maxFontSizeInput.value);

        if (!text.trim()) {
            wordCloudContainer.innerHTML = '<p class="placeholder">Please enter some text to generate a word cloud.</p>';
            return;
        }

        // 1. Text Processing
        // Convert to lowercase, remove punctuation, split into words
        const words = text
            .toLowerCase()
            .replace(/[.,/#!$%^&*;:{}=\-_`~()\'"?!\n\r]/g, ' ') // Replace punctuation with space
            .split(/\s+/) // Split by one or more whitespace characters
            .filter(word => word.length > 2 && !stopWords.has(word)); // Filter out short words and stop words

        // 2. Frequency Analysis
        const wordFrequencies = {};
        words.forEach(word => {
            wordFrequencies[word] = (wordFrequencies[word] || 0) + 1;
        });

        // Convert to array and sort by frequency
        const sortedWords = Object.entries(wordFrequencies)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, maxWords); // Take only the top N words

        // Clear previous word cloud
        wordCloudContainer.innerHTML = '';

        if (sortedWords.length === 0) {
            wordCloudContainer.innerHTML = '<p class="placeholder">No significant words found after filtering. Try more text!</p>';
            return;
        }

        // Determine min/max frequencies for font size mapping
        const minFreq = sortedWords[sortedWords.length - 1][1];
        const maxFreq = sortedWords[0][1];

        // 3. Word Cloud Generation
        sortedWords.forEach(([word, frequency]) => {
            const wordSpan = document.createElement('span');
            wordSpan.classList.add('word');
            wordSpan.textContent = word;

            // Map frequency to font size
            let fontSize;
            if (maxFreq === minFreq) { // Handle case where all words have same frequency
                fontSize = (minFontSize + maxFontSize) / 2; // Use average font size
            } else {
                // Linear interpolation: minFreq maps to minFontSize, maxFreq maps to maxFontSize
                fontSize = minFontSize + (maxFontSize - minFontSize) * ((frequency - minFreq) / (maxFreq - minFreq));
            }
            wordSpan.style.fontSize = `${fontSize}px`;

            // Optional: Add a subtle random color (uncomment if desired)
            // const hue = Math.floor(Math.random() * 360);
            // wordSpan.style.color = `hsl(${hue}, 70%, 30%)`;

            wordCloudContainer.appendChild(wordSpan);
        });
    }

    // Optional: Add some initial text for a quick demo and generate on page load
    inputText.value = `The quick brown fox jumps over the lazy dog. This is a simple example to demonstrate the interactive word cloud generator. Users can paste any text here and see the most frequent words appear in different sizes. Customization options allow users to control the number of words displayed and the range of font sizes. Data visualization of text frequency is the core concept. Let's make this work well with modern web UI and vanilla JavaScript.`;
    generateWordCloud(); // Generate on page load with initial text
});
