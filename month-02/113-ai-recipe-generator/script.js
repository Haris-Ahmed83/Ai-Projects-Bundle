document.addEventListener('DOMContentLoaded', () => {
    const ingredientsInput = document.getElementById('ingredients');
    const preferenceCheckboxes = document.querySelectorAll('input[name="preference"]');
    const generateBtn = document.getElementById('generateBtn');
    const loadingIndicator = document.getElementById('loading');
    const recipeOutput = document.getElementById('recipeOutput');
    const recipeTitle = document.getElementById('recipeTitle');
    const recipeIngredientsList = document.getElementById('recipeIngredients');
    const recipeInstructionsList = document.getElementById('recipeInstructions');
    const saveBtn = document.getElementById('saveBtn');

    // --- AI Simulation Function ---
    async function generateRecipeAI(ingredients, preferences) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const lowerCaseIngredients = ingredients.toLowerCase();
        const lowerCasePreferences = preferences.map(p => p.toLowerCase());

        let title = "A Delightful Dish";
        let generatedIngredients = [];
        let generatedInstructions = [];

        // Basic keyword-based recipe generation simulation
        if (lowerCaseIngredients.includes('chicken') && lowerCaseIngredients.includes('rice')) {
            title = "Savory Chicken and Rice Stir-fry";
            generatedIngredients = [
                "2 chicken breasts, diced",
                "2 cups cooked rice",
                "1 bell pepper, sliced",
                "1 onion, chopped",
                "2 cloves garlic, minced",
                "1/4 cup soy sauce",
                "1 tbsp ginger, grated",
                "2 tbsp vegetable oil",
                "Salt and pepper to taste"
            ];
            generatedInstructions = [
                "Heat oil in a large skillet or wok over medium-high heat. Add chicken and cook until browned and cooked through. Remove chicken and set aside.",
                "Add onion, bell pepper, and garlic to the skillet. Sauté for 3-5 minutes until softened.",
                "Stir in grated ginger, soy sauce, and cooked rice. Mix well.",
                "Return chicken to the skillet. Cook for another 2-3 minutes, stirring constantly, until everything is heated through.",
                "Season with salt and pepper to taste. Serve hot."
            ];
        } else if (lowerCaseIngredients.includes('pasta') && lowerCaseIngredients.includes('tomato')) {
            title = "Classic Tomato Pasta with Herbs";
            generatedIngredients = [
                "1 lb pasta (spaghetti or penne)",
                "1 can (28 oz) crushed tomatoes",
                "2 cloves garlic, minced",
                "1/4 cup fresh basil, chopped",
                "2 tbsp olive oil",
                "1/2 tsp dried oregano",
                "Salt and black pepper to taste",
                "Parmesan cheese, for serving (optional)"
            ];
            generatedInstructions = [
                "Cook pasta according to package directions until al dente. Drain, reserving 1/2 cup of pasta water.",
                "Meanwhile, heat olive oil in a large skillet over medium heat. Add minced garlic and sauté for 1 minute until fragrant.",
                "Pour in crushed tomatoes, add dried oregano, salt, and pepper. Bring to a simmer and cook for 10-15 minutes, stirring occasionally, until sauce thickens slightly.",
                "Add cooked pasta to the sauce. If needed, add a splash of reserved pasta water to reach desired consistency. Stir in fresh basil.",
                "Serve hot, topped with Parmesan cheese if desired."
            ];
        } else if (lowerCaseIngredients.includes('eggs') && lowerCaseIngredients.includes('spinach')) {
            title = "Healthy Spinach and Feta Scramble";
            generatedIngredients = [
                "3 large eggs",
                "1 cup fresh spinach",
                "1/4 cup crumbled feta cheese",
                "1 tbsp olive oil or butter",
                "Salt and pepper to taste"
            ];
            generatedInstructions = [
                "Whisk eggs in a bowl with salt and pepper.",
                "Heat olive oil or butter in a non-stick skillet over medium heat.",
                "Add spinach and sauté until wilted, about 1-2 minutes.",
                "Pour whisked eggs into the skillet. As eggs set, gently push cooked portions from the edges towards the center, tilting the pan so uncooked egg flows underneath.",
                "When eggs are mostly set but still moist, sprinkle with feta cheese. Cook for another minute until feta is warmed through and eggs are cooked to your preference.",
                "Serve immediately."
            ];
        } else if (lowerCaseIngredients.includes('tofu') || lowerCasePreferences.includes('vegan') || lowerCasePreferences.includes('vegetarian')) {
            title = "Spicy Tofu & Vegetable Curry";
            generatedIngredients = [
                "1 block (14 oz) firm tofu, pressed and cubed",
                "1 can (13.5 oz) coconut milk",
                "1 bell pepper, sliced",
                "1 zucchini, sliced",
                "1 onion, chopped",
                "2 tbsp red curry paste",
                "1 tbsp vegetable oil",
                "Salt to taste",
                "Fresh cilantro, for garnish"
            ];
            generatedInstructions = [
                "Heat oil in a large pot or deep skillet over medium heat. Add onion and cook until softened, about 5 minutes.",
                "Stir in red curry paste and cook for 1 minute until fragrant.",
                "Add coconut milk, bell pepper, zucchini, and tofu. Bring to a simmer.",
                "Reduce heat and cook for 15-20 minutes, or until vegetables are tender and sauce has thickened slightly.",
                "Season with salt. Serve hot over rice or noodles, garnished with fresh cilantro."
            ];
        } else {
            title = "Generic Delicious Meal Idea";
            generatedIngredients = [
                "Your main ingredient (e.g., " + (ingredients.split(',')[0] || 'protein') + ")",
                "A fresh vegetable",
                "A flavorful sauce/spice blend",
                "A carbohydrate base"
            ];
            generatedInstructions = [
                "Prepare your main ingredient by cooking it to your preference (e.g., bake, pan-fry, grill).",
                "Sauté or roast your chosen vegetable until tender-crisp.",
                "Combine your main ingredient and vegetable with a suitable sauce or seasoning.",
                "Serve hot over a base like rice, quinoa, or pasta."
            ];
        }

        // Adjustments for preferences
        if (lowerCasePreferences.includes('gluten-free')) {
            generatedIngredients = generatedIngredients.map(item => item.replace(/pasta|rice/g, 'gluten-free pasta or quinoa'));
            generatedInstructions.push("Ensure all ingredients used are certified gluten-free.");
        }
        if (lowerCasePreferences.includes('keto')) {
            title = "Keto " + title;
            generatedIngredients = generatedIngredients.filter(item => !item.includes('rice') && !item.includes('pasta') && !item.includes('potato'));
            generatedIngredients.push("Low-carb alternative (e.g., cauliflower rice, zucchini noodles)");
            generatedInstructions.push("Serve with a low-carb side.");
        }

        return {
            title: title,
            ingredients: generatedIngredients,
            instructions: generatedInstructions
        };
    }

    // --- Event Listeners --- 
    generateBtn.addEventListener('click', async () => {
        const ingredients = ingredientsInput.value.trim();
        const preferences = Array.from(preferenceCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        if (!ingredients) {
            alert('Please enter some ingredients!');
            return;
        }

        // Show loading, hide previous output
        generateBtn.disabled = true;
        loadingIndicator.classList.remove('hidden');
        recipeOutput.classList.add('hidden');
        saveBtn.classList.add('hidden');

        try {
            const recipe = await generateRecipeAI(ingredients, preferences);
            displayRecipe(recipe);
        } catch (error) {
            console.error('Error generating recipe:', error);
            alert('Failed to generate recipe. Please try again.');
        } finally {
            loadingIndicator.classList.add('hidden');
            generateBtn.disabled = false;
        }
    });

    saveBtn.addEventListener('click', () => {
        const currentRecipe = { 
            title: recipeTitle.textContent,
            ingredients: Array.from(recipeIngredientsList.children).map(li => li.textContent),
            instructions: Array.from(recipeInstructionsList.children).map(li => li.textContent)
        };
        
        let savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
        savedRecipes.push(currentRecipe);
        localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
        alert('Recipe saved to your browser storage!');
        console.log('Saved Recipes:', savedRecipes);
    });

    // --- UI Update Functions ---
    function displayRecipe(recipe) {
        recipeTitle.textContent = recipe.title;

        recipeIngredientsList.innerHTML = '';
        recipe.ingredients.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            recipeIngredientsList.appendChild(li);
        });

        recipeInstructionsList.innerHTML = '';
        recipe.instructions.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            recipeInstructionsList.appendChild(li);
        });

        recipeOutput.classList.remove('hidden');
        saveBtn.classList.remove('hidden');
    }
});
