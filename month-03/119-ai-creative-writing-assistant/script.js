document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('userInput');
    const promptType = document.getElementById('promptType');
    const generateBtn = document.getElementById('generateBtn');
    const outputDisplay = document.getElementById('outputDisplay');
    const loadingIndicator = document.getElementById('loadingIndicator');

    generateBtn.addEventListener('click', () => {
        const inputText = userInput.value.trim();
        const selectedType = promptType.value;

        if (!inputText && selectedType === 'general') {
            outputDisplay.textContent = "Please provide some input for a general prompt, or select a specific idea type.";
            return;
        }

        outputDisplay.textContent = ''; // Clear previous output
        loadingIndicator.style.display = 'block'; // Show loading spinner
        generateBtn.disabled = true; // Disable button during generation

        // Simulate API call delay for AI generation
        setTimeout(() => {
            const aiResponse = generateAIResponse(inputText, selectedType);
            outputDisplay.textContent = aiResponse;
            loadingIndicator.style.display = 'none'; // Hide loading spinner
            generateBtn.disabled = false; // Re-enable button
        }, 1500); // Simulate 1.5 seconds delay
    });

    /**
     * Simulates an AI text generation based on user input and selected type.
     * In a real application, this would involve an actual API call to an AI service (e.g., OpenAI, Google AI).
     */
    function generateAIResponse(input, type) {
        let response = "I'm sorry, I couldn't generate an idea based on your input right now. Please try again.";

        const genericPrompts = [
            "What if the protagonist's biggest fear is actually their greatest strength?",
            "Explore a world where dreams can be harvested as a power source.",
            "A forgotten artifact holds the key to an ancient, powerful secret.",
            "The last person on Earth discovers they are not alone.",
            "A seemingly ordinary pet possesses extraordinary abilities.",
            "A time traveler accidentally alters their own past, creating a paradox."
        ];

        const plotTwists = [
            "The mentor character is actually the main antagonist.",
            "The lost treasure was inside the protagonist's possession all along.",
            "The 'villain' was working to prevent an even greater catastrophe.",
            "The entire world the characters know is a simulation or a dream.",
            "The protagonist's deceased loved one is still alive, but in a different form or dimension.",
            "The prophecy the hero is trying to fulfill is actually a trap set by the gods."
        ];

        const characterIdeas = [
            "A cynical detective who can read minds, but only of animals.",
            "A chef whose dishes can evoke specific memories or emotions in those who eat them.",
            "A librarian who secretly hoards magical knowledge, protecting it from those who would misuse it.",
            "A retired warrior haunted by the ghost of their last kill.",
            "A young inventor who creates gadgets that consistently fail in hilarious ways, but eventually stumbles upon something groundbreaking.",
            "A quiet observer who documents the lives of others, only to find themselves drawn into a grand conspiracy."
        ];

        const settingDescriptions = [
            "A sprawling megacity built vertically, where the poorest live in the perpetual twilight of the lower levels and the elite reside in sun-drenched sky-palaces.",
            "An ancient forest where trees glow with bioluminescence, and strange, melodic sounds echo through the canopy, hinting at unseen magical creatures.",
            "A desolate, wind-swept desert dotted with the skeletal remains of colossal, unknown beasts, and where mirages often hide dangerous realities.",
            "A floating island nation held aloft by ancient magic, constantly drifting across a vast ocean, its culture shaped by isolation and the ever-changing horizon.",
            "A bustling steampunk metropolis powered by intricate clockwork mechanisms and steam engines, where airships fill the skies and automatons serve the populace.",
            "A forgotten underground city, illuminated by glowing crystals and filled with remnants of a highly advanced, yet vanished, civilization."
        ];

        const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

        switch (type) {
            case 'general':
                if (input) {
                    response = `Based on "${input}", consider this: What if a key element of the story is not what it seems? Or, introduce a sudden, unexpected alliance/betrayal. Perhaps the true goal is something entirely different.`;
                    if (Math.random() < 0.5) {
                        response += ` Also, what if the setting itself holds a hidden secret that influences the plot?`;
                    } else {
                        response += ` Think about a twist where the antagonist has a surprisingly sympathetic motive.`;
                    }
                } else {
                    response = getRandom(genericPrompts);
                }
                break;
            case 'plotTwist':
                response = getRandom(plotTwists);
                if (input) {
                    response += ` Consider how this twist could impact the scenario: "${input}".`;
                }
                break;
            case 'characterIdea':
                response = getRandom(characterIdeas);
                if (input) {
                    response += ` Imagine this character existing within the world you described: "${input}".`;
                }
                break;
            case 'settingDescription':
                response = getRandom(settingDescriptions);
                if (input) {
                    response += ` How would a story set in "${input}" be influenced by this type of environment?`;
                }
                break;
            default:
                response = "Please select a valid prompt type.";
        }
        return response;
    }
});
