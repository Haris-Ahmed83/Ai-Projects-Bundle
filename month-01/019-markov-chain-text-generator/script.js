document.addEventListener('DOMContentLoaded', () => {
    const corpusTextarea = document.getElementById('corpusText');
    const orderInput = document.getElementById('orderInput');
    const lengthInput = document.getElementById('lengthInput');
    const generateButton = document.getElementById('generateButton');
    const generatedOutput = document.getElementById('generatedOutput');

    // Function to clean text and build the Markov chain
    function learnMarkovChain(text, order) {
        const chain = new Map(); // Stores prefix -> [suffix1, suffix2, ...]

        // Basic text cleaning: lowercase, remove non-alphanumeric (except spaces), split by whitespace
        const words = text.toLowerCase()
                          .replace(/[^a-z0-9\s]/g, '') 
                          .split(/\s+/)
                          .filter(word => word.length > 0);

        if (words.length < order + 1) {
            console.warn("Corpus too short for the given order.");
            return chain; // Return empty chain if not enough words for any prefix
        }

        for (let i = 0; i < words.length - order; i++) {
            const prefix = words.slice(i, i + order).join(' ');
            const suffix = words[i + order];

            if (!chain.has(prefix)) {
                chain.set(prefix, []);
            }
            chain.get(prefix).push(suffix);
        }
        return chain;
    }

    // Function to generate text based on the Markov chain
    function generateText(chain, order, length) {
        if (chain.size === 0) {
            return "Cannot generate text: Markov chain is empty. Please provide a longer corpus.";
        }

        const prefixes = Array.from(chain.keys());
        // Pick a random starting prefix from the available keys
        let currentPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];

        const generatedWords = currentPrefix.split(' ');

        // Generate words until desired length or chain gets stuck
        // We generate 'length - order' new words because 'order' words are already in currentPrefix
        for (let i = 0; i < length - order; i++) {
            if (!chain.has(currentPrefix)) {
                // If current prefix not in chain, it means we've hit a dead end.
                // Try to restart with a new random prefix or stop.
                console.warn("Markov chain got stuck. Attempting to find a new starting point...");
                const availablePrefixes = prefixes.filter(p => p !== currentPrefix); // Avoid getting stuck on the same dead end
                if (availablePrefixes.length > 0) {
                    currentPrefix = availablePrefixes[Math.floor(Math.random() * availablePrefixes.length)];
                    generatedWords.push('...'); // Indicate a jump/restart
                    generatedWords.push(...currentPrefix.split(' ')); // Add the new prefix words
                    // Adjust i to account for added words, or simply continue and let it pick up
                } else {
                    break; // No other prefixes available, truly stuck
                }
            }

            const possibleNextWords = chain.get(currentPrefix);
            const nextWord = possibleNextWords[Math.floor(Math.random() * possibleNextWords.length)];

            generatedWords.push(nextWord);

            // Update current prefix for the next iteration
            currentPrefix = generatedWords.slice(-order).join(' ');
        }

        // Basic formatting: Capitalize the first letter and add a period if it doesn't end with one
        let result = generatedWords.join(' ');
        result = result.charAt(0).toUpperCase() + result.slice(1);
        if (!/[.!?]$/.test(result)) {
            result += '.';
        }
        return result;
    }

    // Event listener for the generate button
    generateButton.addEventListener('click', () => {
        const corpus = corpusTextarea.value.trim();
        const order = parseInt(orderInput.value, 10);
        const length = parseInt(lengthInput.value, 10);

        if (!corpus) {
            generatedOutput.textContent = "Please provide a text corpus to generate from.";
            return;
        }

        if (isNaN(order) || order < 1) {
            generatedOutput.textContent = "Please enter a valid chain order (a number greater than or equal to 1).";
            return;
        }

        if (isNaN(length) || length < order) {
            generatedOutput.textContent = `Please enter a valid generation length (a number greater than or equal to the order, currently ${order}).`;
            return;
        }

        const markovChain = learnMarkovChain(corpus, order);
        if (markovChain.size === 0) {
            generatedOutput.textContent = "Could not build Markov chain. The corpus might be too short or contains only unique words for the given order.";
            return;
        }

        const generatedText = generateText(markovChain, order, length);
        generatedOutput.textContent = generatedText;
    });

    // Trigger generation on initial load with default values
    generateButton.click();
});
