document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const wordCountSpan = document.getElementById('wordCount');
    const fkReadingEaseSpan = document.getElementById('fkReadingEase');
    const fkGradeLevelSpan = document.getElementById('fkGradeLevel');
    const ariSpan = document.getElementById('ari');
    const smogSpan = document.getElementById('smog');

    // Helper function to count sentences
    function countSentences(text) {
        if (!text) return 0;
        // Split by common sentence endings followed by whitespace or end of string
        // The regex `[.!?]+` matches one or more periods, exclamation marks, or question marks.
        // `\s*` matches any whitespace (including none) after the punctuation.
        const sentences = text.split(/[.!?]+\s*/).filter(s => s.trim().length > 0);
        return sentences.length;
    }

    // Heuristic for syllable counting
    // This is a simplified approach and may not be perfectly accurate for all words.
    // It's a common heuristic used for readability formulas in client-side JS for conciseness.
    function countSyllables(word) {
        word = word.toLowerCase();
        if (word.length === 0) return 0;

        // Remove common non-syllable endings and handle 'y' at the beginning
        word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, ''); // e.g., 'likes' -> 'lik', 'table' -> 'tabl'
        word = word.replace(/^y/, ''); // e.g., 'yellow' -> 'ellow'

        let count = 0;
        const vowels = "aeiouy";
        let inVowelGroup = false;

        // Count contiguous vowel groups
        for (let i = 0; i < word.length; i++) {
            if (vowels.includes(word[i])) {
                if (!inVowelGroup) {
                    count++;
                    inVowelGroup = true;
                }
            } else {
                inVowelGroup = false;
            }
        }

        // Special cases for words like "the", "a" that might result in 0 syllables after replacements
        if (count === 0 && vowels.includes(word[word.length - 1])) {
            count = 1;
        }

        return Math.max(1, count); // Ensure at least 1 syllable per word
    }

    function calculateReadability(rawText) {
        // For sentence counting, we use the original text to correctly identify punctuation boundaries.
        const totalSentences = countSentences(rawText);

        // For word, character, and syllable counting, we clean the text:
        // 1. Remove non-alphabetic characters (except apostrophes) and normalize whitespace.
        //    This prevents numbers, special symbols, etc., from being counted as part of words/chars.
        const cleanedTextForWords = rawText.replace(/[^a-zA-Z\s']/g, '').replace(/\s+/g, ' ').trim();
        const wordsArray = cleanedTextForWords.split(/\s+/).filter(word => word.length > 0);
        const totalWords = wordsArray.length;

        // Count characters in the cleaned word text (excluding spaces)
        const totalCharacters = cleanedTextForWords.replace(/\s/g, '').length;

        let totalSyllables = 0;
        let polysyllabicWords = 0; // Words with 3 or more syllables

        wordsArray.forEach(word => {
            const syllables = countSyllables(word);
            totalSyllables += syllables;
            if (syllables >= 3) {
                polysyllabicWords++;
            }
        });

        // Ensure no division by zero for very short or empty texts
        const avgSentenceLength = totalWords / Math.max(1, totalSentences); // Words per sentence
        const avgSyllablesPerWord = totalSyllables / Math.max(1, totalWords); // Syllables per word
        const avgCharactersPerWord = totalCharacters / Math.max(1, totalWords); // Characters per word

        let fkReadingEase = "N/A";
        let fkGradeLevel = "N/A";
        let ari = "N/A";
        let smog = "N/A";

        // Flesch-Kincaid Reading Ease and Grade Level, and ARI require at least one word and one sentence
        if (totalWords > 0 && totalSentences > 0) {
            // Flesch-Kincaid Reading Ease Formula
            fkReadingEase = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
            fkReadingEase = fkReadingEase.toFixed(2);

            // Flesch-Kincaid Grade Level Formula
            fkGradeLevel = (0.39 * avgSentenceLength) + (11.8 * avgSyllablesPerWord) - 15.59;
            fkGradeLevel = fkGradeLevel.toFixed(2);

            // Automated Readability Index (ARI) Formula
            ari = (4.71 * avgCharactersPerWord) + (0.5 * avgSentenceLength) - 21.43;
            ari = ari.toFixed(2);
        }

        // SMOG Index (requires at least 30 sentences for best accuracy)
        // If fewer than 30 sentences, it projects polysyllables to 30 sentences for calculation.
        if (totalSentences >= 1) { // We can attempt SMOG with at least one sentence, though accuracy is low below 30
            let effectivePolysyllables = polysyllabicWords;
            if (totalSentences < 30 && totalSentences > 0) {
                 // Project polysyllable count to 30 sentences for SMOG formula
                 effectivePolysyllables = (polysyllabicWords / totalSentences) * 30;
            } else if (totalSentences === 0) {
                effectivePolysyllables = 0; // No sentences means no polysyllables for SMOG
            }

            // SMOG formula only makes sense with some polysyllables (or projected polysyllables)
            if (effectivePolysyllables > 0 || polysyllabicWords > 0) {
                smog = 1.043 * Math.sqrt(effectivePolysyllables) + 3.1291;
                smog = smog.toFixed(2);
            }
        }

        return {
            totalWords: totalWords,
            totalSentences: totalSentences,
            totalCharacters: totalCharacters,
            totalSyllables: totalSyllables,
            polysyllabicWords: polysyllabicWords,
            fkReadingEase: fkReadingEase,
            fkGradeLevel: fkGradeLevel,
            ari: ari,
            smog: smog
        };
    }

    function displayResults(scores) {
        wordCountSpan.textContent = scores.totalWords;
        fkReadingEaseSpan.textContent = scores.fkReadingEase;
        fkGradeLevelSpan.textContent = scores.fkGradeLevel;
        ariSpan.textContent = scores.ari;
        smogSpan.textContent = scores.smog;

        // Optional: Color Flesch-Kincaid Reading Ease score based on its value
        if (scores.fkReadingEase !== "N/A") {
            const ease = parseFloat(scores.fkReadingEase);
            if (ease >= 90) fkReadingEaseSpan.style.color = '#28a745'; // Very Easy
            else if (ease >= 70) fkReadingEaseSpan.style.color = '#17a2b8'; // Easy
            else if (ease >= 60) fkReadingEaseSpan.style.color = '#ffc107'; // Fairly Easy
            else if (ease >= 50) fkReadingEaseSpan.style.color = '#fd7e14'; // Difficult
            else fkReadingEaseSpan.style.color = '#dc3545'; // Very Difficult
        } else {
             fkReadingEaseSpan.style.color = '#333'; // Default color
        }

        // Set default color for other scores (or clear dynamic colors)
        fkGradeLevelSpan.style.color = '#28a745';
        ariSpan.style.color = '#28a745';
        smogSpan.style.color = '#28a745';
    }

    textInput.addEventListener('input', () => {
        const text = textInput.value;
        if (text.trim().length === 0) {
            // Reset results if text area is empty
            displayResults({
                totalWords: 0,
                fkReadingEase: "N/A",
                fkGradeLevel: "N/A",
                ari: "N/A",
                smog: "N/A"
            });
            return;
        }
        const scores = calculateReadability(text);
        displayResults(scores);
    });

    // Initial calculation to set default 'N/A' values on page load
    textInput.dispatchEvent(new Event('input'));
});
