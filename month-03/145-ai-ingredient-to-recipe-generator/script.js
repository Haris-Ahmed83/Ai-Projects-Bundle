document.addEventListener('DOMContentLoaded', () => {
    const ingredientsInput = document.getElementById('ingredients');
    const generateBtn = document.getElementById('generateBtn');
    const recipeOutput = document.getElementById('recipeOutput');
    const statusMessage = document.getElementById('statusMessage');
    const recipeContent = document.getElementById('recipeContent');
    const recipeTitle = document.getElementById('recipeTitle');
    const outputIngredients = document.getElementById('outputIngredients');
    const outputInstructions = document.getElementById('outputInstructions');

    // Hide recipe content initially
    recipeContent.style.display = 'none';

    generateBtn.addEventListener('click', async () => {
        const ingredients = ingredientsInput.value.trim();

        if (!ingredients) {
            statusMessage.textContent = 'Please enter some ingredients!';
            statusMessage.style.color = '#e74c3c'; // Red for error
            recipeContent.style.display = 'none';
            return;
        }

        // Reset messages and display loading state
        statusMessage.textContent = 'Generating your custom recipe...';
        statusMessage.style.color = '#e67e22'; // Orange for loading
        recipeContent.style.display = 'none';
        generateBtn.disabled = true;
        ingredientsInput.disabled = true;

        try {
            // Simulate API call with a delay
            const generatedRecipe = await simulateAIResponse(ingredients);

            statusMessage.textContent = ''; // Clear status message
            recipeContent.style.display = 'block';

            recipeTitle.textContent = generatedRecipe.title;

            // Clear previous ingredients and instructions
            outputIngredients.innerHTML = '';
            outputInstructions.innerHTML = '';

            generatedRecipe.ingredients.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                outputIngredients.appendChild(li);
            });

            generatedRecipe.instructions.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                outputInstructions.appendChild(li);
            });

        } catch (error) {
            statusMessage.textContent = 'Error generating recipe. Please try again.';
            statusMessage.style.color = '#e74c3c'; // Red for error
            console.error('Recipe generation error:', error);
            recipeContent.style.display = 'none';
        } finally {
            generateBtn.disabled = false;
            ingredientsInput.disabled = false;
        }
    });

    // --- AI Simulation Function ---
    // In a real application, this function would make an API call to a backend
    // server that communicates with an AI model (e.g., OpenAI, Google AI).
    // For this client-side example, we simulate the AI response.
    async function simulateAIResponse(inputIngredients) {
        return new Promise(resolve => {
            setTimeout(() => {
                const availableRecipes = [
                    {
                        title: "Creamy Chicken and Broccoli Pasta",
                        ingredients: [
                            "2 cups pasta (penne, rotini, or fettuccine)",
                            "1 tbsp olive oil",
                            "1 lb chicken breast, cut into 1-inch pieces",
                            "2 cups broccoli florets",
                            "2 cloves garlic, minced",
                            "1/2 cup chicken broth",
                            "1/2 cup heavy cream",
                            "1/4 cup grated Parmesan cheese",
                            "Salt and black pepper to taste",
                            "Optional: a sprinkle of red pepper flakes"
                        ],
                        instructions: [
                            "Cook pasta according to package directions. Drain and set aside.",
                            "In a large skillet, heat olive oil over medium-high heat. Add chicken and cook until browned and cooked through, about 5-7 minutes. Remove chicken from skillet and set aside.",
                            "Add broccoli florets to the same skillet, cook for 3-4 minutes until tender-crisp. Add minced garlic and cook for another minute until fragrant.",
                            "Pour in chicken broth and heavy cream. Bring to a simmer, then reduce heat and let it thicken slightly for 2-3 minutes.",
                            "Stir in cooked chicken, cooked pasta, and Parmesan cheese. Season with salt and pepper to taste. If desired, add red pepper flakes.",
                            "Serve immediately and enjoy your comforting meal!"
                        ]
                    },
                    {
                        title: "Spicy Lentil and Vegetable Curry",
                        ingredients: [
                            "1 tbsp coconut oil or vegetable oil",
                            "1 onion, chopped",
                            "2 cloves garlic, minced",
                            "1 inch ginger, grated",
                            "1 tsp curry powder",
                            "1/2 tsp turmeric",
                            "1/4 tsp cayenne pepper (adjust to taste)",
                            "1 can (14.5 oz) diced tomatoes, undrained",
                            "1 can (13.5 oz) full-fat coconut milk",
                            "1 cup red lentils, rinsed",
                            "3 cups vegetable broth",
                            "2 cups mixed vegetables (e.g., spinach, bell peppers, carrots, zucchini)",
                            "Salt and pepper to taste",
                            "Fresh cilantro, chopped, for garnish"
                        ],
                        instructions: [
                            "Heat oil in a large pot or Dutch oven over medium heat. Add onion and cook until softened, about 5 minutes.",
                            "Stir in garlic and ginger, cook for 1 minute until fragrant.",
                            "Add curry powder, turmeric, and cayenne pepper. Cook for 30 seconds, stirring constantly.",
                            "Pour in diced tomatoes, coconut milk, rinsed lentils, and vegetable broth. Bring to a boil, then reduce heat, cover, and simmer for 20-25 minutes, or until lentils are tender.",
                            "Stir in mixed vegetables and cook for another 5-7 minutes, or until vegetables are tender-crisp.",
                            "Season with salt and pepper to taste. Garnish with fresh cilantro before serving.",
                            "Serve hot with rice or naan bread."
                        ]
                    },
                    {
                        title: "Quick Garlic Shrimp Scampi with Linguine",
                        ingredients: [
                            "8 oz linguine or spaghetti",
                            "1 tbsp olive oil",
                            "1 tbsp butter",
                            "1 lb large shrimp, peeled and deveined",
                            "4 cloves garlic, minced",
                            "1/4 cup dry white wine or chicken broth",
                            "Juice of 1/2 lemon",
                            "1/4 cup fresh parsley, chopped",
                            "Salt and freshly ground black pepper to taste",
                            "Red pepper flakes (optional, for a kick)"
                        ],
                        instructions: [
                            "Cook linguine according to package instructions until al dente. Reserve 1/2 cup pasta water, then drain.",
                            "While pasta cooks, heat olive oil and butter in a large skillet over medium heat. Add shrimp and cook for 2-3 minutes per side until pink and opaque. Remove shrimp from skillet and set aside.",
                            "Add minced garlic to the skillet and cook for 30 seconds until fragrant (do not burn).",
                            "Pour in white wine (or chicken broth) and lemon juice. Bring to a simmer and cook for 2-3 minutes, scraping up any browned bits from the bottom of the pan.",
                            "Return shrimp to the skillet. Add cooked linguine and about 1/4 cup of the reserved pasta water. Toss to combine, adding more pasta water if needed to create a light sauce.",
                            "Stir in fresh parsley, salt, pepper, and red pepper flakes (if using).",
                            "Serve immediately with a sprinkle of extra parsley."
                        ]
                    }
                ];

                // Simple ingredient matching (very basic, for demonstration purposes)
                // Tries to pick a recipe that contains at least one of the user's ingredients.
                let relevantRecipe = null;
                const lowerCaseIngredients = inputIngredients.toLowerCase().split(/[,;\n]+/).map(s => s.trim()).filter(s => s.length > 0);

                for (const recipe of availableRecipes) {
                    const recipeIngredientNames = recipe.ingredients.map(ing => ing.toLowerCase());
                    const matches = lowerCaseIngredients.filter(userIng =>
                        recipeIngredientNames.some(recipeIng => recipeIng.includes(userIng) || userIng.includes(recipeIng))
                    );
                    if (matches.length > 0) {
                        relevantRecipe = recipe;
                        break; 
                    }
                }

                // If no specific match, just pick a random one
                if (!relevantRecipe) {
                    relevantRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
                }

                // Create a deep copy to potentially modify it cosmetically
                const personalizedRecipe = JSON.parse(JSON.stringify(relevantRecipe)); 
                const existingIngredientsLower = personalizedRecipe.ingredients.map(i => i.toLowerCase());

                // Add user ingredients that weren't explicitly in the chosen recipe (cosmetic simulation)
                lowerCaseIngredients.forEach(userIng => {
                    if (!existingIngredientsLower.some(existingIng => existingIng.includes(userIng))) {
                        personalizedRecipe.ingredients.push(`Your custom addition: ${userIng}`);
                    }
                });

                resolve(personalizedRecipe);
            }, 2000); // Simulate 2-second API call latency
        });
    }
});
