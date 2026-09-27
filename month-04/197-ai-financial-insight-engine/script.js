document.addEventListener('DOMContentLoaded', () => {
    const transactionsInput = document.getElementById('transactionsInput');
    const analyzeButton = document.getElementById('analyzeButton');
    const insightsOutput = document.getElementById('insightsOutput');

    // Populate with example transactions for quick testing
    transactionsInput.value = 'Groceries:-50;Salary:2000;Rent:-800;Coffee:-5;Dinner:-40;Internet:-60;Freelance:300;Bus:-30;Savings:100';

    analyzeButton.addEventListener('click', () => {
        const rawTransactions = transactionsInput.value;
        if (rawTransactions.trim() === '') {
            insightsOutput.innerHTML = '<p>Please enter some transactions to analyze.</p>';
            return;
        }

        insightsOutput.innerHTML = '<p>Analyzing transactions... Please wait.</p>';
        // Simulate an AI processing delay for better UX
        setTimeout(() => {
            const insights = simulateAIAnalysis(rawTransactions);
            insightsOutput.innerHTML = insights;
        }, 1000);
    });

    /**
     * Simulates AI analysis of financial transactions.
     * This function parses transactions, categorizes them, calculates totals,
     * and generates mock insights, budgeting breakdowns, and recommendations.
     * @param {string} transactionsRaw - A string of transactions like 'Category:Amount;Category:Amount'
     * @returns {string} HTML string containing the analysis results.
     */
    function simulateAIAnalysis(transactionsRaw) {
        const transactions = transactionsRaw.split(';').map(t => t.trim()).filter(t => t);
        let totalIncome = 0;
        let totalExpenses = 0;
        const categorySpending = {}; // { 'Food': -100, 'Salary': 2000 }

        transactions.forEach(transaction => {
            const parts = transaction.split(':');
            if (parts.length === 2) {
                const category = parts[0].trim();
                const amount = parseFloat(parts[1].trim());

                if (!isNaN(amount)) {
                    if (amount > 0) {
                        totalIncome += amount;
                    } else {
                        totalExpenses += Math.abs(amount); // Track expenses as positive values
                    }

                    // Aggregate spending/income by category
                    if (categorySpending[category]) {
                        categorySpending[category] += amount;
                    } else {
                        categorySpending[category] = amount;
                    }
                }
            }
        });

        const netBalance = totalIncome - totalExpenses;

        let insightsHtml = '<h3>Overview</h3>';
        insightsHtml += `<p><strong>Total Income:</strong> <span style="color: #28a745;">$${totalIncome.toFixed(2)}</span></p>`;
        insightsHtml += `<p><strong>Total Expenses:</strong> <span style="color: #dc3545;">$${totalExpenses.toFixed(2)}</span></p>`;
        insightsHtml += `<p><strong>Net Balance:</strong> <span style="color: ${netBalance >= 0 ? '#28a745' : '#dc3545'};">$${netBalance.toFixed(2)}</span></p>`;

        insightsHtml += '<h3>Spending Breakdown (AI Categorization)</h3><ul>';
        const expenseCategories = Object.entries(categorySpending)
            .filter(([, amount]) => amount < 0) // Only show expense categories
            .sort((a, b) => a[1] - b[1]); // Sort by most negative (highest spending)

        if (expenseCategories.length > 0) {
            expenseCategories.forEach(([category, amount]) => {
                insightsHtml += `<li><strong>${category}:</strong> $${Math.abs(amount).toFixed(2)}</li>`;
            });
        } else {
            insightsHtml += '<li>No specific expenses identified from your input.</li>';
        }
        insightsHtml += '</ul>';

        insightsHtml += '<h3>Recommendations (AI-driven)</h3><ul>';
        let recommended = false;

        if (netBalance < 0) {
            insightsHtml += '<li><strong>Urgent:</strong> You are currently spending more than you earn. Review your largest expense categories to identify areas for reduction.</li>';
            recommended = true;
        } else if (netBalance > 0 && totalIncome > 0) {
            insightsHtml += '<li><strong>Great Job:</strong> You have a positive net balance! Consider setting aside a portion for savings or investment to grow your wealth.</li>';
            recommended = true;
        }

        // More specific recommendations based on common spending patterns
        const coffeeSpending = Math.abs(categorySpending['Coffee'] || 0);
        if (coffeeSpending > 30) {
            insightsHtml += `<li>Your <strong>Coffee</strong> spending ($${coffeeSpending.toFixed(2)}) seems relatively high. Small daily cuts can lead to significant savings over time.</li>`;
            recommended = true;
        }

        const entertainmentSpending = Math.abs(categorySpending['Entertainment'] || 0);
        if (entertainmentSpending > 100) {
            insightsHtml += `<li>Your <strong>Entertainment</strong> spending ($${entertainmentSpending.toFixed(2)}) is notable. Setting a monthly budget for entertainment can help you manage these expenses.</li>`;
            recommended = true;
        }

        const groceriesSpending = Math.abs(categorySpending['Groceries'] || 0);
        if (groceriesSpending > 200) {
            insightsHtml += `<li><strong>Groceries</strong> ($${groceriesSpending.toFixed(2)}) are a significant expense. Planning meals and making shopping lists can help reduce costs.</li>`;
            recommended = true;
        }

        if (!recommended && transactions.length > 0) {
            insightsHtml += '<li>Keep up the good work! Your spending habits appear healthy based on the provided data.</li>';
        }

        if (transactions.length === 0) {
             insightsHtml += '<li>Enter some transactions to get personalized recommendations!</li>';
        }
        insightsHtml += '</ul>';

        // Simple Data Visualization (text-based bar chart for spending distribution)
        insightsHtml += '<h3>Data Visualization (Spending Distribution)</h3><pre>';
        const totalAbsExpenses = expenseCategories.reduce((sum, [, amount]) => sum + Math.abs(amount), 0);
        const maxBarLength = 30; // Maximum characters for the bar

        if (totalAbsExpenses > 0) {
            expenseCategories.forEach(([category, amount]) => {
                const percentage = (Math.abs(amount) / totalAbsExpenses) * 100;
                const barLength = Math.round((percentage / 100) * maxBarLength);
                const bar = '#'.repeat(barLength).padEnd(maxBarLength, '-');
                insightsHtml += `${category.padEnd(15)} [${bar}] ${percentage.toFixed(1)}%
`;
            });
        } else {
            insightsHtml += 'No expenses to visualize.';
        }
        insightsHtml += '</pre>';

        return insightsHtml;
    }
});
