document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const analyzeButton = document.getElementById('analyzeButton');
    const resultDiv = document.getElementById('result');

    // Define entity patterns and their types
    // This is a simplified client-side NER simulation using regex.
    // A real-world application would use a more sophisticated NLP library or API.
    const entityPatterns = [
        { type: 'person', regex: /(John Doe|Alice Smith|Barack Obama|Joe Biden|Elon Musk|Donald Trump|Mary Johnson)/gi },
        { type: 'location', regex: /(New York|London|Paris|Tokyo|Berlin|USA|France|Germany|Japan|California|Texas|Washington D.C.)/gi },
        { type: 'organization', regex: /(Google|Apple|Microsoft|NASA|WHO|UN|IBM|SpaceX|Amazon)/gi },
        { type: 'date', regex: /\b(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{1,2}-\d{1,2}|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},\s+\d{4}|\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)[a-z]*\s+\d{4}|today|yesterday|tomorrow)\b/gi }
    ];

    analyzeButton.addEventListener('click', () => {
        const inputText = textInput.value;
        if (inputText.trim() === '') {
            resultDiv.innerHTML = '<p class="placeholder">Please enter some text to analyze.</p>';
            return;
        }

        let entities = [];

        // Find all entities and store their details (text, type, start, end index)
        entityPatterns.forEach(pattern => {
            // Reset regex lastIndex for consistent results with global flag
            pattern.regex.lastIndex = 0;
            let match;
            while ((match = pattern.regex.exec(inputText)) !== null) {
                entities.push({
                    text: match[0],
                    type: pattern.type,
                    start: match.index,
                    end: match.index + match[0].length
                });
            }
        });

        // Sort entities by their start index to handle overlapping/sequential replacements correctly.
        // If entities overlap, the first one encountered in the sorted list will be highlighted.
        entities.sort((a, b) => a.start - b.start);

        let highlightedHtml = '';
        let lastIndex = 0;

        // Build the HTML string, segment by segment
        entities.forEach(entity => {
            // Add the text before the current entity, escaping potential HTML characters
            highlightedHtml += escapeHtml(inputText.substring(lastIndex, entity.start));
            
            // Add the highlighted entity, escaping its text content
            highlightedHtml += `<span class="entity-${entity.type}">${escapeHtml(entity.text)}</span>`;
            
            lastIndex = entity.end;
        });

        // Add any remaining text after the last entity
        highlightedHtml += escapeHtml(inputText.substring(lastIndex));

        resultDiv.innerHTML = highlightedHtml || '<p class="placeholder">No named entities found.</p>';
    });

    // Helper function to escape HTML special characters
    function escapeHtml(text) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        // Replace multiple characters at once for efficiency
        return text.replace(/[&<>"]'/g, function(m) { return map[m]; });
    }

    // Populate with an initial example text for immediate demonstration
    textInput.value = "John Doe, a representative from Google, traveled from New York to London on March 10, 2023. He plans to meet Alice Smith regarding a new project next Tuesday. The meeting should finalize by 2023-03-20. Barack Obama was also present at the UN summit.";
});
