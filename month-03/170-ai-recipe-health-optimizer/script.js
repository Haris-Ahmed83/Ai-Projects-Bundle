document.addEventListener('DOMContentLoaded', () => {
    const recipeInput = document.getElementById('recipeInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const originalAnalysisDiv = document.getElementById('originalAnalysis');
    const optimizedRecipeDiv = document.getElementById('optimizedRecipe');
    const resultsContainer = document.getElementById('results');

    analyzeBtn.addEventListener('click', analyzeRecipe);

    function analyzeRecipe() {
        const recipeText = recipeInput.value.toLowerCase();

        if (recipeText.trim() === '') {
            alert('Please enter a recipe to analyze.');
            return;
        }

        // --- Simulated Nutritional Analysis ---
        // Base values for a generic recipe component (e.g., a serving base)
        let calories = 250;
        let fat = 12; // grams
        let saturatedFat = 4; // grams
        let sugar = 8; // grams
        let sodium = 180; // milligrams
        let fiber = 2; // grams
        let protein = 10; // grams

        // Keyword-based analysis (simplified)
        if (recipeText.includes('butter')) { calories += 100; fat += 11; saturatedFat += 7; }
        if (recipeText.includes('sugar') || recipeText.includes('honey') || recipeText.includes('syrup')) { calories += 80; sugar += 20; }
        if (recipeText.includes('cream')) { calories += 70; fat += 7; saturatedFat += 4; }
        if (recipeText.includes('cheese')) { calories += 90; fat += 8; saturatedFat += 5; sodium += 150; protein += 5; }
        if (recipeText.includes('salt')) { sodium += 250; }
        if (recipeText.includes('oil') && !recipeText.includes('olive oil') && !recipeText.includes('avocado oil')) { calories += 60; fat += 7; }
        if (recipeText.includes('olive oil') || recipeText.includes('avocado oil')) { calories += 50; fat += 6; saturatedFat -= 1; } // Healthier fats
        if (recipeText.includes('flour') && !recipeText.includes('whole wheat')) { calories += 60; sugar += 2; fiber -= 1; }
        if (recipeText.includes('whole wheat')) { calories += 5; fiber += 3; }
        if (recipeText.includes('chicken breast') || recipeText.includes('fish') || recipeText.includes('tofu')) { calories -= 30; protein += 15; fat -= 3; }
        if (recipeText.includes('bacon') || recipeText.includes('sausage')) { calories += 120; fat += 10; saturatedFat += 5; sodium += 300; protein += 8; }
        if (recipeText.includes('vegetables') || recipeText.includes('broccoli') || recipeText.includes('spinach') || recipeText.includes('carrot') || recipeText.includes('peppers')) { calories -= 20; fiber += 3; sodium -= 50; protein += 1; }
        if (recipeText.includes('nuts') || recipeText.includes('seeds')) { calories += 40; fat += 4; fiber += 2; protein += 3; }
        if (recipeText.includes('fruit') || recipeText.includes('berries') || recipeText.includes('apple')) { calories += 10; sugar += 5; fiber += 2; }

        // Ensure no negative values from subtraction
        calories = Math.max(100, calories);
        fat = Math.max(1, fat);
        saturatedFat = Math.max(0, saturatedFat);
        sugar = Math.max(0, sugar);
        sodium = Math.max(50, sodium);
        fiber = Math.max(0, fiber);
        protein = Math.max(1, protein);

        const originalAnalysisText = 
            `Calories: ${calories.toFixed(0)} kcal
` +
            `Fat: ${fat.toFixed(1)}g (Saturated: ${saturatedFat.toFixed(1)}g)
` +
            `Sugar: ${sugar.toFixed(1)}g
` +
            `Sodium: ${sodium.toFixed(0)}mg
` +
            `Fiber: ${fiber.toFixed(1)}g
` +
            `Protein: ${protein.toFixed(1)}g`;

        // --- Simulated Optimization Suggestions ---
        const suggestions = [];

        if (saturatedFat > 7) {
            suggestions.push("High in saturated fat: Consider reducing butter, full-fat dairy, or fatty meats. Substitute with olive oil, avocado, or lean protein.");
        }
        if (sugar > 25) {
            suggestions.push("High sugar content: Try reducing added sugars by 1/4 to 1/3, or swap with natural sweeteners like fruit puree, stevia, or less processed options.");
        }
        if (sodium > 400) {
            suggestions.push("High sodium detected: Reduce added salt. Flavor with herbs, spices, garlic, onion, and lemon juice instead. Opt for fresh ingredients over processed.");
        }
        if (fat > 20 && saturatedFat <= 7) {
            suggestions.push("Overall fat content is high, but mostly healthier fats. Still, consider portion control or reducing oil/nuts slightly if calorie intake is a concern.");
        }
        if (fiber < 4) {
            suggestions.push("Low in fiber: Increase fiber by adding more vegetables (e.g., broccoli, spinach), whole grains (e.g., whole wheat flour, quinoa), or legumes (e.g., beans, lentils).");
        }
        if (protein < 15) {
            suggestions.push("Consider boosting protein: Add lean meats, fish, eggs, tofu, tempeh, or legumes to enhance satiety and muscle support.");
        }

        // Specific ingredient-based suggestions
        if (recipeText.includes('butter')) {
            suggestions.push("For butter, try substituting with olive oil or avocado oil (for savory dishes) or unsweetened applesauce/mashed banana (for baking) to reduce saturated fat.");
        }
        if (recipeText.includes('cream')) {
            suggestions.push("Swap heavy cream for Greek yogurt, evaporated milk, or a plant-based cream alternative to lower fat and calories.");
        }
        if (recipeText.includes('white flour') && !recipeText.includes('whole wheat')) {
            suggestions.push("Replace some or all white flour with whole wheat flour for increased fiber and nutrients.");
        }
        if (recipeText.includes('bacon')) {
            suggestions.push("Reduce bacon quantity or try leaner alternatives like turkey bacon or lean ham to cut down on fat and sodium.");
        }
        if (recipeText.includes('cheese')) {
            suggestions.push("Use a smaller amount of strong-flavored cheese, or opt for low-fat cheese varieties.");
        }

        if (suggestions.length === 0) {
            suggestions.push("This recipe seems quite balanced! For further optimization, consider exploring diverse vegetables or lean protein sources.");
        }

        const optimizedRecipeText = suggestions.join('\n\n');

        // Update UI
        originalAnalysisDiv.textContent = originalAnalysisText;
        optimizedRecipeDiv.textContent = optimizedRecipeText;
        resultsContainer.style.display = 'block';

        // Optional: Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});
