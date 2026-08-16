document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const summarizeBtn = document.getElementById('summarizeBtn');
    const summaryOutput = document.getElementById('summaryOutput');

    // A basic list of English stop words. This can be expanded for better accuracy.
    const stopWords = new Set([
        "a", "an", "the", "and", "but", "or", "for", "nor", "so", "yet",
        "at", "by", "in", "of", "on", "to", "up", "down", "out", "off",
        "over", "under", "again", "further", "then", "once", "here", "there",
        "when", "where", "why", "how", "all", "any", "both", "each", "few",
        "more", "most", "other", "some", "such", "no", "not", "only", "own",
        "same", "so", "than", "too", "very", "s", "t", "can", "will", "just",
        "don", "should", "now", "d", "ll", "m", "o", "re", "ve", "y", "ain",
        "aren", "couldn", "didn", "doesn", "hadn", "hasn", "haven", "isn",
        "ma", "mightn", "mustn", "needn", "shan", "shouldn", "wasn", "weren",
        "won", "wouldn", "i", "me", "my", "myself", "we", "our", "ours",
        "ourselves", "you", "your", "yours", "yourself", "yourselves", "he",
        "him", "his", "himself", "she", "her", "hers", "herself", "it", "its",
        "itself", "they", "them", "their", "theirs", "themselves", "what",
        "which", "who", "whom", "this", "that", "these", "those", "am", "is",
        "are", "was", "were", "be", "been", "being", "have", "has", "had",
        "having", "do", "does", "did", "doing"
    ]);

    function summarizeText(text, numSentences = 5) {
        // 1. Sentence Tokenization
        // Split text into sentences using common delimiters.
        // This regex tries to capture sentences ending with ., !, ? followed by space or end of string.
        const sentences = text.match(/[^.!?]+[.!?]+\s*|[^.!?]+$/g) || [];

        if (sentences.length === 0) {
            return "No sentences to summarize.";
        }

        // 2. Word Tokenization and Normalization for the entire document
        // Convert to lowercase and split by non-alphanumeric characters, filter out empty strings.
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];

        // 3. Filter out stop words
        const filteredWords = words.filter(word => !stopWords.has(word));

        // 4. Calculate Word Frequencies for relevant words
        const wordFrequencies = {};
        filteredWords.forEach(word => {
            wordFrequencies[word] = (wordFrequencies[word] || 0) + 1;
        });

        // 5. Score Sentences
        const sentenceScores = sentences.map((sentence, index) => {
            const sentenceWords = sentence.toLowerCase().match(/\b\w+\b/g) || [];
            let score = 0;

            sentenceWords.forEach(word => {
                // Add the frequency of the word to the sentence's score if it's not a stop word
                if (!stopWords.has(word) && wordFrequencies[word]) {
                    score += wordFrequencies[word];
                }
            });

            // Add a bonus for sentences appearing early in the text (often contain main ideas)
            if (index < 3) { // Bonus for the first 3 sentences
                score *= 1.2;
            }

            return { sentence: sentence.trim(), score, index };
        });

        // 6. Sort sentences by score in descending order
        sentenceScores.sort((a, b) => b.score - a.score);

        // 7. Select top N sentences
        const selectedSentences = sentenceScores.slice(0, Math.min(numSentences, sentenceScores.length));

        // 8. Sort selected sentences by their original index to maintain coherence
        selectedSentences.sort((a, b) => a.index - b.index);

        // 9. Join selected sentences to form the summary
        if (selectedSentences.length === 0) {
            return "Could not extract a meaningful summary. Try with more text.";
        }
        return selectedSentences.map(s => s.sentence).join(' ');
    }

    summarizeBtn.addEventListener('click', () => {
        const inputText = textInput.value.trim();
        if (inputText === '') {
            summaryOutput.textContent = 'Please enter some text to summarize.';
            return;
        }

        // You can adjust the number of sentences in the summary here
        const summary = summarizeText(inputText, 5); // Get top 5 sentences
        summaryOutput.textContent = summary;
    });

    // Optional: Add some default text for easy testing
    textInput.value = `Natural language processing (NLP) is a subfield of linguistics, computer science, artificial intelligence, and information engineering. It deals with the interactions between computers and human (natural) languages. In particular, how to program computers to process and analyze large amounts of natural language data. The goal is a computer capable of "understanding" the contents of documents, including the contextual nuances of the language within them. The technology can then accurately extract information and insights contained in the documents, as well as categorize and organize the documents themselves. NLP tasks include text translation, sentiment analysis, speech recognition, and text summarization. Extractive summarization identifies and extracts key sentences or phrases directly from the original text. Abstractive summarization generates new sentences that capture the main idea, often requiring more advanced AI.`;
    summarizeBtn.click(); // Automatically summarize the default text on load
});
