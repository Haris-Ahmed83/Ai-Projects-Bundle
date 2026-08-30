// Helper function to count syllables in a word (heuristic)
// This is a simplified approach and may not be 100% accurate for all English words.
function countSyllables(word) {
    word = word.toLowerCase();
    if (word.length === 0) return 0;

    // Remove non-alphabetic characters (e.g., 'word!' -> 'word')
    word = word.replace(/[^a-z]/g, '');

    // Handle very short words
    if (word.length <= 3) return 1;

    let count = 0;
    const vowels = 'aeiouy';
    let prevCharIsVowel = false;

    for (let i = 0; i < word.length; i++) {
        const char = word[i];
        const isVowel = vowels.includes(char);

        if (isVowel && !prevCharIsVowel) {
            count++;
        }
        prevCharIsVowel = isVowel;
    }

    // Handle silent 'e' at the end of a word (e.g., 'make' has 1, not 2)
    if (word.endsWith('e') && count > 1 && !vowels.includes(word[word.length - 2])) {
        count--;
    }

    // Handle 'le' endings after a consonant (e.g., 'apple', 'table')
    if (word.endsWith('le') && word.length > 2 && !vowels.includes(word[word.length - 3]) && vowels.includes(word[word.length - 2])) {
        count++;
    }

    return Math.max(1, count); // Ensure every word has at least one syllable
}

// Function to count words
function countWords(text) {
    const words = text.match(/\b\w+\b/g); // Matches words (alphanumeric sequences)
    return words ? words.length : 0;
}

// Function to count sentences
function countSentences(text) {
    // Splits by periods, exclamation marks, question marks, followed by whitespace or end of string
    // The regex /[^.!?]+[.!?]+/g matches full sentences ending in punctuation.
    // The || text.match(/[^.!?]+/g) part handles cases where the text doesn't end with punctuation.
    const sentences = text.match(/[^.!?]+[.!?]+/g) || text.match(/[^.!?\s]+/g);
    // Filter out empty matches that might occur from multiple punctuation marks
    return sentences ? sentences.filter(s => s.trim().length > 0).length : 0;
}

// Function to count complex words (3+ syllables)
function countComplexWords(wordsArray) {
    let complexCount = 0;
    for (const word of wordsArray) {
        // For simplicity, we define a complex word as having 3 or more syllables.
        // A more robust implementation might exclude proper nouns, hyphenated words etc.
        if (countSyllables(word) >= 3) {
            complexCount++;
        }
    }
    return complexCount;
}

// Flesch-Kincaid Readability Score
// FKRA = 206.835 - (1.015 × ASL) - (84.6 × ASW)
// ASL = total words / total sentences (Average Sentence Length)
// ASW = total syllables / total words (Average Syllables per Word)
function calculateFleschKincaid(wordCount, sentenceCount, syllableCount) {
    if (wordCount === 0 || sentenceCount === 0 || syllableCount === 0) return 0;

    const avgSentenceLength = wordCount / sentenceCount;
    const avgSyllablesPerWord = syllableCount / wordCount;

    return 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
}

// Gunning Fog Index
// GFI = 0.4 * ( (words / sentences) + 100 * (complex words / words) )
function calculateGunningFog(wordCount, sentenceCount, complexWordCount) {
    if (wordCount === 0 || sentenceCount === 0) return 0;

    const avgSentenceLength = wordCount / sentenceCount;
    const percentComplexWords = (complexWordCount / wordCount) * 100;

    return 0.4 * (avgSentenceLength + percentComplexWords);
}

// Main analysis function
function analyzeText() {
    const textInput = document.getElementById('textInput');
    const text = textInput.value.trim();

    if (!text) {
        alert('Please enter some text to analyze.');
        // Clear previous results
        document.getElementById('fkScore').textContent = 'N/A';
        document.getElementById('gfScore').textContent = 'N/A';
        document.getElementById('wordCount').textContent = '0';
        document.getElementById('sentenceCount').textContent = '0';
        document.getElementById('syllableCount').textContent = '0';
        document.getElementById('complexWordCount').textContent = '0';
        return;
    }

    // Sanitize text for consistent counting (replace multiple spaces/newlines with single space)
    const sanitizedText = text.replace(/\s+/g, ' ').replace(/(\r\n|\n|\r)/gm, ' ').trim();

    const wordsArray = sanitizedText.match(/\b\w+\b/g) || [];
    const wordCount = wordsArray.length;
    const sentenceCount = countSentences(sanitizedText);

    let totalSyllableCount = 0;
    for (const word of wordsArray) {
        totalSyllableCount += countSyllables(word);
    }

    const complexWordCount = countComplexWords(wordsArray);

    const fleschKincaidScore = calculateFleschKincaid(wordCount, sentenceCount, totalSyllableCount);
    const gunningFogIndex = calculateGunningFog(wordCount, sentenceCount, complexWordCount);

    // Update UI with results
    document.getElementById('fkScore').textContent = fleschKincaidScore.toFixed(2);
    document.getElementById('gfScore').textContent = gunningFogIndex.toFixed(2);
    document.getElementById('wordCount').textContent = wordCount;
    document.getElementById('sentenceCount').textContent = sentenceCount;
    document.getElementById('syllableCount').textContent = totalSyllableCount;
    document.getElementById('complexWordCount').textContent = complexWordCount;
}

// Event Listener for the Analyze button
document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.addEventListener('click', analyzeText);
});
