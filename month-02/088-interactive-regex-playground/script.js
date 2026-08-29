document.addEventListener('DOMContentLoaded', () => {
    const regexPatternInput = document.getElementById('regexPattern');
    const sampleTextInput = document.getElementById('sampleText');
    const matchedTextOutput = document.getElementById('matchedTextOutput');
    const matchList = document.getElementById('matchList');
    const regexError = document.getElementById('regexError');

    // Helper to escape HTML to prevent XSS issues when displaying user input
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    function updatePlayground() {
        const fullPattern = regexPatternInput.value;
        const text = sampleTextInput.value;

        // Clear previous outputs
        matchedTextOutput.innerHTML = '';
        matchList.innerHTML = '';
        regexError.textContent = '';

        if (!fullPattern) {
            matchedTextOutput.innerHTML = 'Enter a regex pattern.';
            return;
        }

        let pattern; // The regex pattern itself
        let flags = 'g'; // Default to global flag

        // Check if pattern includes flags like /pattern/flags
        const regexWithFlagsMatch = fullPattern.match(/^\/(.*)\/([a-z]*)$/);
        if (regexWithFlagsMatch) {
            pattern = regexWithFlagsMatch[1];
            flags += regexWithFlagsMatch[2]; // Append user-defined flags
            // Remove duplicate flags (e.g., if 'g' is in user flags and default)
            flags = Array.from(new Set(flags.split(''))).join('');
        } else {
            pattern = fullPattern;
        }

        let regex;
        try {
            regex = new RegExp(pattern, flags);
        } catch (e) {
            regexError.textContent = `Invalid Regex: ${e.message}`;
            return;
        }

        let highlightedHtml = '';
        let lastIndex = 0;
        const matchesFound = [];

        // String.prototype.matchAll returns an iterator of all matches
        const allMatches = text.matchAll(regex);

        for (const match of allMatches) {
            const fullMatch = match[0];
            const startIndex = match.index;
            const endIndex = startIndex + fullMatch.length;

            // Add the text before the current match, escaped
            highlightedHtml += escapeHtml(text.substring(lastIndex, startIndex));
            // Add the matched text wrapped in a span, escaped
            highlightedHtml += `<span class="match">${escapeHtml(fullMatch)}</span>`;
            lastIndex = endIndex;

            matchesFound.push(match);
        }

        // Add any remaining text after the last match, escaped
        highlightedHtml += escapeHtml(text.substring(lastIndex));

        if (matchesFound.length === 0) {
            matchedTextOutput.innerHTML = highlightedHtml || 'No matches found.';
            matchList.innerHTML = '<li>No matches.</li>';
        } else {
            matchedTextOutput.innerHTML = highlightedHtml;
            // Populate the list of matches
            matchList.innerHTML = matchesFound.map(m => {
                const fullMatch = m[0];
                // Extract all captured groups (m[1], m[2]...)
                const groups = Array.from(m).slice(1).map((g, i) => 
                    g !== undefined ? `Group ${i + 1}: "${escapeHtml(g)}"` : `Group ${i + 1}: (undefined)`
                );
                
                let listItemContent = `<li><strong>Full Match: "${escapeHtml(fullMatch)}"</strong> (Index: ${m.index})`;
                if (groups.length > 0) {
                    listItemContent += `<br><span>${groups.join(', ')}</span>`;
                }
                listItemContent += `</li>`;
                return listItemContent;
            }).join('');
        }
    }

    // Initial update when the page loads with default values
    updatePlayground();

    // Event listeners for real-time updates on input change
    regexPatternInput.addEventListener('input', updatePlayground);
    sampleTextInput.addEventListener('input', updatePlayground);
});
