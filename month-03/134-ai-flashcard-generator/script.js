document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const generateBtn = document.getElementById('generateBtn');
    const flashcardContainer = document.getElementById('flashcardContainer');

    // Example input to help users get started
    inputText.value = `Artificial Intelligence (AI) is a broad branch of computer science.
Its goal is to create machines that are capable of intelligent behavior.
Machine learning is a subset of AI that focuses on systems that learn from data.
Deep learning is a further subset of machine learning that uses neural networks.
Natural Language Processing (NLP) enables computers to understand human language.
Reinforcement learning involves an agent learning to make decisions by trial and error.`;

    generateBtn.addEventListener('click', generateFlashcards);

    function generateFlashcards() {
        const text = inputText.value.trim();
        if (!text) {
            alert('Please enter some text to generate flashcards.');
            return;
        }

        flashcardContainer.innerHTML = ''; // Clear previous flashcards
        const sentences = text.split(/\s*[.!?]+\s*|\n+/).filter(s => s.trim().length > 10); // Split by common sentence terminators or newlines, filter short strings

        if (sentences.length === 0) {
            alert('Could not extract meaningful sentences. Please try different text.');
            return;
        }

        sentences.forEach(sentence => {
            const trimmedSentence = sentence.trim();
            if (trimmedSentence.length === 0) return;

            let question = '';
            let answer = trimmedSentence;

            // Simple AI-like logic to generate Q&A from sentences
            // This is a basic NLP simulation for client-side demo
            const patterns = [
                { regex: /^(.*?) (is|are|was|were) (a|an|the) (.+)/i, qTemplate: 'What $2 $3 $1?', aIndex: 4 },
                { regex: /^(.*?) (is|are|was|were) (.+)/i, qTemplate: 'What $2 $1?', aIndex: 3 },
                { regex: /^(.*?) (means|refers to|defines) (.+)/i, qTemplate: 'What does $1 mean?', aIndex: 3 },
                { regex: /^(.*?) (can|could|may|might|should|would) (.+)/i, qTemplate: 'How can $1 $3?', aIndex: 0 }, // whole sentence as answer
            ];

            let matched = false;
            for (const pattern of patterns) {
                const match = trimmedSentence.match(pattern.regex);
                if (match) {
                    question = pattern.qTemplate.replace(/\$(\d)/g, (m, g1) => match[parseInt(g1)]);
                    if (pattern.aIndex === 0) {
                        answer = trimmedSentence;
                    } else if (pattern.aIndex) {
                        answer = match[pattern.aIndex].trim();
                    }
                    question = capitalizeFirstLetter(question);
                    matched = true;
                    break;
                }
            }

            // Fallback if no specific pattern matched
            if (!matched) {
                // Take the first few words for the question prompt
                const promptWords = trimmedSentence.split(' ').slice(0, 5).join(' ');
                question = `Explain: ${promptWords}${trimmedSentence.length > promptWords.length ? '...' : ''}?`;
            }
            
            createFlashcard(question, answer);
        });

        if (flashcardContainer.children.length === 0) {
            flashcardContainer.innerHTML = '<p>No flashcards could be generated from the provided text. Please ensure it contains clear statements.</p>';
        }
    }

    function createFlashcard(question, answer) {
        const flashcard = document.createElement('div');
        flashcard.classList.add('flashcard');

        const flashcardInner = document.createElement('div');
        flashcardInner.classList.add('flashcard-inner');

        const flashcardFront = document.createElement('div');
        flashcardFront.classList.add('flashcard-front');
        flashcardFront.textContent = question;

        const flashcardBack = document.createElement('div');
        flashcardBack.classList.add('flashcard-back');
        flashcardBack.textContent = answer;

        flashcardInner.appendChild(flashcardFront);
        flashcardInner.appendChild(flashcardBack);
        flashcard.appendChild(flashcardInner);

        flashcard.addEventListener('click', () => {
            flashcard.classList.toggle('is-flipped');
        });

        flashcardContainer.appendChild(flashcard);
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});
