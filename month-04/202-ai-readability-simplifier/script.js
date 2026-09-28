document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const fleschKincaidScoreSpan = document.getElementById('fleschKincaidScore');
    const readabilityEaseSpan = document.getElementById('readabilityEase');
    const simplificationOutputDiv = document.getElementById('simplificationOutput');

    analyzeBtn.addEventListener('click', () => {
        const text = textInput.value.trim();
        if (!text) {
            alert('Please enter some text to analyze.');
            return;
        }

        // Perform readability analysis
        const { fleschKincaid, ease } = calculateReadability(text);
        fleschKincaidScoreSpan.textContent = fleschKincaid.toFixed(2);
        readabilityEaseSpan.textContent = ease;

        // Simulate AI simplification
        const aiSuggestions = generateAISimplifications(text);
        simplificationOutputDiv.innerHTML = aiSuggestions;
    });

    // --- Readability Calculation Functions ---

    // Basic syllable counter (heuristic, not perfectly accurate for all English words).
    // This function approximates syllables by counting vowel groups and applying common rules.
    function countSyllables(word) {
        word = word.toLowerCase();
        if (word.length === 0) return 0;
        if (word.length <= 2) return 1; // e.g., 'a', 'to', 'me'

        let count = 0;
        const vowels = 'aeiouy';
        let prevCharIsVowel = false;

        // Count vowel groups
        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            const isVowel = vowels.includes(char);

            if (isVowel && !prevCharIsVowel) {
                count++;
            }
            prevCharIsVowel = isVowel;
        }

        // Adjustments for common English patterns
        // Subtract 1 if word ends in a silent 'e' and has more than one syllable (e.g., 'make', 'drive')
        // but not if it's the only vowel or part of a common vowel group ending.
        if (word.endsWith('e') && count > 1 && !['aie', 'oie', 'iie', 'uie', 'eie'].some(group => word.endsWith(group))) {
            count--;
        }

        // Ensure at least one syllable for any valid word (e.g., 'rhythm', 'strength')
        if (count === 0) count = 1;

        return count;
    }

    function countWords(text) {
        // Uses a regex to find word characters, robustly handles punctuation.
        return (text.match(/\b\w+\b/g) || []).length;
    }

    function countSentences(text) {
        // Sentences typically end with ., !, or ? followed by whitespace or end of string.
        // Filters out empty matches that might result from multiple terminators or trailing whitespace.
        return (text.split(/[.!?]+\s*/).filter(sentence => sentence.trim().length > 0)).length;
    }

    function calculateReadability(text) {
        const totalWords = countWords(text);
        const totalSentences = countSentences(text);
        let totalSyllables = 0;

        if (totalWords === 0) {
            return { fleschKincaid: 0, ease: 'Very Difficult' };
        }

        const words = text.match(/\b\w+\b/g) || [];
        for (const word of words) {
            totalSyllables += countSyllables(word);
        }

        // Flesch-Kincaid Grade Level Formula:
        // 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59
        let fleschKincaid = 0;
        if (totalSentences > 0 && totalWords > 0) {
            fleschKincaid = 0.39 * (totalWords / totalSentences) + 11.8 * (totalSyllables / totalWords) - 15.59;
        } else if (totalWords > 0) {
             // If no sentences but words exist (e.g., a single long phrase), assume difficult
            fleschKincaid = 20; // Arbitrary high value
        } else {
             fleschKincaid = 0; // No text, no score
        }

        let ease = 'N/A';
        if (fleschKincaid < 6) ease = 'Very Easy (Elementary)';
        else if (fleschKincaid < 8) ease = 'Easy (Middle School)';
        else if (fleschKincaid < 10) ease = 'Fairly Easy (High School)';
        else if (fleschKincaid < 13) ease = 'Standard (College)';
        else if (fleschKincaid < 16) ease = 'Fairly Difficult (Graduate)';
        else ease = 'Very Difficult (Professional)';

        return { fleschKincaid, ease };
    }

    // --- AI Simplification Simulation ---

    // This function simulates AI suggestions using predefined rules and word replacements.
    // In a real application, this would involve a call to a Natural Language Processing API.
    function generateAISimplifications(text) {
        let suggestions = [];
        let simplifiedText = text;

        // Rule 1: Replace complex words with simpler synonyms
        const replacements = {
            'ameliorate': 'improve',
            'ubiquitous': 'widespread',
            'plethora': 'a lot of',
            'endeavor': 'try',
            'utilize': 'use',
            'commence': 'start',
            'subsequently': 'later',
            'consequently': 'as a result',
            'demonstrate': 'show',
            'facilitate': 'help',
            'numerous': 'many',
            'approximately': 'about',
            'sufficient': 'enough',
            'prioritize': 'focus on',
            'disseminate': 'share',
            'implement': 'put into practice',
            'nevertheless': 'however'
        };

        for (const [complex, simple] of Object.entries(replacements)) {
            // Use regex with word boundaries to avoid replacing parts of other words
            const regex = new RegExp(`\\b${complex}\\b`, 'gi');
            if (text.match(regex)) {
                suggestions.push(`Consider replacing "${complex}" with "${simple}".`);
                simplifiedText = simplifiedText.replace(regex, simple);
            }
        }

        // Rule 2: Suggest breaking down long sentences
        const sentences = text.split(/[.!?]+/);
        let longSentenceCount = 0;
        sentences.forEach(s => {
            const wordsInSentence = s.trim().split(/\s+/).filter(word => word.length > 0).length;
            if (wordsInSentence > 25) {
                longSentenceCount++;
            }
        });

        if (longSentenceCount > 0) {
            suggestions.push(`You have ${longSentenceCount} very long sentence(s). Try breaking them into shorter, more focused sentences.`);
        }

        // Rule 3: Suggest active voice for passive constructions (very simple heuristic)
        // This is a very rudimentary check and far from comprehensive.
        if (text.match(/is been|was been|has been|had been|will be been|is being|was being/gi)) {
             suggestions.push(`Review for passive voice constructions (e.g., "was done by") and rephrase them into active voice for directness.`);
        }

        // Rule 4: Suggest avoiding jargon or acronyms (if detected - simulated)
        const jargonWords = ['proprietary solution', 'synergy', 'paradigm shift', 'bandwidth', 'leverage', 'optimize'];
        let jargonDetected = false;
        for (const jargon of jargonWords) {
            if (text.toLowerCase().includes(jargon)) {
                jargonDetected = true;
                break;
            }
        }
        if (jargonDetected) {
            suggestions.push(`Consider simplifying any jargon or technical terms. If acronyms are used, ensure they are explained.`);
        }

        // Final advice if no specific issues, or general tips
        if (suggestions.length === 0) {
            suggestions.push('Your text appears to be quite clear already! Focus on your target audience and specific communication goals for any further refinements.');
        } else {
             suggestions.push('Always keep your target audience in mind when making changes. The goal is clarity and accessibility.');
        }

        let outputHtml = '<h3>Revised Text Snippets (AI Simulation):</h3>';
        outputHtml += `<p class="simplified-text-preview">${simplifiedText}</p>`;
        outputHtml += '<h3>Specific Recommendations:</h3><ul>';
        suggestions.forEach(suggestion => {
            outputHtml += `<li>${suggestion}</li>`;
        });
        outputHtml += '</ul>';

        return outputHtml;
    }
});
