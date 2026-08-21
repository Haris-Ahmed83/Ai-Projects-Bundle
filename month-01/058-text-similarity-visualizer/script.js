document.addEventListener('DOMContentLoaded', () => {
    // DOM element references
    const text1Input = document.getElementById('text1');
    const text2Input = document.getElementById('text2');
    const calculateBtn = document.getElementById('calculateBtn');
    const scoreValueSpan = document.getElementById('scoreValue');
    const similarityBar = document.getElementById('similarityBar');

    /**
     * Cleans and tokenizes text into an array of words.
     * Converts to lowercase, removes punctuation, and splits by whitespace.
     * @param {string} text - The input text.
     * @returns {string[]} An array of cleaned words.
     */
    function cleanAndTokenize(text) {
        return text
            .toLowerCase()
            .replace(/[\W_]+/g, ' ') // Replace non-alphanumeric/underscore with space
            .split(/\s+/)
            .filter(word => word.length > 0); // Remove empty strings
    }

    /**
     * Calculates the Jaccard similarity between two texts.
     * Jaccard Index = (Size of Intersection) / (Size of Union)
     * @param {string} textA - The first text snippet.
     * @param {string} textB - The second text snippet.
     * @returns {number} The similarity score between 0 and 1.
     */
    function jaccardSimilarity(textA, textB) {
        const tokensA = cleanAndTokenize(textA);
        const tokensB = cleanAndTokenize(textB);

        const setA = new Set(tokensA);
        const setB = new Set(tokensB);

        // Handle empty input cases
        if (setA.size === 0 && setB.size === 0) {
            return 1; // Both empty, considered 100% similar
        }
        if (setA.size === 0 || setB.size === 0) {
            return 0; // One empty, other not, considered 0% similar
        }

        let intersectionSize = 0;
        for (const word of setA) {
            if (setB.has(word)) {
                intersectionSize++;
            }
        }

        const unionSize = setA.size + setB.size - intersectionSize;

        return intersectionSize / unionSize;
    }

    /**
     * Updates the UI with the calculated similarity score and visual bar.
     * @param {number} score - The similarity score (0 to 1).
     */
    function updateUI(score) {
        const displayScore = (score * 100).toFixed(2); // Convert to percentage
        scoreValueSpan.textContent = `${displayScore}%`;

        // Map score to a color (e.g., red -> yellow -> green)
        // HSL: Hue (0-120 for red-green), Saturation (70%), Lightness (50%)
        const hue = score * 120; 
        const color = `hsl(${hue}, 70%, 50%)`;

        similarityBar.style.width = `${displayScore}%`;
        similarityBar.style.backgroundColor = color;
    }

    /**
     * Event handler for the calculate button click.
     * Retrieves text, calculates similarity, and updates UI.
     */
    function handleCalculateClick() {
        const text1 = text1Input.value;
        const text2 = text2Input.value;

        if (!text1.trim() && !text2.trim()) {
            alert('Please enter at least one text snippet to compare.');
            scoreValueSpan.textContent = 'N/A';
            similarityBar.style.width = '0%';
            similarityBar.style.backgroundColor = '#e9ecef'; // Reset color
            return;
        }

        const similarity = jaccardSimilarity(text1, text2);
        updateUI(similarity);
    }

    // Attach event listener
    calculateBtn.addEventListener('click', handleCalculateClick);

    // Initial UI state (optional: could clear previous results on load)
    scoreValueSpan.textContent = '0.00%';
    similarityBar.style.width = '0%';
    similarityBar.style.backgroundColor = 'hsl(0, 70%, 50%)'; // Start with red
});
