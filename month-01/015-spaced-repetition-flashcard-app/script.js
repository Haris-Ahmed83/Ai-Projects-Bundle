const STORAGE_KEY = 'spacedRepetitionCards';
let cards = [];
let currentCard = null;
let showingAnswer = false;

// DOM Elements
const cardContainer = document.getElementById('card-container');
const cardQuestion = document.getElementById('card-question');
const cardAnswer = document.getElementById('card-answer');
const cardMessage = document.getElementById('card-message');
const showAnswerBtn = document.getElementById('show-answer-btn');
const ratingButtons = document.getElementById('rating-buttons');
const hardBtn = document.getElementById('hard-btn');
const goodBtn = document.getElementById('good-btn');
const easyBtn = document.getElementById('easy-btn');
const addCardBtn = document.getElementById('add-card-btn');
const addCardModal = document.getElementById('add-card-modal');
const addCardForm = document.getElementById('add-card-form');
const newQuestionInput = document.getElementById('new-question');
const newAnswerInput = document.getElementById('new-answer');
const closeAddCardModal = document.getElementById('close-add-card-modal');

// --- Data Management ---
function loadCards() {
    const storedCards = localStorage.getItem(STORAGE_KEY);
    if (storedCards) {
        cards = JSON.parse(storedCards).map(card => ({
            ...card,
            dueDate: new Date(card.dueDate) // Convert string back to Date object
        }));
    }
}

function saveCards() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function addCard(question, answer) {
    const newCard = {
        id: generateId(),
        question: question,
        answer: answer,
        interval: 0,       // days
        easeFactor: 2.5,   // SM-2 default
        repetitions: 0,    // how many times reviewed
        dueDate: new Date() // Due immediately
    };
    cards.push(newCard);
    saveCards();
    console.log('Card added:', newCard);
    return newCard;
}

// --- Spaced Repetition Logic (SM-2 like) ---
function updateCardReview(card, rating) {
    // rating: 0 (Hard), 1 (Good), 2 (Easy)

    // Update easeFactor
    if (rating === 0) { // Hard
        card.easeFactor = Math.max(1.3, card.easeFactor - 0.2);
    } else if (rating === 2) { // Easy
        card.easeFactor = card.easeFactor + 0.1;
    }

    // Update repetitions and interval
    if (rating === 0) { // Hard
        card.repetitions = 0;
        card.interval = 1; // Due tomorrow
    } else { // Good or Easy
        card.repetitions++;
        if (card.repetitions === 1) {
            card.interval = 1;
        } else if (card.repetitions === 2) {
            card.interval = 6;
        } else {
            card.interval = Math.round(card.interval * card.easeFactor);
            if (rating === 2) { // Extra boost for Easy
                card.interval = Math.round(card.interval * 1.3);
            }
        }
    }

    // Ensure minimum interval of 1 day if repetitions > 0
    if (card.repetitions > 0 && card.interval === 0) {
        card.interval = 1;
    }

    // Update dueDate
    card.dueDate = new Date();
    card.dueDate.setDate(card.dueDate.getDate() + card.interval);
    
    saveCards();
    console.log('Card updated:', card);
}

// --- UI Logic ---
function renderCard(card) {
    if (!card) {
        cardContainer.style.display = 'none';
        cardMessage.textContent = 'No cards due right now! Add some new cards or wait for existing ones to become due.';
        cardMessage.style.display = 'block';
        showAnswerBtn.style.display = 'none';
        ratingButtons.style.display = 'none';
        return;
    }

    cardContainer.style.display = 'flex';
    cardMessage.style.display = 'none';
    cardQuestion.textContent = card.question;
    cardAnswer.textContent = card.answer;
    cardAnswer.style.display = 'none'; // Hide answer initially
    showAnswerBtn.style.display = 'block';
    ratingButtons.style.display = 'none'; // Hide rating buttons initially
    showingAnswer = false;
}

function toggleAnswer() {
    showingAnswer = !showingAnswer;
    cardAnswer.style.display = showingAnswer ? 'block' : 'none';
    showAnswerBtn.textContent = showingAnswer ? 'Hide Answer' : 'Show Answer';
    ratingButtons.style.display = showingAnswer ? 'flex' : 'none';
}

function findNextCard() {
    const now = new Date();
    // Filter cards that are due
    const dueCards = cards.filter(card => card.dueDate <= now);

    if (dueCards.length > 0) {
        // Sort by dueDate to get the most overdue first (or oldest due date)
        dueCards.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
        currentCard = dueCards[0];
        renderCard(currentCard);
    } else if (cards.length > 0) {
        // No cards are due, but there are cards in the deck. Show message.
        currentCard = null;
        renderCard(null); // Will display the "no cards due" message
    } else {
        // No cards at all in the deck
        currentCard = null;
        cardContainer.style.display = 'none';
        cardMessage.textContent = 'Welcome! Start by adding your first flashcard.';
        cardMessage.style.display = 'block';
        showAnswerBtn.style.display = 'none';
        ratingButtons.style.display = 'none';
    }
}

function handleRating(rating) {
    if (currentCard) {
        updateCardReview(currentCard, rating);
        findNextCard();
    }
}

// --- Event Listeners ---
showAnswerBtn.addEventListener('click', toggleAnswer);

hardBtn.addEventListener('click', () => handleRating(0));
goodBtn.addEventListener('click', () => handleRating(1));
easyBtn.addEventListener('click', () => handleRating(2));

addCardBtn.addEventListener('click', () => {
    addCardModal.style.display = 'flex';
    newQuestionInput.focus();
});

closeAddCardModal.addEventListener('click', () => {
    addCardModal.style.display = 'none';
});

addCardForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const question = newQuestionInput.value.trim();
    const answer = newAnswerInput.value.trim();

    if (question && answer) {
        addCard(question, answer);
        newQuestionInput.value = '';
        newAnswerInput.value = '';
        addCardModal.style.display = 'none';
        findNextCard(); // Re-evaluate and show next card
    } else {
        alert('Please enter both a question and an answer.');
    }
});

// Close modal if clicking outside
window.addEventListener('click', (event) => {
    if (event.target === addCardModal) {
        addCardModal.style.display = 'none';
    }
});

// --- Initialization ---
function init() {
    loadCards();
    findNextCard();
}

init();
