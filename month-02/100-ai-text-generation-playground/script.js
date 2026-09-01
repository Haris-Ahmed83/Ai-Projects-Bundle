document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('prompt-input');
    const maxTokensInput = document.getElementById('max-tokens');
    const temperatureInput = document.getElementById('temperature');
    const generateBtn = document.getElementById('generate-btn');
    const outputTextarea = document.getElementById('output-text');

    generateBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        const maxTokens = parseInt(maxTokensInput.value, 10);
        const temperature = parseFloat(temperatureInput.value);

        if (!prompt) {
            outputTextarea.value = "Please enter a prompt to generate text.";
            return;
        }

        outputTextarea.value = "Generating text... Please wait.";
        generateBtn.disabled = true; // Disable button during generation

        try {
            const generatedText = await mockAIGenerate(prompt, { max_tokens: maxTokens, temperature: temperature });
            outputTextarea.value = generatedText;
        } catch (error) {
            outputTextarea.value = `Error: ${error.message}`;
        } finally {
            generateBtn.disabled = false; // Re-enable button
        }
    });

    /**
     * Mocks an AI text generation API call.
     * In a real application, this would be an actual API call to an LLM provider
     * (e.g., OpenAI, Google Gemini, Anthropic Claude) via a backend server to keep API keys secure.
     * @param {string} prompt The user's input prompt.
     * @param {object} params Generation parameters (e.g., max_tokens, temperature).
     * @returns {Promise<string>} A promise that resolves with the generated text.
     */
    function mockAIGenerate(prompt, params) {
        return new Promise(resolve => {
            // Simulate network latency and processing time
            setTimeout(() => {
                let response = `AI generated text based on your prompt:\n"${prompt}"\n\n`;
                response += `(Simulated parameters: Max Tokens = ${params.max_tokens}, Temperature = ${params.temperature})\n\n`;

                const lowerPrompt = prompt.toLowerCase();

                if (lowerPrompt.includes("story") || lowerPrompt.includes("narrative")) {
                    response += "Once upon a time, in a futuristic city powered by bioluminescent algae, a lone detective named Kaelin stumbled upon a mystery. A renowned scientist had vanished, leaving behind only a cryptic holographic message. The city's towering skyscrapers, once symbols of progress, now seemed to whisper secrets of a conspiracy far grander than Kaelin could have imagined. Every shadow held a clue, every alley a potential threat, as she delved deeper into the neon-lit labyrinth...";
                } else if (lowerPrompt.includes("code") || lowerPrompt.includes("python") || lowerPrompt.includes("javascript") || lowerPrompt.includes("function")) {
                    response += "```python\ndef fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        print(a, end=' ')\n        a, b = b, a + b\n\n# Example usage:\nfibonacci(10)\n```\n\nThis Python function generates the first 'n' numbers in the Fibonacci sequence. It's a classic example of iteration and multiple assignment in Python. The `end=' '` in the print statement ensures numbers are printed on the same line, separated by a space.";
                } else if (lowerPrompt.includes("idea") || lowerPrompt.includes("brainstorm") || lowerPrompt.includes("concept")) {
                    response += "Here's a creative idea for a new mobile app: 'Dream Weaver'. Users input keywords or fragments of their dreams, and the AI generates a coherent, imaginative story or even an artistic rendition of their dream. It could also include a social sharing feature and dream analysis based on common themes.";
                } else if (lowerPrompt.includes("poem") || lowerPrompt.includes("haiku") || lowerPrompt.includes("verse")) {
                    response += "Golden sun descends,\nPainting skies with fiery hues,\nDay's soft, whispered end.\n\nA short haiku, capturing the serene beauty of a sunset. The AI strives to evoke emotion and imagery through concise language.";
                } else {
                    response += "The digital loom began its work, weaving threads of thought into a vibrant tapestry of text. Concepts coalesced, ideas sparked, and narratives unfolded with an elegant precision. It spoke of boundless possibilities, of worlds yet to be imagined, and the intricate dance between data and creativity. The essence of human inquiry, distilled and reimagined by artificial intelligence, ready to inspire new visions.";
                }

                // Simulate token limit by truncating the response if it's longer than a rough estimate.
                // In a real LLM, max_tokens directly controls the output length during generation.
                const maxChars = params.max_tokens * 2.5; // Rough estimate: 1 token ~ 2.5 characters
                if (response.length > maxChars) {
                    response = response.substring(0, maxChars) + "... [Output truncated due to Max Tokens parameter]\n";
                }

                resolve(response);
            }, 1500); // Simulate 1.5 seconds of processing time
        });
    }
});
