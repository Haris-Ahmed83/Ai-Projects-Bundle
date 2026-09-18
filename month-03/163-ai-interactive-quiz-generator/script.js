document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const generateQuizBtn = document.getElementById('generateQuizBtn');
    const quizDisplay = document.getElementById('quizDisplay');
    const submitQuizBtn = document.getElementById('submitQuizBtn');
    const quizResults = document.getElementById('quizResults');

    let currentQuiz = []; // Stores the generated quiz data

    // --- Mock AI Quiz Generation --- //
    // This function simulates AI behavior. In a real application, this would be an API call to a backend AI service.
    function generateMockQuiz(text) {
        const quiz = [];
        // Basic sentence splitting and filtering for meaningful sentences
        const sentences = text.split(/[.!?\n]\s*/).filter(s => s.trim().length > 15);

        if (sentences.length === 0) {
            quizDisplay.innerHTML = '<p class="placeholder-text">Please enter some meaningful text to generate a quiz.</p>';
            submitQuizBtn.classList.add('hidden');
            return [];
        }

        const commonWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'and', 'or', 'but', 'in', 'on', 'at', 'for', 'with', 'by', 'of', 'to'];

        // Question 1: Fill-in-the-blank from first suitable sentence
        let sentenceForQ1 = sentences[0];
        if (sentenceForQ1) {
            const words = sentenceForQ1.split(/\s+/).filter(w => w.length > 3 && !commonWords.includes(w.toLowerCase()));
            if (words.length > 0) {
                const wordToHide = words[Math.floor(Math.random() * words.length)];
                const questionText = sentenceForQ1.replace(new RegExp('\b' + wordToHide + '\b', 'i'), '__________');
                quiz.push({
                    id: quiz.length,
                    type: 'fill-in-the-blank',
                    question: questionText.trim(),
                    correctAnswer: wordToHide.trim()
                });
            }
        }

        // Question 2: Multiple Choice from second suitable sentence (or first if only one available/suitable)
        let sentenceForQ2 = sentences[1] || sentences[0];
        if (sentenceForQ2 && sentenceForQ2 !== sentenceForQ1) {
            const words = sentenceForQ2.split(/\s+/).filter(w => w.length > 3 && !commonWords.includes(w.toLowerCase()));
            if (words.length > 0) {
                const wordToChoose = words[Math.floor(Math.random() * words.length)];
                const questionText = `Which word best completes the sentence: "${sentenceForQ2.replace(new RegExp('\b' + wordToChoose + '\b', 'i'), '__________')}"?`;
                // Generate plausible-ish distractors or use hardcoded ones
                const options = shuffleArray([wordToChoose, generateRandomWord(wordToChoose.length), generateRandomWord(wordToChoose.length), generateRandomWord(wordToChoose.length)]);
                quiz.push({
                    id: quiz.length,
                    type: 'multiple-choice',
                    question: questionText.trim(),
                    options: options,
                    correctAnswer: wordToChoose.trim()
                });
            }
        }

        // Add a general knowledge multiple-choice question (always present for consistency)
        quiz.push({
            id: quiz.length,
            type: 'multiple-choice',
            question: 'What is the largest planet in our solar system?',
            options: ['Mars', 'Jupiter', 'Saturn', 'Earth'],
            correctAnswer: 'Jupiter'
        });

        // Add another general knowledge fill-in-the-blank question
        quiz.push({
            id: quiz.length,
            type: 'fill-in-the-blank',
            question: 'The process by which plants make their own food is called __________.',
            correctAnswer: 'Photosynthesis'
        });

        return quiz;
    }

    // Helper function to shuffle an array (Fisher-Yates algorithm)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Helper function to generate a random word (for mock options)
    function generateRandomWord(length) {
        let result = '';
        const characters = 'abcdefghijklmnopqrstuvwxyz';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    // --- Render Quiz --- //
    function renderQuiz(quizData) {
        quizDisplay.innerHTML = ''; // Clear previous quiz
        quizResults.innerHTML = '<p class="placeholder-text">Quiz results and feedback will be displayed here.</p>'; // Clear results

        if (quizData.length === 0) {
            submitQuizBtn.classList.add('hidden');
            return;
        }

        quizData.forEach((q, index) => {
            const questionItem = document.createElement('div');
            questionItem.classList.add('question-item');
            questionItem.dataset.id = q.id; // Store ID for easy retrieval

            const questionTitle = document.createElement('h3');
            questionTitle.textContent = `${index + 1}. ${q.question}`;
            questionItem.appendChild(questionTitle);

            if (q.type === 'multiple-choice') {
                const optionsContainer = document.createElement('div');
                optionsContainer.classList.add('options-container');
                q.options.forEach(option => {
                    const label = document.createElement('label');
                    const input = document.createElement('input');
                    input.type = 'radio';
                    input.name = `question-${q.id}`;
                    input.value = option;
                    label.appendChild(input);
                    label.appendChild(document.createTextNode(option));
                    optionsContainer.appendChild(label);
                });
                questionItem.appendChild(optionsContainer);
            } else if (q.type === 'fill-in-the-blank') {
                const input = document.createElement('input');
                input.type = 'text';
                input.name = `question-${q.id}`;
                input.placeholder = 'Type your answer here...';
                questionItem.appendChild(input);
            }
            quizDisplay.appendChild(questionItem);
        });
        submitQuizBtn.classList.remove('hidden');
    }

    // --- Submit Quiz --- //
    function submitQuiz() {
        let score = 0;
        quizResults.innerHTML = '<h2>Your Results:</h2>';

        currentQuiz.forEach(q => {
            const questionItem = quizDisplay.querySelector(`.question-item[data-id="${q.id}"]`);
            if (!questionItem) return; // Skip if question element not found

            const resultItem = document.createElement('div');
            resultItem.classList.add('result-item');

            let userAnswer = '';
            let isCorrect = false;

            if (q.type === 'multiple-choice') {
                const selectedOption = questionItem.querySelector(`input[name="question-${q.id}"]:checked`);
                userAnswer = selectedOption ? selectedOption.value : 'No answer';
                isCorrect = (userAnswer.toLowerCase() === q.correctAnswer.toLowerCase());
            } else if (q.type === 'fill-in-the-blank') {
                const inputField = questionItem.querySelector(`input[name="question-${q.id}"]`);
                userAnswer = inputField ? inputField.value.trim() : 'No answer';
                isCorrect = (userAnswer.toLowerCase() === q.correctAnswer.toLowerCase());
            }

            if (isCorrect) {
                score++;
                resultItem.classList.add('correct');
            } else {
                resultItem.classList.add('incorrect');
            }

            resultItem.innerHTML = `
                <p><strong>Question:</strong> ${q.question}</p>
                <p><strong>Your Answer:</strong> ${userAnswer}</p>
                <p><strong>Correct Answer:</strong> ${q.correctAnswer}</p>
                <p><strong>Status:</strong> ${isCorrect ? 'Correct' : 'Incorrect'}</p>
            `;
            quizResults.appendChild(resultItem);
        });

        const totalQuestions = currentQuiz.length;
        const finalScoreMessage = document.createElement('h3');
        finalScoreMessage.textContent = `You scored ${score} out of ${totalQuestions} questions!`;
        quizResults.prepend(finalScoreMessage);

        // Disable quiz inputs after submission to prevent re-answering
        quizDisplay.querySelectorAll('input').forEach(input => input.disabled = true);
        submitQuizBtn.classList.add('hidden'); // Hide submit button after submission
    }

    // --- Event Listeners --- //
    generateQuizBtn.addEventListener('click', () => {
        const text = textInput.value.trim();
        currentQuiz = generateMockQuiz(text);
        renderQuiz(currentQuiz);
    });

    submitQuizBtn.addEventListener('click', submitQuiz);

    // Initial state: hide submit button until a quiz is generated
    submitQuizBtn.classList.add('hidden');
});
