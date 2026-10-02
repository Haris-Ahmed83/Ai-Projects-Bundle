document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const generateBtn = document.getElementById('generateBtn');
    const flashcardsContainer = document.getElementById('flashcardsContainer');

    generateBtn.addEventListener('click', () => {
        const text = inputText.value.trim();
        if (!text) {
            alert('Please enter some text to generate flashcards.');
            return;
        }

        const flashcards = generateFlashcards(text);
        displayFlashcards(flashcards);
    });

    function generateFlashcards(text) {
        // --- SIMULATED AI/NLP LOGIC --- 
        // In a real application, this would involve an API call to a Large Language Model (LLM).
        // For this client-side demo, we'll do a very basic extraction using heuristics.
        const sentences = text.split(/[.!?\n]/).filter(s => s.trim().length > 20); // Filter out very short sentences
        const generatedCards = [];

        sentences.forEach((sentence, index) => {
            let trimmedSentence = sentence.trim();
            if (trimmedSentence.length < 15) return; // Skip very short sentences after trimming

            let term = '';
            let definition = trimmedSentence;

            const words = trimmedSentence.split(/\s+/).filter(w => w.length > 0);

            if (words.length === 0) return;

            // Heuristic 1: Look for capitalized phrases/acronyms at the beginning as a potential term
            let potentialTermWords = [];
            for (let i = 0; i < Math.min(words.length, 6); i++) { // Look at first up to 6 words
                const word = words[i];
                // Check if word starts with uppercase, or is an acronym (e.g., "AI", "ML")
                if (word.length > 0 && (word[0] === word[0].toUpperCase() || word.match(/^[A-Z]{2,}$/))) {
                    potentialTermWords.push(word);
                } else if (potentialTermWords.length > 0) { // Stop if a non-capitalized word is encountered after a capitalized one
                    break;
                }
            }

            if (potentialTermWords.length > 0) {
                term = potentialTermWords.join(' ');
                let termEndIndex = trimmedSentence.indexOf(term) + term.length;
                let remainingSentence = trimmedSentence.substring(termEndIndex).trim();

                // Check for acronym immediately after the term, e.g., "Artificial Intelligence (AI)"
                const acronymMatch = remainingSentence.match(/^\s*\(([A-Z]{2,})\)/);
                if (acronymMatch) {
                    term += acronymMatch[0]; // Add "(AI)" to the term
                    remainingSentence = remainingSentence.substring(acronymMatch[0].length).trim();
                }

                if (remainingSentence.length > 10) { 
                    definition = remainingSentence;
                } else { // Fallback if remaining is too short to be a good definition
                    term = words.slice(0, Math.min(words.length, 4)).join(' '); // Use first few words as term
                    definition = trimmedSentence; // Use full sentence as definition
                }
            } else {
                // Heuristic 2: No obvious capitalized phrase, use first few words as term
                term = words.slice(0, Math.min(words.length, 4)).join(' ');
                definition = trimmedSentence;
            }

            // Final clean up and fallback for term and definition
            term = term.replace(/[,.;]$/, '').trim(); // Remove trailing punctuation
            definition = definition.replace(/[,.;]$/, '').trim();

            // Ensure minimum length and avoid identical term/definition
            if (term.length < 5 || definition.length < 10 || term === definition) {
                term = words.slice(0, Math.min(words.length, 5)).join(' ');
                definition = trimmedSentence; // Reset definition to full sentence for robustness
            }

            // If still no good term (e.g., empty or common words), use a generic one
            if (term.length === 0 || ['is', 'are', 'the', 'and'].includes(term.toLowerCase())) {
                term = `Concept ${index + 1}`;
                definition = trimmedSentence;
            }
            if (definition.length === 0) {
                definition = `Details for ${term}`;
            }
            
            generatedCards.push({ term, definition });
        });

        // If no reasonable cards were generated from sentences, create a generic one from the whole text
        if (generatedCards.length === 0 && text.length > 0) {
            generatedCards.push({
                term: "Main Idea/Summary",
                definition: text.substring(0, Math.min(text.length, 250)) + (text.length > 250 ? '...' : '')
            });
        }

        return generatedCards;
    }

    function displayFlashcards(flashcards) {
        flashcardsContainer.innerHTML = ''; // Clear previous flashcards

        if (flashcards.length === 0) {
            flashcardsContainer.innerHTML = '<p class="disclaimer">No flashcards could be generated from the provided text. Please try more detailed or structured text.</p>';
            return;
        }

        flashcards.forEach(card => {
            const flashcardEl = document.createElement('div');
            flashcardEl.classList.add('flashcard');

            const flashcardInner = document.createElement('div');
            flashcardInner.classList.add('flashcard-inner');

            const flashcardFront = document.createElement('div');
            flashcardFront.classList.add('flashcard-front');
            flashcardFront.innerHTML = `<h3>${card.term}</h3>`;

            const flashcardBack = document.createElement('div');
            flashcardBack.classList.add('flashcard-back');
            flashcardBack.innerHTML = `<p>${card.definition}</p>`;

            flashcardInner.appendChild(flashcardFront);
            flashcardInner.appendChild(flashcardBack);
            flashcardEl.appendChild(flashcardInner);

            flashcardEl.addEventListener('click', () => {
                flashcardEl.classList.toggle('is-flipped');
            });

            flashcardsContainer.appendChild(flashcardEl);
        });
    }
});
