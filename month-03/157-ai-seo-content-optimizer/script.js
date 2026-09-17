document.addEventListener('DOMContentLoaded', () => {
    const contentInput = document.getElementById('contentInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const readabilityScoreElem = document.getElementById('readabilityScore');
    const readabilityGradeElem = document.getElementById('readabilityGrade');
    const wordCountElem = document.getElementById('wordCount');
    const readingTimeElem = document.getElementById('readingTime');
    const keywordListElem = document.getElementById('keywordList');
    const suggestionsListElem = document.getElementById('suggestionsList');

    const STOP_WORDS = new Set([
        'a', 'an', 'the', 'is', 'are', 'was', 'were', 'and', 'or', 'but', 'for', 'nor', 'so', 'yet',
        'at', 'by', 'in', 'on', 'of', 'to', 'from', 'with', 'as', 'it', 'its', 'he', 'she', 'they',
        'we', 'you', 'i', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'our', 'their',
        'this', 'that', 'these', 'those', 'can', 'will', 'would', 'should', 'could', 'be', 'been',
        'being', 'have', 'has', 'had', 'do', 'does', 'did', 'not', 'no', 'don', 't', 's', 'm', 'll', 've', 're', 'd'
    ]);

    // Very basic syllable counting for Flesch-Kincaid approximation
    function countSyllables(word) {
        word = word.toLowerCase();
        if (word.length === 0) return 0;
        // Remove common silent endings
        word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        word = word.replace(/^y/, '');
        let matches = word.match(/[aeiouy]{1,2}/g);
        let count = matches ? matches.length : 0;
        if (count === 0) count = 1; // Ensure at least one syllable
        return count;
    }

    analyzeBtn.addEventListener('click', () => {
        const content = contentInput.value;
        if (content.trim() === '') {
            alert('Please enter some content to analyze.');
            return;
        }

        // Reset previous results
        readabilityScoreElem.textContent = 'N/A';
        readabilityGradeElem.textContent = '';
        wordCountElem.textContent = '0';
        readingTimeElem.textContent = '0 min';
        keywordListElem.innerHTML = '<li>No keywords found.</li>';
        suggestionsListElem.innerHTML = '<li>No suggestions yet.</li>';

        // 1. Word Count
        const words = content.match(/\b\w+\b/g) || [];
        const totalWords = words.length;
        wordCountElem.textContent = totalWords;

        // 2. Reading Time (Average 200 words per minute)
        const readingTimeMinutes = Math.ceil(totalWords / 200);
        readingTimeElem.textContent = `${readingTimeMinutes} min`;

        // 3. Readability (Simplified Flesch-Kincaid Grade Level)
        const sentences = content.split(/[.!?]+\s*|\n+/).filter(s => s.trim().length > 0);
        const totalSentences = sentences.length;
        let totalSyllables = 0;

        for (const word of words) {
            totalSyllables += countSyllables(word);
        }

        let fleschKincaidGrade = 'N/A';
        let readabilityDescription = 'N/A';

        if (totalWords > 0 && totalSentences > 0) {
            fleschKincaidGrade = (0.39 * (totalWords / totalSentences)) + (11.8 * (totalSyllables / totalWords)) - 15.59;
            fleschKincaidGrade = Math.round(fleschKincaidGrade * 10) / 10; // Round to one decimal
            readabilityScoreElem.textContent = fleschKincaidGrade;

            if (fleschKincaidGrade <= 6) readabilityDescription = 'Very Easy (Elementary School)';
            else if (fleschKincaidGrade <= 9) readabilityDescription = 'Easy (Middle School)';
            else if (fleschKincaidGrade <= 12) readabilityDescription = 'Fairly Easy (High School)';
            else if (fleschKincaidGrade <= 16) readabilityDescription = 'Standard (College)';
            else readabilityDescription = 'Difficult (Graduate Level)';

            readabilityGradeElem.textContent = `(${readabilityDescription})`;
        }

        // 4. Keyword Density
        const cleanedWords = words
            .map(word => word.toLowerCase().replace(/[^a-z0-9]/g, '')) // Clean punctuation
            .filter(word => word.length > 2 && !STOP_WORDS.has(word)); // Filter short words and stop words

        const keywordFrequencies = {};
        for (const word of cleanedWords) {
            keywordFrequencies[word] = (keywordFrequencies[word] || 0) + 1;
        }

        const sortedKeywords = Object.entries(keywordFrequencies)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 10); // Top 10 keywords

        keywordListElem.innerHTML = '';
        if (sortedKeywords.length > 0) {
            sortedKeywords.forEach(([keyword, count]) => {
                const density = ((count / totalWords) * 100).toFixed(2);
                const listItem = document.createElement('li');
                listItem.textContent = `${keyword}: ${count} occurrences (${density}%)`;
                keywordListElem.appendChild(listItem);
            });
        } else {
            keywordListElem.innerHTML = '<li>No significant keywords found.</li>';
        }

        // 5. Suggestions for Improvement
        const suggestions = [];

        if (totalWords < 100) {
            suggestions.push('Content is very short. Consider expanding for more depth.');
        }

        if (typeof fleschKincaidGrade === 'number') {
            if (fleschKincaidGrade > 12) {
                suggestions.push('Readability is challenging. Try using shorter sentences and simpler vocabulary.');
            } else if (fleschKincaidGrade < 7) {
                suggestions.push('Readability is very easy. Ensure you maintain appropriate depth for your target audience.');
            }
        }

        if (sortedKeywords.length > 0) {
            const highestDensity = parseFloat(sortedKeywords[0][1] / totalWords * 100);
            if (highestDensity > 5) {
                suggestions.push(`Consider varying your phrasing around '${sortedKeywords[0][0]}' to avoid keyword stuffing.`);
            } else if (highestDensity < 1.5 && totalWords > 200) {
                suggestions.push('Ensure your primary topic keywords are sufficiently present for SEO. Current density seems low.');
            }
        } else if (totalWords > 50) {
            suggestions.push('No clear keywords emerged. Ensure your content has a focused topic.');
        }

        if (totalSentences > 0 && totalWords / totalSentences > 25) {
            suggestions.push('Average sentence length is high. Break down long sentences for better readability.');
        }

        suggestionsListElem.innerHTML = '';
        if (suggestions.length > 0) {
            suggestions.forEach(suggestion => {
                const listItem = document.createElement('li');
                listItem.textContent = suggestion;
                suggestionsListElem.appendChild(listItem);
            });
        } else {
            suggestionsListElem.innerHTML = '<li>Content looks good! Keep up the great work.</li>';
        }
    });
});
