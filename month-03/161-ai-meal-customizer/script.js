document.addEventListener('DOMContentLoaded', () => {
    const originalRecipeTextarea = document.getElementById('originalRecipe');
    const dietaryRestrictionsInput = document.getElementById('dietaryRestrictions');
    const customizeButton = document.getElementById('customizeButton');
    const modifiedRecipePre = document.getElementById('modifiedRecipe');
    const loadingSpinner = document.getElementById('loading');
    const errorMessageParagraph = document.getElementById('errorMessage');

    customizeButton.addEventListener('click', async () => {
        const originalRecipe = originalRecipeTextarea.value.trim();
        const dietaryRestrictions = dietaryRestrictionsInput.value.trim();

        // Clear previous results and errors
        modifiedRecipePre.textContent = '';
        errorMessageParagraph.classList.add('hidden');

        if (!originalRecipe) {
            errorMessageParagraph.textContent = 'Please enter an original recipe.';
            errorMessageParagraph.classList.remove('hidden');
            return;
        }

        // Show loading spinner
        loadingSpinner.classList.remove('hidden');
        customizeButton.disabled = true; // Disable button during processing

        try {
            const modifiedRecipe = await simulateAIModification(originalRecipe, dietaryRestrictions);
            modifiedRecipePre.textContent = modifiedRecipe;
        } catch (error) {
            errorMessageParagraph.textContent = `Error: ${error.message}`;
            errorMessageParagraph.classList.remove('hidden');
            console.error('AI modification error:', error);
        } finally {
            // Hide loading spinner
            loadingSpinner.classList.add('hidden');
            customizeButton.disabled = false; // Re-enable button
        }
    });

    /**
     * Simulates an AI API call to modify a recipe.
     * In a real application, this would be an actual fetch() call to a backend API.
     * @param {string} originalRecipe - The user-provided original recipe.
     * @param {string} dietaryRestrictions - The user-provided dietary restrictions.
     * @returns {Promise<string>} A promise that resolves with the modified recipe text.
     */
    function simulateAIModification(originalRecipe, dietaryRestrictions) {
        return new Promise(resolve => {
            setTimeout(() => {
                let modifiedIngredients = '';
                let modifiedSteps = '';
                let modificationNotes = [];
                const lowerRestrictions = dietaryRestrictions.toLowerCase();

                // Simple parsing to separate ingredients and steps based on keywords
                let ingredientsMatch = originalRecipe.match(/(ingredients:.*?)steps:/is);
                let stepsMatch = originalRecipe.match(/steps:(.*)/is);

                modifiedIngredients = ingredientsMatch ? ingredientsMatch[1] : '';
                modifiedSteps = stepsMatch ? stepsMatch[1] : originalRecipe; // If no steps, assume whole text is modified

                if (!ingredientsMatch && !stepsMatch) { // Fallback if no clear sections
                    modifiedIngredients = originalRecipe;
                    modifiedSteps = '';
                }

                if (lowerRestrictions.includes('vegan')) {
                    modificationNotes.push('Veganized: Replaced all animal products with plant-based alternatives.');
                    modifiedIngredients = modifiedIngredients
                        .replace(/chicken|beef|pork|fish/gi, 'plant-based protein (e.g., tofu, lentils, tempeh)')
                        .replace(/eggs/gi, 'flax egg or silken tofu')
                        .replace(/dairy|milk/gi, 'plant-based milk (e.g., almond, soy, oat)')
                        .replace(/cheese/gi, 'nutritional yeast or vegan cheese')
                        .replace(/butter/gi, 'vegan butter or oil')
                        .replace(/yogurt/gi, 'plant-based yogurt')
                        .replace(/broth/gi, 'vegetable broth');
                }
                if (lowerRestrictions.includes('gluten-free')) {
                    modificationNotes.push('Gluten-Free: Replaced gluten-containing ingredients.');
                    modifiedIngredients = modifiedIngredients
                        .replace(/wheat flour|all-purpose flour/gi, 'gluten-free flour blend')
                        .replace(/pasta/gi, 'gluten-free pasta')
                        .replace(/soy sauce/gi, 'tamari (gluten-free soy sauce)');
                    modifiedSteps = modifiedSteps.replace(/bread/gi, 'gluten-free bread');
                }
                if (lowerRestrictions.includes('low-carb')) {
                    modificationNotes.push('Low-Carb: Reduced carbohydrate content.');
                    modifiedIngredients = modifiedIngredients
                        .replace(/rice/gi, 'cauliflower rice')
                        .replace(/potatoes/gi, 'radishes or turnips')
                        .replace(/pasta/gi, 'zucchini noodles')
                        .replace(/sugar/gi, 'erythritol or stevia');
                    modifiedSteps = modifiedSteps.replace(/bread/gi, 'lettuce wraps');
                }
                if (lowerRestrictions.includes('nut-free')) {
                    modificationNotes.push('Nut-Free: Removed nuts and nut-based ingredients.');
                    modifiedIngredients = modifiedIngredients
                        .replace(/almond|peanut|cashew|walnut|pecan|pistachio/gi, 'seed-based alternative (e.g., sunflower, pumpkin)');
                }

                let finalResponse = `--- AI Modified Recipe ---\n\n`;
                if (modificationNotes.length > 0) {
                    finalResponse += `*Modifications Applied:*
${modificationNotes.map(note => `- ${note}`).join('\n')}\n\n`;
                } else {
                    finalResponse += `*No specific dietary modifications were identified based on your input. Here's a subtly enhanced version:*
\n`;
                }

                // Reconstruct the recipe, attempting to preserve original structure
                if (ingredientsMatch) {
                    finalResponse += `${modifiedIngredients}\n`;
                }
                if (stepsMatch) {
                    finalResponse += `${modifiedSteps}\n`;
                } else if (!ingredientsMatch) { // If no clear sections, just dump modified ingredients (which holds the whole original text)
                    finalResponse += modifiedIngredients;
                }

                resolve(finalResponse);
            }, 1500); // Simulate network delay
        });
    }
});
