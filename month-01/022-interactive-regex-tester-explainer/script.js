// Get DOM elements
const regexPatternInput = document.getElementById('regexPattern');
const regexFlagsInput = document.getElementById('regexFlags');
const testStringInput = document.getElementById('testString');
const highlightedOutput = document.getElementById('highlightedOutput');
const matchListOutput = document.getElementById('matchList');
const regexExplanationOutput = document.getElementById('regexExplanation');

// Function to generate a basic regex explanation (simplified)
function explainRegex(pattern) {
    if (!pattern) {
        return "<p>Enter a regex pattern to see an explanation.</p>";
    }
    let explanation = `<p>This regex pattern: <code>${pattern}</code></p>`;
    explanation += '<ul>';

    if (pattern.includes('\\b')) {
        explanation += '<li><code>\\b</code>: Matches a word boundary.</li>';
    }
    if (pattern.includes('\\d')) {
        explanation += '<li><code>\\d</code>: Matches any digit (0-9).</li>';
    }
    if (pattern.includes('\\w')) {
        explanation += '<li><code>\\w</code>: Matches any word character (alphanumeric + underscore).</li>';
    }
    if (pattern.includes('\\s')) {
        explanation += '<li><code>\\s</code>: Matches any whitespace character.</li>';
    }
    if (pattern.includes('.')) {
        explanation += '<li><code>.</code>: Matches any character (except newline).</li>';
    }
    if (pattern.includes('*')) {
        explanation += '<li><code>*</code>: Matches the preceding element zero or more times.</li>';
    }
    if (pattern.includes('+')) {
        explanation += '<li><code>+</code>: Matches the preceding element one or more times.</li>';
    }
    if (pattern.includes('?')) {
        explanation += '<li><code>?</code>: Matches the preceding element zero or one time (also makes quantifiers lazy).</li>';
    }
    if (pattern.includes('|')) {
        explanation += '<li><code>|</code>: Acts as an OR operator.</li>';
    }
    if (pattern.includes('^')) {
        explanation += '<li><code>^</code>: Matches the beginning of the string (or line with <code>m</code> flag).</li>';
    }
    if (pattern.includes('$')) {
        explanation += '<li><code>$</code>: Matches the end of the string (or line with <code>m</code> flag).</li>';
    }
    if (pattern.match(/\[.*?\]/)) {
        explanation += '<li><code>[...]</code>: Matches any one of the characters inside the brackets.</li>';
    }
    if (pattern.match(/\(.*?\)/)) {
        explanation += '<li><code>(...)</code>: Creates a capturing group.</li>';
    }
    if (pattern.match(/\{(\d+)(,\d*)?\}/)) {
        explanation += '<li><code>{n,m}</code>: Matches the preceding element at least n and at most m times.</li>';
    }

    // Check if only the base explanation was added
    if (explanation === `<p>This regex pattern: <code>${pattern}</code></p><ul>`) {
        explanation += '<li>No specific common regex elements detected for a detailed explanation.</li>';
    }
    explanation += '</ul>';
    return explanation;
}

// Helper to escape HTML characters to prevent XSS and ensure plain text display
function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

// Main function to update results
function updateResults() {
    const pattern = regexPatternInput.value;
    const flags = regexFlagsInput.value;
    const testString = testStringInput.value;

    // Clear previous outputs
    highlightedOutput.innerHTML = '';
    matchListOutput.innerHTML = '';
    regexExplanationOutput.innerHTML = explainRegex(pattern);

    if (!pattern) {
        highlightedOutput.textContent = 'Enter a regex pattern.';
        matchListOutput.innerHTML = '<li>Enter a regex pattern.</li>';
        return;
    }

    let regex;
    try {
        regex = new RegExp(pattern, flags);
    } catch (e) {
        highlightedOutput.innerHTML = `<span style="color: red;">Invalid Regex: ${escapeHtml(e.message)}</span>`;
        matchListOutput.innerHTML = `<li><span style="color: red;">Invalid Regex: ${escapeHtml(e.message)}</span></li>`;
        return;
    }

    if (!testString) {
        highlightedOutput.textContent = 'Enter a test string.';
        matchListOutput.innerHTML = '<li>Enter a test string.</li>';
        return;
    }

    const matches = [...testString.matchAll(regex)];

    // Highlighted Output
    let highlightedHtml = '';
    let lastIndex = 0;
    if (matches.length > 0) {
        matches.forEach(match => {
            const startIndex = match.index;
            const endIndex = match.index + match[0].length;

            // Add text before the match
            highlightedHtml += escapeHtml(testString.substring(lastIndex, startIndex));
            // Add the highlighted match
            highlightedHtml += `<span class="highlight">${escapeHtml(match[0])}</span>`;
            lastIndex = endIndex;
        });
        // Add any remaining text after the last match
        highlightedHtml += escapeHtml(testString.substring(lastIndex));
    } else {
        highlightedHtml = escapeHtml(testString); // Display original string if no matches
    }
    highlightedOutput.innerHTML = highlightedHtml || 'No matches found.';

    // Match List
    if (matches.length > 0) {
        matchListOutput.innerHTML = matches.map(match => `<li><code>${escapeHtml(match[0])}</code> (Index: ${match.index})</li>`).join('');
    } else {
        matchListOutput.innerHTML = '<li>No matches found.</li>';
    }
}


// Event listeners
regexPatternInput.addEventListener('input', updateResults);
regexFlagsInput.addEventListener('input', updateResults);
testStringInput.addEventListener('input', updateResults);

// Initial update on page load with default values for demonstration
regexPatternInput.value = '\\b[aeiouAEIOU]\\w*\\b';
regexFlagsInput.value = 'gi';
testStringInput.value = 'The quick brown fox jumps over the lazy dog. Apple, orange, banana.';
updateResults();
