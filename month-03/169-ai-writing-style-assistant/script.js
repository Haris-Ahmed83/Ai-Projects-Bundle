document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const overallFeedbackElem = document.getElementById('overallFeedback');
    const toneAnalysisElem = document.getElementById('toneAnalysis');
    const readabilityScoreElem = document.getElementById('readabilityScore');
    const concisenessSuggestionsElem = document.getElementById('concisenessSuggestions');

    analyzeBtn.addEventListener('click', analyzeText);

    function analyzeText() {
        const text = textInput.value.trim();

        if (text.length < 50) { 
            alert('Please enter a longer text (at least 50 characters) for a more meaningful analysis.');
            return;
        }

        // Clear previous results and show loading indicator
        overallFeedbackElem.textContent = 'Analyzing...';
        toneAnalysisElem.textContent = 'Analyzing...';
        readabilityScoreElem.textContent = 'Analyzing...';
        concisenessSuggestionsElem.innerHTML = '<li>Analyzing...</li>';
        loadingIndicator.classList.remove('hidden');

        // Simulate AI analysis delay
        setTimeout(() => {
            const analysisResults = performSimulatedAnalysis(text);
            displayResults(analysisResults);
            loadingIndicator.classList.add('hidden');
        }, 1800); // Simulate 1.8 seconds of processing
    }

    function performSimulatedAnalysis(text) {
        // --- 1. Basic Text Metrics --- 
        const words = text.split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;
        const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text]; // Split by sentence endings, handle single sentence
        const sentenceCount = sentences.length;
        const avgWordsPerSentence = wordCount / sentenceCount;

        // --- 2. Tone Analysis (Simplified Keyword Matching) --- 
        const positiveKeywords = ['excellent', 'great', 'effective', 'strong', 'valuable', 'opportunity', 'benefit', 'achieve', 'success', 'innovation', 'progress', 'positive', 'optimistic'];
        const negativeKeywords = ['challenge', 'problem', 'difficulty', 'issue', 'risk', 'failure', 'weakness', 'limitation', 'concern', 'negative', 'struggle', 'detrimental'];
        const neutralKeywords = ['consider', 'evaluate', 'factor', 'aspect', 'develop', 'approach', 'structure', 'data', 'information', 'report', 'analyze', 'observe'];

        let positiveScore = 0;
        let negativeScore = 0;
        let neutralScore = 0;

        const lowerCaseText = text.toLowerCase();

        const countKeywords = (text, keywords) => {
            let count = 0;
            keywords.forEach(keyword => {
                const regex = new RegExp(`\\b${keyword}\\b`, 'g'); // \b for whole word match
                count += (text.match(regex) || []).length;
            });
            return count;
        };

        positiveScore = countKeywords(lowerCaseText, positiveKeywords);
        negativeScore = countKeywords(lowerCaseText, negativeKeywords);
        neutralScore = countKeywords(lowerCaseText, neutralKeywords);

        let tone = 'Neutral';
        if (positiveScore > negativeScore * 1.5 && positiveScore > neutralScore * 0.7) { // Higher threshold for clear positive/negative
            tone = 'Positive';
        } else if (negativeScore > positiveScore * 1.5 && negativeScore > neutralScore * 0.7) {
            tone = 'Negative';
        } else if (neutralScore > positiveScore && neutralScore > negativeScore) {
            tone = 'Primarily Neutral';
        } else if (positiveScore > negativeScore) {
            tone = 'Slightly Positive';
        } else if (negativeScore > positiveScore) {
            tone = 'Slightly Negative';
        }

        // --- 3. Readability Score (Simplified Flesch-Kincaid approximation) --- 
        // A very simplified approach: assume longer words and longer sentences decrease readability.
        const complexWordThreshold = 7; // words with more than X characters are considered 'complex'
        const complexWordCount = words.filter(word => word.length >= complexWordThreshold).length;

        // Simplified readability index: lower score = easier to read
        // Arbitrary weighting: average words per sentence has a larger impact.
        let readabilityIndex = (avgWordsPerSentence * 2) + (complexWordCount / (wordCount || 1) * 50); 

        let readabilityFeedback = '';
        if (readabilityIndex < 20) {
            readabilityFeedback = `Very Easy (Score: ${readabilityIndex.toFixed(1)}). Excellent for broad audiences.`;
        } else if (readabilityIndex < 35) {
            readabilityFeedback = `Easy (Score: ${readabilityIndex.toFixed(1)}). Suitable for most readers.`;
        } else if (readabilityIndex < 50) {
            readabilityFeedback = `Standard (Score: ${readabilityIndex.toFixed(1)}). Understandable for general adult readers.`;
        } else if (readabilityIndex < 70) {
            readabilityFeedback = `Difficult (Score: ${readabilityIndex.toFixed(1)}). May require effort from readers.`;
        } else {
            readabilityFeedback = `Very Difficult (Score: ${readabilityIndex.toFixed(1)}). Consider simplifying sentence structure and vocabulary.`;
        }

        // --- 4. Conciseness Suggestions --- 
        const concisenessSuggestions = [];
        const fillerWords = ['basically', 'actually', 'just', 'very', 'really', 'in fact', 'so as to', 'it seems that', 'kind of', 'sort of', 'perhaps', 'maybe'];
        const verbosePhrases = [
            { phrase: 'in order to', suggestion: 'to' },
            { phrase: 'due to the fact that', suggestion: 'because' },
            { phrase: 'at this point in time', suggestion: 'now' },
            { phrase: 'it is important to note that', suggestion: '' },
            { phrase: 'on account of', suggestion: 'because of' },
            { phrase: 'with the exception of', suggestion: 'except for' }
        ];

        // Check for filler words
        fillerWords.forEach(filler => {
            const regex = new RegExp(`\\b${filler}\\b`, 'gi');
            if (text.match(regex)) {
                concisenessSuggestions.push(`Consider removing or replacing the filler word "${filler}" to make your writing more direct.`);
            }
        });

        // Check for verbose phrases
        verbosePhrases.forEach(item => {
            const regex = new RegExp(`\\b${item.phrase}\\b`, 'gi');
            if (text.match(regex)) {
                concisenessSuggestions.push(`Replace "${item.phrase}" with a more concise option like "${item.suggestion || 'nothing'}".`);
            }
        });

        // Suggest breaking up long sentences
        if (avgWordsPerSentence > 22) { // Threshold for long sentences
            concisenessSuggestions.push(`Your average sentence length is quite high (${avgWordsPerSentence.toFixed(1)} words). Try breaking longer sentences into shorter, more digestible ones.`);
        }

        // Suggest specific word replacements for common verbose words (e.g., utilize -> use)
        if (lowerCaseText.includes('utilize')) {
            concisenessSuggestions.push(`Consider using "use" instead of "utilize" for better conciseness.`);
        }
        if (lowerCaseText.includes('prioritize')) {
            concisenessSuggestions.push(`"Prioritize" can sometimes be replaced with "focus on" or "rank" for clarity.`);
        }

        if (concisenessSuggestions.length === 0) {
            concisenessSuggestions.push('Your text appears concise and direct. Well done!');
        }

        // --- 5. Overall Feedback Summary --- 
        let overallSummary = `Your document contains approximately ${wordCount} words across ${sentenceCount} sentences, averaging ${avgWordsPerSentence.toFixed(1)} words per sentence.`;
        overallSummary += ` The detected tone is primarily ${tone.toLowerCase()}.`;
        overallSummary += ` Readability is categorized as ${readabilityFeedback.split('(')[0].trim()}.`;
        if (concisenessSuggestions.length > 1 || concisenessSuggestions[0] !== 'Your text appears concise and direct. Well done!') {
             overallSummary += ` There are several opportunities to enhance conciseness.`;
        } else {
            overallSummary += ` Your writing is notably concise.`;
        }

        return {
            overallFeedback: overallSummary,
            tone: tone,
            readability: readabilityFeedback,
            conciseness: concisenessSuggestions
        };
    }

    function displayResults(results) {
        overallFeedbackElem.textContent = results.overallFeedback;
        toneAnalysisElem.textContent = results.tone;
        readabilityScoreElem.textContent = results.readability;

        concisenessSuggestionsElem.innerHTML = ''; // Clear previous
        results.conciseness.forEach(suggestion => {
            const li = document.createElement('li');
            li.textContent = suggestion;
            concisenessSuggestionsElem.appendChild(li);
        });
    }
});
