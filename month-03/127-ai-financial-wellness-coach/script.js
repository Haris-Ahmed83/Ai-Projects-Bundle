document.addEventListener('DOMContentLoaded', () => {
    const incomeInput = document.getElementById('income');
    const expenseInputs = {
        rent: document.getElementById('rent'),
        groceries: document.getElementById('groceries'),
        transport: document.getElementById('transport'),
        utilities: document.getElementById('utilities'),
        entertainment: document.getElementById('entertainment'),
        other: document.getElementById('other')
    };
    const analyzeBtn = document.getElementById('analyzeBtn');

    const summaryIncomeSpan = document.getElementById('summaryIncome');
    const summaryExpensesSpan = document.getElementById('summaryExpenses');
    const summaryNetSpan = document.getElementById('summaryNet');
    const summarySavingsRateSpan = document.getElementById('summarySavingsRate');
    const financialHealthStrong = document.getElementById('financialHealth');
    const insightsOutputDiv = document.getElementById('insightsOutput');
    const recommendationsOutputDiv = document.getElementById('recommendationsOutput');

    // Attach event listener to the analyze button
    analyzeBtn.addEventListener('click', analyzeFinances);

    // Helper function to safely parse number inputs
    function parseValue(element) {
        const value = parseFloat(element.value);
        return isNaN(value) || value < 0 ? 0 : value;
    }

    // Main function to analyze finances and update UI
    function analyzeFinances() {
        const income = parseValue(incomeInput);
        let totalExpenses = 0;
        const expenses = {};

        for (const key in expenseInputs) {
            expenses[key] = parseValue(expenseInputs[key]);
            totalExpenses += expenses[key];
        }

        const netSavings = income - totalExpenses;
        const savingsRate = income > 0 ? ((netSavings / income) * 100).toFixed(1) : 0;

        // Update Financial Summary section
        summaryIncomeSpan.textContent = `$${income.toLocaleString()}`;
        summaryExpensesSpan.textContent = `$${totalExpenses.toLocaleString()}`;
        summaryNetSpan.textContent = `$${netSavings.toLocaleString()}`;
        summarySavingsRateSpan.textContent = `${savingsRate}%`;

        updateFinancialHealth(netSavings, income);

        // Generate Spending Insights
        let insightsHtml = '<h3>Spending Breakdown:</h3><ul>';
        let totalExpenseSumForPercentages = 0; 
        for (const key in expenses) {
            totalExpenseSumForPercentages += expenses[key];
        }

        // Sort expenses from highest to lowest for better insights
        const sortedExpenses = Object.entries(expenses).sort(([, a], [, b]) => b - a);

        for (const [key, value] of sortedExpenses) {
            const percentOfIncome = income > 0 ? ((value / income) * 100).toFixed(1) : 0;
            const percentOfTotalExpenses = totalExpenseSumForPercentages > 0 ? ((value / totalExpenseSumForPercentages) * 100).toFixed(1) : 0;
            insightsHtml += `<li><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> $${value.toLocaleString()} (${percentOfIncome}% of income, ${percentOfTotalExpenses}% of total expenses)</li>`;
        }
        insightsHtml += '</ul>';

        if (netSavings < 0) {
            insightsHtml += `<p style="color: #c62828; font-weight: bold;">Warning: Your expenses exceed your income by $${Math.abs(netSavings).toLocaleString()}. This indicates a deficit.</p>`;
        }

        insightsOutputDiv.innerHTML = insightsHtml;

        // Generate Budget Recommendations (Simplified AI Logic)
        let recommendationsHtml = '<h3>Budget Recommendations:</h3><ul>';
        const targetSavingsRate = 20; // A common financial planning goal

        if (parseFloat(savingsRate) < targetSavingsRate) {
            recommendationsHtml += `<li>Your current savings rate is ${savingsRate}%, which is below the recommended ${targetSavingsRate}% target for strong financial health.</li>`;
            
            if (income > 0) {
                const neededSavings = (income * (targetSavingsRate / 100));
                const deficitToTarget = neededSavings - netSavings;
                if (deficitToTarget > 0) {
                    recommendationsHtml += `<li>To reach a ${targetSavingsRate}% savings rate, you would ideally need to save an additional $${deficitToTarget.toLocaleString()} per month.</li>`;
                }
            }
            
            // Suggest areas to cut based on top expenses
            const topExpenseCategories = sortedExpenses.slice(0, 2).filter(([, value]) => value > 0).map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));
            if (topExpenseCategories.length > 0) {
                recommendationsHtml += `<li>Consider reviewing and potentially reducing spending in your highest categories, such as <strong>${topExpenseCategories.join(' and ')}</strong>. Even small adjustments can lead to significant savings.</li>`;
            } else if (netSavings < 0) {
                 recommendationsHtml += `<li>Focus on reducing overall discretionary spending to bring your expenses below your income.</li>`;
            }
        } else {
            recommendationsHtml += `<li>Great job! Your savings rate of ${savingsRate}% is healthy and above the recommended ${targetSavingsRate}% target. Keep up the excellent work!</li>`;
        }

        recommendationsHtml += `<li><strong>General Budgeting Tip:</strong> A popular guideline is the 50/30/20 rule: aim to spend 50% of your income on Needs, 30% on Wants, and 20% on Savings & Debt Repayment.</li>`;
        recommendationsHtml += `<li><strong>Automate Savings:</strong> Set up automatic transfers to a dedicated savings or investment account immediately after you get paid.</li>`;
        recommendationsHtml += `<li><strong>Track Consistently:</strong> Regularly monitor your spending to stay aware of where your money is going and identify areas for optimization.</li>`;
        recommendationsHtml += '</ul>';
        recommendationsOutputDiv.innerHTML = recommendationsHtml;
    }

    // Function to update financial health indicator with dynamic styling
    function updateFinancialHealth(netSavings, income) {
        financialHealthStrong.textContent = '';
        financialHealthStrong.className = ''; // Reset classes

        if (income <= 0) {
             financialHealthStrong.textContent = 'No Income Data';
             financialHealthStrong.classList.add('health-fair');
             return;
        }

        const savingsRate = (netSavings / income) * 100;

        if (savingsRate >= 20) {
            financialHealthStrong.textContent = 'Excellent';
            financialHealthStrong.classList.add('health-excellent');
        } else if (savingsRate >= 10) {
            financialHealthStrong.textContent = 'Good';
            financialHealthStrong.classList.add('health-good');
        } else if (savingsRate >= 0) {
            financialHealthStrong.textContent = 'Fair';
            financialHealthStrong.classList.add('health-fair');
        } else {
            financialHealthStrong.textContent = 'Needs Improvement';
            financialHealthStrong.classList.add('health-poor');
        }
    }

    // Run initial analysis with default values on page load
    analyzeFinances();
});
