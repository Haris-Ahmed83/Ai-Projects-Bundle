document.addEventListener('DOMContentLoaded', () => {
    const expenseDescriptionInput = document.getElementById('expenseDescription');
    const expenseAmountInput = document.getElementById('expenseAmount');
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    const expenseListDiv = document.getElementById('expenseList');

    let expenses = []; // Array to store expense objects

    // --- AI Categorization Logic (Rule-based to mimic ML) ---
    // This function acts as our lightweight, embedded "AI" for categorization.
    const categorizationRules = [
        { keywords: ['groceries', 'supermarket', 'food', 'market', 'sainsburys', 'tesco', 'lidl', 'aldi', 'whole foods'], category: 'Food & Groceries' },
        { keywords: ['rent', 'mortgage', 'housing', 'utilities', 'electricity', 'water', 'gas', 'internet bill'], category: 'Housing & Utilities' },
        { keywords: ['transport', 'bus', 'taxi', 'uber', 'lyft', 'fuel', 'gasoline', 'car', 'metro', 'train', 'flight', 'travel'], category: 'Transport & Travel' },
        { keywords: ['shopping', 'clothes', 'electronics', 'amazon', 'retail', 'department store'], category: 'Shopping' },
        { keywords: ['medical', 'doctor', 'pharmacy', 'hospital', 'dentist', 'prescription'], category: 'Health & Medical' },
        { keywords: ['subscription', 'netflix', 'spotify', 'gym', 'software', 'streaming'], category: 'Subscriptions & Services' },
        { keywords: ['restaurant', 'cafe', 'dining', 'takeaway', 'bar', 'coffee'], category: 'Dining Out' },
        { keywords: ['entertainment', 'movie', 'concert', 'game', 'hobby', 'event'], category: 'Entertainment' },
        { keywords: ['education', 'course', 'books', 'tuition', 'school'], category: 'Education' },
        { keywords: ['gift', 'charity', 'donation'], category: 'Gifts & Donations' },
        { keywords: ['insurance', 'car insurance', 'health insurance'], category: 'Insurance' },
        { keywords: ['loan', 'debt', 'repayment', 'credit card payment'], category: 'Debt Repayment' },
        { keywords: ['pet', 'vet', 'pet food', 'pet store'], category: 'Pet Care' },
        { keywords: ['salary', 'freelance', 'income'], category: 'Income' } // Though for expenses, sometimes users input income as a negative value.
    ];

    function categorizeExpense(description) {
        const lowerDescription = description.toLowerCase();
        for (const rule of categorizationRules) {
            for (const keyword of rule.keywords) {
                if (lowerDescription.includes(keyword)) {
                    return rule.category;
                }
            }
        }
        return 'Miscellaneous'; // Default category if no rule matches
    }

    // --- Local Storage Functions ---
    function loadExpenses() {
        const storedExpenses = localStorage.getItem('expenses');
        if (storedExpenses) {
            expenses = JSON.parse(storedExpenses);
        }
    }

    function saveExpenses() {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }

    // --- UI Update Functions ---
    function renderExpenses() {
        expenseListDiv.innerHTML = ''; // Clear current list

        if (expenses.length === 0) {
            expenseListDiv.innerHTML = '<p class="no-expenses-message">No expenses yet. Add one above!</p>';
            return;
        }

        // Sort expenses by ID (creation date) to maintain order
        expenses.sort((a, b) => b.id - a.id); 

        expenses.forEach(expense => {
            const expenseItem = document.createElement('div');
            expenseItem.className = 'expense-item';
            expenseItem.innerHTML = `
                <div class="expense-details">
                    <div class="description">${expense.description}</div>
                    <div class="category">${expense.category}</div>
                </div>
                <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
            `;
            expenseListDiv.appendChild(expenseItem);
        });
    }

    // --- Event Handlers ---
    addExpenseBtn.addEventListener('click', () => {
        const description = expenseDescriptionInput.value.trim();
        const amount = parseFloat(expenseAmountInput.value);

        if (!description || isNaN(amount) || amount === 0) { // Allow negative amounts for income, but not zero
            alert('Please enter a valid description and a non-zero amount.');
            return;
        }

        const category = categorizeExpense(description);

        const newExpense = {
            id: Date.now(), // Simple unique ID based on timestamp
            description,
            amount,
            category
        };

        expenses.push(newExpense);
        saveExpenses();
        renderExpenses();

        // Clear input fields
        expenseDescriptionInput.value = '';
        expenseAmountInput.value = '';
        expenseDescriptionInput.focus(); // Keep focus on description for next entry
    });

    // --- Initialization ---
    loadExpenses();
    renderExpenses();
});
