document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const generateButton = document.getElementById('generateButton');
    const wordCloudContainer = document.getElementById('wordCloudContainer');

    const stopWords = new Set([
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it', 'its',
        'no', 'not', 'of', 'on', 'or', 'such', 'that', 'the', 'their', 'then', 'there', 'these', 'they',
        'this', 'to', 'was', 'will', 'with', 'he', 'she', 'him', 'her', 'you', 'your', 'we', 'us', 'i', 'my',
        'me', 'our', 'from', 'have', 'has', 'had', 'do', 'does', 'did', 'can', 'could', 'would', 'should',
        'about', 'above', 'after', 'again', 'all', 'any', 'because', 'before', 'being', 'below', 'between',
        'both', 'each', 'few', 'more', 'most', 'other', 'some', 'than', 'up', 'down', 'out', 'off', 'own',
        'same', 'so', 'too', 'very', 's', 't', 'just', 'don', 'now', 'what', 'where', 'when', 'why', 'how',
        'which', 'whom', 'who', 'while', 'etc'
    ]);

    const baseFontSizes = { min: 14, max: 48 }; // px
    const colors = [
        '#E74C3C', '#2ECC71', '#F1C40F', '#3498DB', '#9B59B6', '#1ABC9C', '#E67E22', '#34495E', '#C0392B', '#27AE60'
    ];

    function generateWordCloud() {
        const text = textInput.value;
        wordCloudContainer.innerHTML = ''; // Clear previous cloud

        if (!text.trim()) {
            wordCloudContainer.innerHTML = '<p class="placeholder-text">Please enter some text to generate a word cloud.</p>';
            return;
        }

        // 1. Text Processing: Clean, tokenize, and count frequencies
        const words = text.toLowerCase()
                          .replace(/[\W_]+/g, ' ') // Replace non-alphanumeric (and underscore) with space
                          .trim()
                          .split(/\s+/); // Split by one or more spaces

        const wordFrequencies = {};
        words.forEach(word => {
            if (word.length > 1 && !stopWords.has(word)) { // Filter out single letters and stop words
                wordFrequencies[word] = (wordFrequencies[word] || 0) + 1;
            }
        });

        const sortedWords = Object.entries(wordFrequencies).sort(([, countA], [, countB]) => countB - countA);

        if (sortedWords.length === 0) {
            wordCloudContainer.innerHTML = '<p class="placeholder-text">No significant words found after filtering. Try more text!</p>';
            return;
        }

        // Determine min/max frequencies for scaling
        const minFreq = sortedWords[sortedWords.length - 1][1];
        const maxFreq = sortedWords[0][1];

        // 2. Data Visualization: Create word elements with scaled sizes and colors
        sortedWords.forEach(([word, frequency], index) => {
            const span = document.createElement('span');
            span.textContent = word;
            span.classList.add('word-item');

            // Calculate font size (linear scaling)
            let fontSize;
            if (maxFreq === minFreq) {
                fontSize = baseFontSizes.min + (baseFontSizes.max - baseFontSizes.min) / 2; // Mid-range if all same freq
            } else {
                const scaleFactor = (frequency - minFreq) / (maxFreq - minFreq);
                fontSize = baseFontSizes.min + scaleFactor * (baseFontSizes.max - baseFontSizes.min);
            }
            span.style.fontSize = `${fontSize}px`;

            // Assign a color (cycling through predefined colors)
            span.style.color = colors[index % colors.length];

            // Add interactivity: show frequency on hover
            span.title = `Frequency: ${frequency}`;

            wordCloudContainer.appendChild(span);
        });
    }

    // Event listener for the button
    generateButton.addEventListener('click', generateWordCloud);

    // Generate an initial word cloud with the example text
    generateWordCloud();
});
