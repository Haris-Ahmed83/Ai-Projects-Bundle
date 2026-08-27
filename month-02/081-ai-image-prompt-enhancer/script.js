document.addEventListener('DOMContentLoaded', () => {
    const shortPromptInput = document.getElementById('shortPrompt');
    const enhanceButton = document.getElementById('enhanceButton');
    const enhancedPromptOutput = document.getElementById('enhancedPrompt');
    const copyButton = document.getElementById('copyButton');

    const keywordMap = {
        "cat": "A majestic feline, eyes gleaming with mischief, amidst a mystical forest. Detailed fur, intricate whiskers, a touch of otherworldly charm.",
        "dog": "A loyal canine companion, full of boundless energy, running through a vibrant meadow. Expressive eyes, dynamic fur, joyful moment captured in golden hour light.",
        "city": "A sprawling futuristic metropolis at twilight, neon lights reflecting on wet streets. Towering skyscrapers, flying vehicles, bustling urban life, cinematic perspective.",
        "forest": "An ancient, mystical forest, sunlight dappling through dense canopy. Moss-covered trees, hidden pathways, ethereal glow, whispers of nature, volumetric fog.",
        "mountain": "Majestic snow-capped peaks piercing the clouds, a serene alpine lake reflecting the grandeur. Rugged textures, dramatic lighting, breathtaking vista, epic landscape.",
        "space": "The vast expanse of the cosmos, swirling nebulae, distant galaxies, and shimmering stars. An astronaut exploring, cosmic dust, sense of awe and wonder, deep field.",
        "ocean": "The deep blue ocean, powerful waves crashing against rugged cliffs, a lone sailboat on the horizon. Marine life subtly visible, vibrant coral, powerful and serene, underwater view possible.",
        "robot": "A sleek, advanced robot with glowing optical sensors, intricate mechanical details, in a futuristic lab. Metallic reflections, dynamic pose, artificial intelligence, cyberpunk style.",
        "abstract": "A vibrant symphony of colors and shapes, dynamic brushstrokes, flowing lines, evoking emotion and movement. Non-representational art, unique textures, expressive, high contrast.",
        "car": "A sleek, futuristic sports car, gleaming under neon lights on a rainy city street. Dynamic motion blur, reflections, intricate design, hyperrealistic, high octane render.",
        "flower": "A delicate blooming flower, petals unfurling in soft morning light, dew drops clinging. Macro photography, intricate details, vibrant colors, bokeh background.",
        "dragon": "A colossal dragon soaring over a volcanic landscape, scales shimmering, smoke billowing from its nostrils. Mythical creature, epic fantasy art, dramatic lighting, highly detailed.",
        "person": "A solitary figure standing on a windswept cliff, gazing at a distant horizon. Detailed clothing, expressive posture, dramatic sky, cinematic portrait, emotional depth.",
        "house": "A cozy cottage nestled in a vibrant green valley, smoke gently rising from the chimney. Idyllic setting, lush vegetation, warm lighting, storybook style, inviting atmosphere."
    };

    const genericPrefixes = [
        "Imagine a breathtaking scene:",
        "Visualize a captivating moment:",
        "Picture a stunning composition:",
        "Envision an epic portrayal of:",
        "Craft a detailed image of:",
        "Generate a vivid illustration of:"
    ];

    const genericSuffixes = [
        "High detail, cinematic lighting, ultra realistic, vibrant colors, 8k, Unreal Engine 5, octane render, trending on Artstation, masterpiece.",
        "Dreamy atmosphere, soft focus, painterly style, ethereal glow, concept art, volumetric lighting, highly detailed, award-winning photography.",
        "Dynamic composition, dramatic shadows, volumetric fog, intricate textures, photorealistic, wide-angle lens, film grain, hyperdetailed.",
        "Intricate details, vibrant color palette, epic scale, dramatic perspective, fantasy art, digital painting, sharp focus, professional artwork.",
        "Stylized rendering, smooth gradients, clean lines, minimalist design, elegant composition, high resolution, vector art.",
        "Dark fantasy, gothic architecture, mysterious ambiance, moonlit scene, intricate patterns, detailed environment, atmospheric light.",
        "Art Nouveau style, intricate patterns, flowing lines, organic forms, golden hour lighting, elegant and ornate, highly decorative.",
        "Steampunk aesthetic, brass and copper details, intricate gears, industrial age, Victorian influence, atmospheric, detailed machinery."
    ];

    function getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    enhanceButton.addEventListener('click', () => {
        const userInput = shortPromptInput.value.trim();
        if (!userInput) {
            enhancedPromptOutput.value = "Please enter a short prompt or keywords to enhance.";
            return;
        }

        let enhancedPrompt = '';
        const lowerCaseInput = userInput.toLowerCase();
        let keywordFound = false;

        // Check for specific keywords and apply their detailed descriptions
        for (const keyword in keywordMap) {
            if (lowerCaseInput.includes(keyword)) {
                enhancedPrompt = keywordMap[keyword] + " " + getRandomElement(genericSuffixes);
                keywordFound = true;
                break;
            }
        }

        // If no specific keyword, combine a generic prefix with user input and a generic suffix
        if (!keywordFound) {
            enhancedPrompt = getRandomElement(genericPrefixes) + " " + userInput + ". " + getRandomElement(genericSuffixes);
        }

        enhancedPromptOutput.value = enhancedPrompt;
    });

    copyButton.addEventListener('click', () => {
        if (enhancedPromptOutput.value) {
            enhancedPromptOutput.select();
            // For modern browsers, use navigator.clipboard API
            navigator.clipboard.writeText(enhancedPromptOutput.value).then(() => {
                const originalText = copyButton.textContent;
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                alert('Failed to copy prompt. Please copy manually.');
            });
        } else {
            alert('No prompt to copy!');
        }
    });
});
