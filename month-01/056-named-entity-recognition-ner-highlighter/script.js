document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const highlightBtn = document.getElementById('highlightBtn');
    const highlightedTextDiv = document.getElementById('highlightedText');

    // Simulated NER entity lists
    // In a real application, this would involve a more sophisticated NLP model
    // (e.g., a backend service or a client-side library like compromise.js).
    const entities = {
        person: [
            'John Doe', 'Jane Smith', 'Alice', 'Bob', 'Mary', 'David', 'Sarah', 'Michael', 'Emily', 'William',
            'Mr. Smith', 'Dr. Jones', 'President Trump', 'Joe Biden', 'Elon Musk', 'Bill Gates'
        ],
        organization: [
            'Google', 'Apple', 'Microsoft', 'Amazon', 'Facebook', 'OpenAI', 'NASA', 'IBM', 'Tesla',
            'United Nations', 'WHO', 'NATO', 'SpaceX', 'Acme Corp'
        ],
        location: [
            'New York', 'London', 'Paris', 'Tokyo', 'Berlin', 'Rome', 'Sydney', 'California', 'United States',
            'France', 'Germany', 'Japan', 'Earth', 'Mars', 'Europe', 'Asia', 'Africa', 'America', 'Oceania',
            'Washington D.C.', 'Silicon Valley'
        ],
        date: [
            'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December',
            'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
            'today', 'tomorrow', 'yesterday', 'next week', 'last month', '2023', '2024', '1990s'
        ]
    };

    /**
     * Escapes HTML entities in a string to prevent XSS.
     * @param {string} text The string to escape.
     * @returns {string} The escaped string.
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    /**
     * Highlights detected entities in the given text.
     * @param {string} text The raw text input from the user.
     * @returns {string} The HTML string with highlighted entities.
     */
    function highlightEntities(text) {
        // First, escape the entire user input to prevent XSS issues.
        // This ensures any user-entered HTML is rendered as text, not executed.
        let highlightedHtml = escapeHtml(text);

        for (const type in entities) {
            if (entities.hasOwnProperty(type)) {
                const keywords = entities[type];
                // Sort keywords by length in descending order to match longer phrases first
                // (e.g., 'New York' before 'New')
                keywords.sort((a, b) => b.length - a.length);

                keywords.forEach(keyword => {
                    // Escape special characters in the keyword to use it safely in a regex
                    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\\]]/g, '\\$&');
                    // Create a regex for the keyword, ensuring word boundaries and case-insensitivity.
                    // `g` for global (all occurrences), `i` for case-insensitive.
                    // The `\b` ensures we match whole words/phrases.
                    const regex = new RegExp(`\\b(${escapedKeyword})\\b`, 'gi');

                    highlightedHtml = highlightedHtml.replace(regex, (match) => {
                        // Wrap the matched entity with a span and appropriate classes.
                        // `match` contains the exact text that was found (respecting case in original text).
                        return `<span class="entity ${type}">${match}</span>`;
                    });
                });
            }
        }
        return highlightedHtml;
    }

    highlightBtn.addEventListener('click', () => {
        const userText = inputText.value;
        if (userText.trim() === '') {
            highlightedTextDiv.innerHTML = '<p>Please enter some text to highlight.</p>';
            return;
        }
        const resultHtml = highlightEntities(userText);
        highlightedTextDiv.innerHTML = resultHtml;
    });

    // Set initial content for the highlighted text area
    highlightedTextDiv.innerHTML = '<p>No text highlighted yet. Try pasting some text!</p>';
});
