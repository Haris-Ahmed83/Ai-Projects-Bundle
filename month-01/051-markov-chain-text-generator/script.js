document.addEventListener('DOMContentLoaded', () => {
    const sourceTextarea = document.getElementById('source-text');
    const lengthInput = document.getElementById('output-length');
    const generateButton = document.getElementById('generate-btn');
    const outputTextarea = document.getElementById('generated-text');

    /**
     * Builds a Markov chain from the input text.
     * The chain is a Map where keys are words and values are arrays of words that can follow them.
     * @param {string} text The source text to analyze.
     * @returns {Map<string, string[]>} The Markov chain.
     */
    function buildMarkovChain(text) {
        const chain = new Map();
        // Convert text to lowercase and split into words.
        // Simple cleaning: remove non-alphanumeric characters at the start/end of words,
        // but preserve internal punctuation like apostrophes.
        const words = text.toLowerCase()
                          .split(/\s+/) // Split by one or more whitespace characters
                          .filter(word => word.length > 0) // Remove empty strings from split
                          .map(word => word.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '')); // Clean punctuation

        if (words.length < 2) {
            return chain; // Not enough words to form a chain (needs at least two for a pair)
        }

        for (let i = 0; i < words.length - 1; i++) {
            const currentWord = words[i];
            const nextWord = words[i + 1];

            if (!chain.has(currentWord)) {
                chain.set(currentWord, []);
            }
            chain.get(currentWord).push(nextWord);
        }
        return chain;
    }

    /**
     * Generates text using a given Markov chain.
     * @param {Map<string, string[]>} chain The Markov chain.
     * @param {number} length The desired number of words in the generated text.
     * @returns {string} The generated text.
     */
    function generateText(chain, length) {
        if (chain.size === 0) {
            return "Error: Markov chain is empty. Please provide more source text.";
        }

        const possibleStartWords = Array.from(chain.keys());
        if (possibleStartWords.length === 0) {
            return "Error: No words in chain to start from.";
        }

        // Pick a random starting word from the keys of the chain
        let currentWord = possibleStartWords[Math.floor(Math.random() * possibleStartWords.length)];
        const result = [currentWord];

        for (let i = 0; i < length - 1; i++) {
            const nextWords = chain.get(currentWord);
            if (!nextWords || nextWords.length === 0) {
                // If the current path runs out, try to find another starting point
                // to fulfill the desired length, or break if no good options.
                let foundNewStart = false;
                for (let j = 0; j < possibleStartWords.length; j++) {
                    const newStartCandidate = possibleStartWords[Math.floor(Math.random() * possibleStartWords.length)];
                    if (chain.has(newStartCandidate) && chain.get(newStartCandidate).length > 0) {
                        currentWord = newStartCandidate;
                        result.push(currentWord); // Add the new start word to the result
                        foundNewStart = true;
                        break;
                    }
                }
                if (!foundNewStart) {
                    break; // Cannot continue generating meaningfully
                }
            } else {
                // Pick a random next word from the possibilities
                const nextWord = nextWords[Math.floor(Math.random() * nextWords.length)];
                result.push(nextWord);
                currentWord = nextWord;
            }
        }

        // Post-processing for more natural output: Capitalize first word and add period at the end.
        if (result.length > 0) {
            // Capitalize the first letter of the first word
            result[0] = result[0].charAt(0).toUpperCase() + result[0].slice(1);

            // Add a period if the last word doesn't end with common sentence punctuation
            const lastWord = result[result.length - 1];
            if (!/[.!?]$/.test(lastWord)) {
                result[result.length - 1] += '.';
            }
        }

        return result.join(' ');
    }

    // Event Listener for the Generate button
    generateButton.addEventListener('click', () => {
        const sourceText = sourceTextarea.value.trim();
        const outputLength = parseInt(lengthInput.value, 10);

        if (sourceText === '') {
            outputTextarea.value = 'Please enter some source text to build the Markov chain.';
            return;
        }

        if (isNaN(outputLength) || outputLength <= 0) {
            outputTextarea.value = 'Please enter a valid positive number for the output length.';
            return;
        }

        // Disable button during generation to prevent multiple clicks
        generateButton.disabled = true;
        generateButton.textContent = 'Generating...';

        try {
            const markovChain = buildMarkovChain(sourceText);
            const generatedText = generateText(markovChain, outputLength);
            outputTextarea.value = generatedText;
        } catch (error) {
            console.error("Error during text generation:", error);
            outputTextarea.value = `An error occurred: ${error.message}`;
        } finally {
            generateButton.disabled = false;
            generateButton.textContent = 'Generate Text';
        }
    });

    // Optional: Add some default text for easy testing
    sourceTextarea.value = "The quick brown fox jumps over the lazy dog. The dog barks at the fox. A quick fox is clever. Lazy dogs are often sleepy. It was a dark and stormy night. The storm raged, and the night was long.";
});
