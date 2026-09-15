document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('promptInput');
    const generateBtn = document.getElementById('generateBtn');
    const generatedImage = document.getElementById('generatedImage');
    const loadingIndicator = document.getElementById('loadingIndicator');

    // MOCK API endpoint and key - In a real app, this would be a backend endpoint
    // that securely calls a real AI API (e.g., OpenAI DALL-E, Stability AI).
    // For demonstration, we simulate success with a random image.
    const MOCK_API_ENDPOINT = 'https://api.mockaitexttoimage.com/generate';
    const MOCK_API_KEY = 'YOUR_MOCK_API_KEY'; // This would be securely handled by a backend

    generateBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();

        if (!prompt) {
            alert('Please enter a descriptive text prompt!');
            return;
        }

        // Show loading indicator, hide previous image
        loadingIndicator.classList.remove('hidden');
        generatedImage.classList.add('hidden');
        generatedImage.src = 'https://via.placeholder.com/800x600?text=Generating...'; // Placeholder while loading

        try {
            // Simulate API call to an AI model
            const imageUrl = await simulateApiCall(prompt);

            // Update the image source and show it
            generatedImage.src = imageUrl;
            generatedImage.alt = prompt; // Set alt text for accessibility
            generatedImage.classList.remove('hidden');

        } catch (error) {
            console.error('Error generating image:', error);
            alert('Failed to generate image. Please try again later.');
            generatedImage.src = 'https://via.placeholder.com/800x600?text=Error'; // Show error placeholder
            generatedImage.classList.remove('hidden'); // Still show placeholder
        } finally {
            // Hide loading indicator
            loadingIndicator.classList.add('hidden');
        }
    });

    /**
     * Simulates an API call to a text-to-image AI service.
     * In a real application, this would involve a fetch request to a backend
     * which then communicates with services like DALL-E, Stable Diffusion, etc.
     * @param {string} prompt The text description for the image.
     * @returns {Promise<string>} A promise that resolves with the URL of the generated image.
     */
    function simulateApiCall(prompt) {
        return new Promise((resolve) => {
            // Simulate network delay
            setTimeout(() => {
                // In a real scenario, you would make a fetch request like:
                /*
                fetch(MOCK_API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${MOCK_API_KEY}` // API key usually on backend
                    },
                    body: JSON.stringify({ prompt: prompt, size: '800x600' })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.imageUrl) {
                        resolve(data.imageUrl);
                    } else {
                        throw new Error('No image URL received from API');
                    }
                })
                .catch(error => {
                    console.error('Mock API Error:', error);
                    // Fallback or re-throw error to be caught by the main try-catch
                    throw new Error('Could not connect to AI service');
                });
                */

                // For this client-side demo, we return a random image from a public source
                // to simulate a successful generation.
                const randomSeed = Math.floor(Math.random() * 1000);
                const imageUrl = `https://picsum.photos/800/600?random=${randomSeed}`;
                resolve(imageUrl);

            }, 2000); // Simulate 2 seconds of AI processing time
        });
    }
});
