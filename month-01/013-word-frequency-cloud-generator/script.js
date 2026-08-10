document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const wordCloudDiv = document.getElementById('wordCloud');

    // Event listener for the analyze button
    analyzeBtn.addEventListener('click', analyzeText);

    /**
     * Analyzes the text from the input area, calculates word frequencies,
     * and displays them as a word cloud.
     */
    function analyzeText() {
        const text = textInput.value;
        if (!text.trim()) {
            wordCloudDiv.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Please enter some text to analyze.</p>';
            return;
        }

        // 1. Pre-process text:
        // Convert to lowercase, remove punctuation/numbers/newlines, trim spaces, split into words.
        // Filters out single-character words (e.g., 'a', 'i') which are often stopwords in English.
        const words = text
            .toLowerCase()
            .replace(/[.,\/#!$%^&*;:{}=\-_`~()—"'\d\n\r]/g, " ") // Replace punctuation, numbers, newlines with space
            .replace(/\s+/g, " ") // Replace multiple spaces with a single space
            .trim() // Trim leading/trailing spaces
            .split(' ') // Split by single space
            .filter(word => word.length > 1); // Filter out empty strings and very short words

        if (words.length === 0) {
            wordCloudDiv.innerHTML = '<p style="text-align: center; color: #7f8c8d;">No valid words found after processing. Try different text.</p>';
            return;
        }

        // 2. Count word occurrences
        const wordCounts = {};
        words.forEach(word => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        });

        // 3. Sort words by frequency in descending order
        const sortedWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);

        // 4. Display results as a word cloud
        wordCloudDiv.innerHTML = ''; // Clear previous results

        if (sortedWords.length === 0) {
            wordCloudDiv.innerHTML = '<p style="text-align: center; color: #7f8c8d;">No words to display.</p>';
            return;
        }

        // Define min/max font sizes for visual scaling
        const minFontSize = 14; // px
        const maxFontSize = 48; // px

        // Get the highest and lowest frequencies to normalize font sizes
        const maxCount = sortedWords[0][1];
        const minCount = sortedWords[sortedWords.length - 1][1];

        sortedWords.forEach(([word, count]) => {
            const wordItem = document.createElement('span');
            wordItem.classList.add('word-item');
            wordItem.textContent = `${word} (${count})`;

            // Calculate font size based on frequency
            let fontSize;
            if (maxCount === minCount) {
                // If all words have the same frequency, use an average font size
                fontSize = (minFontSize + maxFontSize) / 2;
            } else {
                // Linear scaling between minFontSize and maxFontSize
                const normalizedCount = (count - minCount) / (maxCount - minCount);
                fontSize = minFontSize + (normalizedCount * (maxFontSize - minFontSize));
            }
            wordItem.style.fontSize = `${fontSize}px`;

            wordCloudDiv.appendChild(wordItem);
        });
    }

    // Optional: Add some default text and run analysis on page load for a better first impression
    textInput.value = `The quick brown fox jumps over the lazy dog. The dog barks, and the fox runs away. This is a quick test of the word frequency counter. Test, test, test. Natural language processing is fun! It helps analyze text data. Data is key.`;
    analyzeText(); // Run analysis with default text when the page loads
});
