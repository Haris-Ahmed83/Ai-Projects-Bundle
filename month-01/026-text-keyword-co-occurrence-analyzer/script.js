document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const analyzeButton = document.getElementById('analyzeButton');
    const keywordsList = document.getElementById('keywordsList');
    const cooccurrenceResults = document.getElementById('cooccurrenceResults');

    // A comprehensive list of common English stop words
    const stopWords = new Set([
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it', 'no', 'not', 'of', 'on', 'or', 'such', 'that', 'the', 'their', 'then', 'there', 'these', 'they', 'this', 'to', 'was', 'will', 'with', 'he', 'she', 'him', 'her', 'his', 'its', 'we', 'us', 'our', 'you', 'your', 'my', 'me', 'i', 'have', 'has', 'had', 'do', 'does', 'did', 'can', 'could', 'would', 'should', 'get', 'got', 'make', 'made', 'go', 'went', 'just', 'been', 'being', 'from', 'about', 'above', 'after', 'again', 'all', 'am', 'any', 'down', 'during', 'each', 'few', 'more', 'most', 'other', 'out', 'over', 'same', 'some', 'than', 'up', 'very', 'what', 'when', 'where', 'which', 'who', 'whom', 'why', 'how', 's', 't', 'don', 'don\'t', 'll', 'm', 'd', 're', 've', 'y', 'ain', 'aren', 'couldn', 'didn', 'doesn', 'hadn', 'hasn', 'haven', 'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan', 'shouldn', 'wasn', 'weren', 'won', 'wouldn'
    ]);

    analyzeButton.addEventListener('click', analyzeText);

    function analyzeText() {
        const text = textInput.value;
        if (!text.trim()) {
            alert('Please paste some text to analyze.');
            return;
        }

        // Clear previous results
        keywordsList.innerHTML = '';
        cooccurrenceResults.innerHTML = '';

        // Preprocessing: convert to lowercase, remove punctuation (keep apostrophes), split into words
        const cleanedText = text.toLowerCase().replace(/[^\w\s']/g, '');
        // Filter out short words (length <= 2) after splitting
        const words = cleanedText.split(/\s+/).filter(word => word.length > 2);

        // Filter stop words from the word list
        const filteredWords = words.filter(word => !stopWords.has(word));

        // --- Keyword Extraction (Frequency Count) ---
        const wordCounts = {};
        filteredWords.forEach(word => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        });

        // Sort keywords by frequency in descending order
        const sortedKeywords = Object.entries(wordCounts).sort(([, countA], [, countB]) => countB - countA);
        displayKeywords(sortedKeywords.slice(0, 15)); // Display top 15 keywords

        // --- Co-occurrence Analysis ---
        // Split text into sentences for context-aware co-occurrence
        const sentences = text.toLowerCase()
                                .split(/[.!?\n]+/) // Split by sentence terminators or newlines
                                .map(s => s.trim()) // Trim whitespace from each sentence
                                .filter(s => s.length > 0); // Remove empty sentences

        const coOccurrenceMap = {}; // Format: keyword -> { co_word1: count, co_word2: count }

        sentences.forEach(sentence => {
            // Clean and filter words for the current sentence
            const sentenceWords = sentence.replace(/[^\w\s']/g, '')
                                          .split(/\s+/)
                                          .filter(word => word.length > 2 && !stopWords.has(word));

            // For each word in the sentence, count co-occurrences with other words in the same sentence
            for (let i = 0; i < sentenceWords.length; i++) {
                const word1 = sentenceWords[i];
                coOccurrenceMap[word1] = coOccurrenceMap[word1] || {};

                for (let j = 0; j < sentenceWords.length; j++) {
                    const word2 = sentenceWords[j];
                    if (word1 !== word2) { // Ensure we're not counting a word with itself
                        coOccurrenceMap[word1][word2] = (coOccurrenceMap[word1][word2] || 0) + 1;
                    }
                }
            }
        });

        // Display co-occurrences for the top 10 keywords
        const topKeywordsForCooccurrence = sortedKeywords.slice(0, 10).map(k => k[0]);
        displayCoOccurrences(coOccurrenceMap, topKeywordsForCooccurrence);
    }

    /**
     * Displays the list of keywords and their frequencies.
     * @param {Array<[string, number]>} keywords - An array of [word, count] pairs.
     */
    function displayKeywords(keywords) {
        if (keywords.length === 0) {
            keywordsList.innerHTML = '<li>No significant keywords found.</li>';
            return;
        }
        keywords.forEach(([word, count]) => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="word">${word}</span> <span class="count">${count}</span>`;
            keywordsList.appendChild(li);
        });
    }

    /**
     * Displays co-occurring words for a given set of top keywords.
     * @param {Object} coOccurrences - The map of keyword -> {co_word: count}.
     * @param {Array<string>} topKeywords - An array of top keywords to display co-occurrences for.
     */
    function displayCoOccurrences(coOccurrences, topKeywords) {
        let foundCooccurrences = false;
        topKeywords.forEach(keyword => {
            if (coOccurrences[keyword]) {
                const relatedWords = Object.entries(coOccurrences[keyword])
                                          .sort(([, countA], [, countB]) => countB - countA)
                                          .slice(0, 5) // Get top 5 most co-occurring words
                                          .map(([word, count]) => `${word} (${count})`);

                if (relatedWords.length > 0) {
                    foundCooccurrences = true;
                    const div = document.createElement('div');
                    div.classList.add('cooccurrence-item');
                    div.innerHTML = `<strong>${keyword}</strong> often appears with: <span>${relatedWords.join(', ')}</span>`;
                    cooccurrenceResults.appendChild(div);
                }
            }
        });

        if (!foundCooccurrences) {
            const p = document.createElement('p');
            p.textContent = 'No significant co-occurring words found for the top keywords.';
            cooccurrenceResults.appendChild(p);
        }
    }
});
