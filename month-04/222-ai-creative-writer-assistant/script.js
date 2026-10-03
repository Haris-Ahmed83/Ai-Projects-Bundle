document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('prompt');
    const contentTypeSelect = document.getElementById('contentType');
    const generateBtn = document.getElementById('generateBtn');
    const outputContent = document.getElementById('outputContent');
    const loadingIndicator = document.getElementById('loading');

    generateBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        const contentType = contentTypeSelect.value;

        if (!prompt) {
            alert('Please enter a prompt or idea!');
            return;
        }

        outputContent.textContent = ''; // Clear previous output
        loadingIndicator.classList.remove('hidden'); // Show loading

        try {
            // Simulate API call to an AI model
            // In a real application, this would be an actual fetch() request to an LLM API
            // e.g., using OpenAI's API, Google Gemini, etc., requiring an API key and backend.
            const generatedText = await simulateAIGeneration(prompt, contentType);
            outputContent.textContent = generatedText;
        } catch (error) {
            console.error('Error generating content:', error);
            outputContent.textContent = 'Failed to generate content. Please try again later.';
        } finally {
            loadingIndicator.classList.add('hidden'); // Hide loading
        }
    });

    /**
     * Simulates an AI content generation API call.
     * @param {string} prompt - The user's input prompt.
     * @param {string} type - The desired content type (story, poem, marketing, headline).
     * @returns {Promise<string>} - A promise that resolves with the generated text.
     */
    function simulateAIGeneration(prompt, type) {
        return new Promise(resolve => {
            setTimeout(() => {
                let response = '';
                const lowerPrompt = prompt.toLowerCase();

                switch (type) {
                    case 'story':
                        response = `Once upon a time, ${lowerPrompt.includes('a knight') ? 'a brave knight' : 'a hero'} embarked on a perilous journey.\nTheir quest led them through enchanted forests and across towering mountains.\nIn the end, they discovered that the greatest treasure was the courage they found within themselves.\n\nThis story was inspired by your prompt: "${prompt}"`;
                        break;
                    case 'poem':
                        response = `Oh, ${lowerPrompt.includes('nature') ? 'sweet nature, green and vast,' : 'the world, so grand and fast,'}\nWhere whispers of the wind forever last.\nA thought, a dream, a moment to embrace,\nIn every line, a beauty and a grace.\n\nInspired by: "${prompt}"`;
                        break;
                    case 'marketing':
                        response = `🚀 Unlock Your Potential with Our Revolutionary Product! 🚀\n\nTired of the old ways? Our innovative solution helps you [mention benefit 1], [mention benefit 2], and achieve [mention key outcome].\n\nJoin thousands of satisfied customers and experience the difference today!\nLearn more at www.yourproduct.com.\n\nGenerated for: "${prompt}"`;
                        break;
                    case 'headline':
                        response = `\n- The Ultimate Guide to ${prompt}\n- Master ${prompt} in 7 Easy Steps\n- Why ${prompt} is the Future of [Industry]\n- Discover the Secret to Perfect ${prompt}\n- ${prompt}: A Game Changer for You?`;
                        break;
                    default:
                        response = `I'm sorry, I can't generate content for "${type}" yet, but here's something for "${prompt}".\n\nThis is a placeholder for your creative text.`;
                }
                resolve(response);
            }, 1500); // Simulate network latency
        });
    }
});
