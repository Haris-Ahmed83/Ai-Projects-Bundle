document.addEventListener('DOMContentLoaded', () => {
    const incomeInput = document.getElementById('income');
    const housingInput = document.getElementById('housing');
    const foodInput = document.getElementById('food');
    const transportationInput = document.getElementById('transportation');
    const utilitiesInput = document.getElementById('utilities');
    const entertainmentInput = document.getElementById('entertainment');
    const otherInput = document.getElementById('other');
    const goalsInput = document.getElementById('goals');
    const optimizeBtn = document.getElementById('optimizeBtn');
    const recommendationsDiv = document.getElementById('recommendations');

    optimizeBtn.addEventListener('click', analyzeBudget);

    function analyzeBudget() {
        const income = parseFloat(incomeInput.value) || 0;
        const housing = parseFloat(housingInput.value) || 0;
        const food = parseFloat(foodInput.value) || 0;
        const transportation = parseFloat(transportationInput.value) || 0;
        const utilities = parseFloat(utilitiesInput.value) || 0;
        const entertainment = parseFloat(entertainmentInput.value) || 0;
        const other = parseFloat(otherInput.value) || 0;
        const goals = goalsInput.value.trim();

        const expenses = housing + food + transportation + utilities + entertainment + other;
        const netIncome = income - expenses;

        let recommendations = "<h3>Here are your AI-powered budget recommendations:</h3>\n";

        recommendations += `<p><strong>Current Financial Snapshot:</strong></p>`;
        recommendations += `<ul>`;
        recommendations += `<li>Monthly Income: <strong>$${income.toFixed(2)}</strong></li>`;
        recommendations += `<li>Total Expenses: <strong>$${expenses.toFixed(2)}</strong></li>`;
        recommendations += `<li>Net Income (Income - Expenses): <strong>$${netIncome.toFixed(2)}</strong></li>`;
        recommendations += `</ul>`;

        if (netIncome < 0) {
            recommendations += `<p class="warning">Your expenses ($${expenses.toFixed(2)}) exceed your income ($${income.toFixed(2)}) by $${Math.abs(netIncome).toFixed(2)}! It's crucial to reduce spending to achieve financial stability.</p>`;
            recommendations += `<p><strong>Immediate Actions:</strong></p><ul>`;
            recommendations += `<li><strong>Identify & Reduce:</strong> Pinpoint non-essential spending categories (like entertainment, dining out, subscriptions) and make immediate cuts.</li>`;
            recommendations += `<li><strong>Increase Income:</strong> Explore options for a side hustle, overtime, or negotiating a raise.</li>`;
            recommendations += `<li><strong>Review Major Costs:</strong> While harder to change quickly, assess if housing or transportation costs can be optimized long-term.</li>`;
            recommendations += `</ul>`;
        } else {
            recommendations += `<p class="success">You have a positive net income of $${netIncome.toFixed(2)}! This is a great foundation for building wealth.</p>`;

            // --- AI Simulation Logic ---
            let savingsTargetPercentage = 0.20; // Default 20% savings
            let goalImpactMessage = "";

            if (goals.toLowerCase().includes("debt")) {
                savingsTargetPercentage = Math.min(0.30, netIncome / income); // Max 30% or whatever is possible
                goalImpactMessage = "Aggressively tackling debt repayment can significantly improve your financial health and reduce future interest payments.";
            } else if (goals.toLowerCase().includes("down payment") || goals.toLowerCase().includes("invest") || goals.toLowerCase().includes("retirement")) {
                savingsTargetPercentage = Math.min(0.25, netIncome / income); 
                goalImpactMessage = "Consistent savings and investment are key to achieving your long-term wealth goals. The earlier you start, the better!";
            } else if (goals.toLowerCase().includes("car") || goals.toLowerCase().includes("vacation") || goals.toLowerCase().includes("emergency fund")) {
                 savingsTargetPercentage = Math.min(0.15, netIncome / income); 
                 goalImpactMessage = "Setting aside a specific amount regularly will help you reach your shorter-term goals faster.";
            }
            
            // Ensure savingsTargetPercentage is not negative or excessively high if income is low
            savingsTargetPercentage = Math.max(0.05, Math.min(0.5, savingsTargetPercentage)); // Min 5%, Max 50% for realistic targets

            const recommendedSavings = income * savingsTargetPercentage;
            const currentSavingsPotential = netIncome;

            recommendations += `<p><strong>AI-Powered Budgeting Strategy:</strong></p>`;
            recommendations += `<p>Based on your income, expenses, and stated financial goals, our AI suggests aiming to save at least <strong>${(savingsTargetPercentage * 100).toFixed(0)}% of your income</strong>. This translates to approximately <strong>$${recommendedSavings.toFixed(2)} per month</strong> for savings or debt repayment.</p>`;
            recommendations += `<p>${goalImpactMessage}</p>`;

            if (currentSavingsPotential >= recommendedSavings) {
                recommendations += `<p class="success">You are currently saving $${currentSavingsPotential.toFixed(2)} which is above your target! Excellent work. Consider increasing your savings further, investing the surplus, or setting new ambitious goals.</p>`;
            } else {
                const deficit = recommendedSavings - currentSavingsPotential;
                recommendations += `<p class="warning">To reach your recommended savings target of $${recommendedSavings.toFixed(2)}, you need to find an additional <strong>$${deficit.toFixed(2)}</strong> per month.</p>`;
                recommendations += `<p><strong>Potential Optimization Areas to find extra funds:</strong></p><ul>`;

                const expenseCategories = { housing, food, transportation, utilities, entertainment, other };
                // Sort expenses in descending order to target the largest ones first
                const sortedExpenses = Object.entries(expenseCategories).sort(([, a], [, b]) => b - a);
                
                // General advice for top expenses
                sortedExpenses.forEach(([category, amount]) => {
                    if (amount > (income * 0.1) && category !== 'housing') { // If a non-housing expense is significant (more than 10% of income)
                        recommendations += `<li>Your <strong>${category}</strong> spending ($${amount.toFixed(2)}) is a considerable portion of your budget. Even a small reduction (e.g., 10-15%) here could make a big difference.</li>`;
                    }
                });

                // More specific advice if certain categories are disproportionately high
                if (housing > (income * 0.35)) {
                    recommendations += `<li>Your <strong>housing</strong> cost ($${housing.toFixed(2)}) is quite high relative to your income. While often fixed, long-term strategies like refinancing, seeking a more affordable place, or finding a roommate could be beneficial.</li>`;
                }
                if (food > (income * 0.15)) {
                    recommendations += `<li>Your <strong>food</strong> spending ($${food.toFixed(2)}) seems elevated. Meal planning, cooking at home more often, and reducing restaurant visits can lead to significant savings.</li>`;
                }
                if (entertainment > (income * 0.08)) {
                    recommendations += `<li>Your <strong>entertainment</strong> spending ($${entertainment.toFixed(2)}) is higher than average. Look for free or low-cost activities and set a strict budget for this category.</li>`;
                }
                if (transportation > (income * 0.1)) {
                    recommendations += `<li>Review your <strong>transportation</strong> costs ($${transportation.toFixed(2)}). Can you carpool, use public transport more, bike, or optimize your vehicle's fuel efficiency?</li>`;
                }
                if (other > (income * 0.05)) {
                    recommendations += `<li>The '<strong>other</strong>' category ($${other.toFixed(2)}) is a good place to scrutinize. What specific expenses fall here? Categorizing them could reveal areas for cuts.</li>`;
                }

                recommendations += `<li><strong>The "50/30/20" Rule:</strong> Aim for 50% of income on Needs, 30% on Wants, and 20% on Savings/Debt. Adjust your spending to align closer to these benchmarks.</li>`;
                recommendations += `<li><strong>Track Diligently:</strong> For the next month, meticulously track every dollar spent to identify hidden costs and unnecessary expenditures.</li>`;
                recommendations += `</ul>`;
            }

            recommendations += `<p><strong>Remember your goal:</strong> "${goals}". Every thoughtful decision about your spending moves you closer to achieving it!</p>`;
            recommendations += `<p>Regularly review and adjust your budget as your income, expenses, and goals evolve.</p>`;
        }

        recommendationsDiv.innerHTML = recommendations;
    }
});
