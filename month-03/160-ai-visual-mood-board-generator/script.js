document.addEventListener('DOMContentLoaded', () => {
    const keywordsInput = document.getElementById('keywords');
    const generateBtn = document.getElementById('generateBtn');
    const outputArea = document.getElementById('outputArea');
    const loadingIndicator = document.getElementById('loadingIndicator');

    const generateMoodBoardConcept = (keyword) => {
        const normalizedKeyword = keyword.toLowerCase().trim();
        let conceptTitle = 'Untitled Vision';
        let colorPalette = [];
        let imagery = [];
        let textures = [];
        let mood = [];
        let keyElements = [];

        // Predefined data for dynamic generation
        const commonColors = ['deep blues', 'earthy greens', 'warm yellows', 'fiery reds', 'calm grays', 'vibrant purples', 'soft pastels', 'metallic silvers', 'glossy blacks', 'pristine whites'];
        const commonImagery = ['dappled light', 'geometric patterns', 'organic forms', 'flowing lines', 'sharp angles', 'abstract shapes', 'natural landscapes', 'urban skylines', 'vintage elements', 'futuristic tech'];
        const commonTextures = ['smooth glass', 'rough concrete', 'soft fabric', 'polished metal', 'natural wood', 'velvet touch', 'liquid sheen', 'gritty sand', 'delicate lace', 'rugged stone'];
        const commonMoods = ['serene', 'energetic', 'mysterious', 'minimalist', 'luxurious', 'playful', 'dramatic', 'calming', 'innovative', 'nostalgic'];
        const commonElements = ['light and shadow play', 'contrasting materials', 'dynamic compositions', 'monochromatic schemes', 'bold focal points', 'subtle details', 'layered elements', 'fluid transitions', 'structured layouts', 'unexpected juxtapositions'];

        // Helper to pick random elements
        const pickRandom = (arr, count) => {
            const shuffled = [...arr].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        };

        if (!normalizedKeyword || normalizedKeyword.length < 3) {
            conceptTitle = 'A Blank Canvas of Infinite Possibilities';
            colorPalette = pickRandom(commonColors, 3).join(', ') + ' with unexpected accents.';
            imagery = pickRandom(commonImagery, 3).join(', ') + ' forming intriguing narratives.';
            textures = pickRandom(commonTextures, 3).join(', ') + ' to evoke a rich tactile experience.';
            mood = pickRandom(commonMoods, 3).join(', ') + ' and utterly captivating.';
            keyElements = pickRandom(commonElements, 3).join(', ') + ' to guide the eye.';
        } else {
            // Simple keyword-based logic
            if (normalizedKeyword.includes('futur')) {
                conceptTitle = `Neo-Metropolis: The ${keyword} Frontier`;
                colorPalette = ['electric blues', 'cybernetic greens', 'glossy blacks', 'metallic silvers', 'neon accents'].join(', ');
                imagery = ['sleek skyscrapers', 'flying vehicles', 'holographic displays', 'data streams', 'geometric structures'].join(', ');
                textures = ['polished chrome', 'smooth glass', 'carbon fiber', 'digital static'].join(', ');
                mood = ['innovative', 'dynamic', 'advanced', 'cold', 'exciting'].join(', ');
                keyElements = ['high-tech interfaces', 'luminescent lines', 'sparse compositions', 'future-forward typography'].join(', ');
            } else if (normalizedKeyword.includes('forest') || normalizedKeyword.includes('nature') || normalizedKeyword.includes('wood')) {
                conceptTitle = `Whispering Woods: An Ode to ${keyword} Serenity`;
                colorPalette = ['deep emeralds', 'mossy greens', 'earthy browns', 'golden sunlight', 'misty grays'].join(', ');
                imagery = ['dappled light through canopy', 'ancient trees', 'winding streams', 'wild flora', 'hidden pathways'].join(', ');
                textures = ['rough bark', 'soft moss', 'damp earth', 'smooth pebbles', 'delicate leaves'].join(', ');
                mood = ['tranquil', 'mysterious', 'ancient', 'rejuvenating', 'grounding'].join(', ');
                keyElements = ['organic shapes', 'natural light play', 'textured layers', 'verdant growth'].join(', ');
            } else if (normalizedKeyword.includes('vintage') || normalizedKeyword.includes('retro')) {
                conceptTitle = `Timeless Charm: A ${keyword} Revival`;
                colorPalette = ['sepia tones', 'muted pastels', 'deep burgundies', 'dusty blues', 'creamy whites'].join(', ');
                imagery = ['aged photographs', 'ornate patterns', 'classic typography', 'antique objects', 'faded advertisements'].join(', ');
                textures = ['worn leather', 'velvet', 'delicate lace', 'distressed wood', 'brushed brass'].join(', ');
                mood = ['nostalgic', 'elegant', 'charming', 'warm', 'sophisticated'].join(', ');
                keyElements = ['ornamental details', 'classic silhouettes', 'hand-crafted feel', 'curated imperfections'].join(', ');
            } else if (normalizedKeyword.includes('ocean') || normalizedKeyword.includes('beach') || normalizedKeyword.includes('sea')) {
                conceptTitle = `Coastal Harmony: The ${keyword} Escape`;
                colorPalette = ['aqua blues', 'sandy beiges', 'foamy whites', 'coral pinks', 'deep sea navy'].join(', ');
                imagery = ['crashing waves', 'seashells', 'driftwood', 'horizon lines', 'sun-kissed shores'].join(', ');
                textures = ['gritty sand', 'smooth pebbles', 'fluid water', 'weathered wood', 'breezy linen'].join(', ');
                mood = ['calming', 'refreshing', 'serene', 'expansive', 'lighthearted'].join(', ');
                keyElements = ['natural light', 'organic forms', 'open spaces', 'horizon views'].join(', ');
            }
            else { // Generic fallback, combining keyword with random elements
                conceptTitle = `Aesthetic Echoes of ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`;
                colorPalette = pickRandom(commonColors, 2).join(', ') + ` with ${keyword} inspired hues.`;
                imagery = `${keyword} motifs, ` + pickRandom(commonImagery, 2).join(', ') + '.';
                textures = pickRandom(commonTextures, 2).join(', ') + ` alongside ${keyword}-specific textures.`;
                mood = `Evoking a sense of ${pickRandom(commonMoods, 1)[0]} and ${keyword}-driven emotion.`;
                keyElements = `${keyword}-centric elements, ` + pickRandom(commonElements, 2).join(', ') + '.';
            }
        }

        return `
<strong>Concept Title:</strong> ${conceptTitle}

<strong>Core Theme & Vision:</strong>
This mood board explores the essence of "${keyword || 'creative freedom'}", focusing on generating a visual narrative that is both evocative and inspiring. It aims to capture the spirit of ${keyword || 'innovation'} through a blend of carefully chosen elements.

<strong>Color Palette:</strong>
Predominantly features ${colorPalette}. These colors will work together to create a dynamic yet harmonious visual experience, reflecting the core mood.

<strong>Key Imagery & Visual Motifs:</strong>
Incorporate ${imagery}. Focus on compositions that tell a story or evoke a specific feeling related to the theme. Consider both literal and abstract representations.

<strong>Textures & Materials:</strong>
Emphasize ${textures}. The interplay of these surfaces will add depth and tactile interest to the visual design, enhancing the overall sensory experience.

<strong>Overarching Mood & Atmosphere:</strong>
The desired atmosphere is ${mood}. This mood should permeate all visual choices, from lighting to composition, creating a cohesive emotional resonance.

<strong>Suggested Key Elements & Design Principles:</strong>
Consider ${keyElements}. Pay attention to how these principles can guide the layout and arrangement of your mood board elements for maximum impact.
        `;
    };

    generateBtn.addEventListener('click', () => {
        const keywords = keywordsInput.value;
        outputArea.innerHTML = ''; // Clear previous output
        loadingIndicator.classList.remove('hidden'); // Show loading

        setTimeout(() => {
            const concept = generateMoodBoardConcept(keywords);
            outputArea.innerHTML = concept;
            loadingIndicator.classList.add('hidden'); // Hide loading
        }, 1500); // Simulate AI thinking time
    });
});
