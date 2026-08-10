document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const analyzeButton = document.getElementById('analyzeButton');

    const fleschKincaidDisplay = document.getElementById('fleschKincaid');
    const ariDisplay = document.getElementById('ari');
    const smogDisplay = document.getElementById('smog');
    const gunningFogDisplay = document.getElementById('gunningFog');

    const wordCountDisplay = document.getElementById('wordCount');
    const sentenceCountDisplay = document.getElementById('sentenceCount');
    const avgSyllablesDisplay = document.getElementById('avgSyllables');
    const charCountDisplay = document.getElementById('charCount');

    analyzeButton.addEventListener('click', analyzeText);

    function analyzeText() {
        const text = textInput.value;
        if (!text.trim()) {
            resetDisplays();
            alert('Please enter some text to analyze.');
            return;
        }

        // Basic cleaning for word/sentence tokenization. Keeps common punctuation.
        const cleanedText = text.replace(/[^a-zA-Z0-9\s.,!?;:'"-]/g, ''); 
        const words = cleanedText.match(/\b\w+\b/g) || []; // Matches words composed of letters/numbers
        const sentences = cleanedText.split(/[.!?]\s*|\n+/).filter(s => s.trim().length > 0); // Split by common terminators or newlines

        const totalWords = words.length;
        const totalSentences = sentences.length;
        let totalSyllables = 0;
        let totalPolysyllables = 0; // Words with 3+ syllables

        words.forEach(word => {
            const syllables = countSyllables(word);
            totalSyllables += syllables;
            if (syllables >= 3) {
                totalPolysyllables++;
            }
        });

        // Count alphanumeric characters only, excluding spaces, for ARI
        const totalCharacters = text.replace(/\s/g, '').replace(/[^a-zA-Z0-9]/g, '').length; 

        // --- Update Basic Stats --- 
        wordCountDisplay.textContent = totalWords;
        sentenceCountDisplay.textContent = totalSentences;
        avgSyllablesDisplay.textContent = totalWords > 0 ? (totalSyllables / totalWords).toFixed(2) : '0';
        charCountDisplay.textContent = totalCharacters;

        // Handle empty input for formulas
        if (totalWords === 0 || totalSentences === 0) {
            fleschKincaidDisplay.textContent = '--';
            ariDisplay.textContent = '--';
            smogDisplay.textContent = '--';
            gunningFogDisplay.textContent = '--';
            return;
        }

        // --- Readability Formulas --- 

        // Flesch-Kincaid Grade Level
        // FKRA = (0.39 * ASL) + (11.8 * ASW) - 15.59
        // ASL = Average Sentence Length (words / sentences)
        // ASW = Average Syllables per Word (syllables / words)
        const avgSentenceLength = totalWords / totalSentences;
        const avgSyllablesPerWord = totalSyllables / totalWords;
        const fleschKincaid = (0.39 * avgSentenceLength) + (11.8 * avgSyllablesPerWord) - 15.59;
        fleschKincaidDisplay.textContent = fleschKincaid.toFixed(2);

        // Automated Readability Index (ARI)
        // ARI = 4.71 * (characters / words) + 0.5 * (words / sentences) - 21.43
        // Characters here refers to alphanumeric characters, not including spaces.
        const avgCharactersPerWord = totalCharacters / totalWords;
        const ari = (4.71 * avgCharactersPerWord) + (0.5 * avgSentenceLength) - 21.43;
        ariDisplay.textContent = ari.toFixed(2);

        // SMOG Index
        // SMOG = 1.043 * sqrt(polysyllableCount * (30 / sentenceCount)) + 3.1291
        // Note: SMOG is typically recommended for text with at least 30 sentences for accuracy.
        let smog;
        if (totalSentences > 0) { // Can't divide by zero sentences
             smog = 1.043 * Math.sqrt(totalPolysyllables * (30 / totalSentences)) + 3.1291;
             smogDisplay.textContent = smog.toFixed(2);
        } else {
            smogDisplay.textContent = 'N/A';
        }
        
        // Gunning Fog Index
        // GFI = 0.4 * ((words / sentences) + 100 * (polysyllables / words))
        const gunningFog = 0.4 * (avgSentenceLength + (100 * (totalPolysyllables / totalWords)));
        gunningFogDisplay.textContent = gunningFog.toFixed(2);
    }

    // Heuristic syllable counter (simplified for conciseness and vanilla JS)
    function countSyllables(word) {
        word = word.toLowerCase();
        if (word.length === 0) return 0;

        word = word.replace(/[^a-z]/g, ''); // Remove non-alphabetic characters
        if (word.length === 0) return 0;

        let count = 0;
        const vowels = "aeiouy";
        let isPrevVowel = false;

        // Count vowel groups
        for (let i = 0; i < word.length; i++) {
            if (vowels.includes(word[i])) {
                if (!isPrevVowel) {
                    count++;
                }
                isPrevVowel = true;
            } else {
                isPrevVowel = false;
            }
        }

        // Adjust for silent 'e' at the end of words (e.g., "make" -> 1, not 2)
        // but not for words like "bee" or if 'e' is preceded by another vowel (e.g., "canoe")
        if (word.endsWith("e") && count > 1 && !vowels.includes(word[word.length - 2])) {
            count--;
        }

        // Ensure at least one syllable for any valid word
        return Math.max(1, count);
    }

    // Resets all display elements to their default state
    function resetDisplays() {
        fleschKincaidDisplay.textContent = '--';
        ariDisplay.textContent = '--';
        smogDisplay.textContent = '--';
        gunningFogDisplay.textContent = '--';
        wordCountDisplay.textContent = '0';
        sentenceCountDisplay.textContent = '0';
        avgSyllablesDisplay.textContent = '0';
        charCountDisplay.textContent = '0';
    }
});
