document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('prompt-input');
    const generateBtn = document.getElementById('generate-btn');
    const imageDisplay = document.getElementById('image-display');
    const generatedImage = document.getElementById('generated-image');
    const placeholderText = imageDisplay.querySelector('.placeholder-text');
    const loadingSpinner = document.getElementById('loading-spinner');

    // Initial state setup
    imageDisplay.style.border = '2px dashed #444466';
    imageDisplay.style.backgroundColor = '#333355';
    placeholderText.style.display = 'block';
    generatedImage.style.display = 'none';
    loadingSpinner.style.display = 'none';

    // --- Configuration for API (replace with your actual API endpoint and key) ---
    // For a real application, consider using a backend proxy to handle API keys securely
    // and to avoid CORS issues. This example simulates the API call.
    const API_ENDPOINT = 'https://api.example.com/generate-image'; // Placeholder
    const API_KEY = 'YOUR_SUPER_SECRET_API_KEY'; // Placeholder

    // Function to simulate AI image generation
    const simulateImageGeneration = async (prompt) => {
        // In a real scenario, you would make an API call here. Example:
        /*
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}` // Or whatever auth your API uses
                },
                body: JSON.stringify({ prompt: prompt, options: { width: 600, height: 400 } })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate image');
            }

            const data = await response.json();
            return data.imageUrl; // Assuming the API returns an image URL

        } catch (error) {
            console.error('API Error:', error);
            throw new Error('Could not generate image. Please try again.');
        }
        */

        // --- Simulation using setTimeout for a static image --- 
        // This returns a random image from picsum.photos to simulate dynamic content.
        return new Promise(resolve => {
            setTimeout(() => {
                const width = 600;
                const height = 400;
                const seed = Math.floor(Math.random() * 1000); 
                const imageUrl = `https://picsum.photos/${width}/${height}?random=${seed}`;
                resolve(imageUrl);
            }, 3000); // Simulate network latency of 3 seconds
        });
    };

    const generateImage = async () => {
        const prompt = promptInput.value.trim();

        if (!prompt) {
            alert('Please enter a descriptive prompt!');
            return;
        }

        // Hide placeholder, show loading
        placeholderText.style.display = 'none';
        generatedImage.style.display = 'none';
        loadingSpinner.style.display = 'block';
        imageDisplay.style.border = 'none'; // Hide border during loading
        imageDisplay.style.backgroundColor = '#333355'; // Keep background consistent

        try {
            const imageUrl = await simulateImageGeneration(prompt);
            generatedImage.src = imageUrl;
            generatedImage.alt = `Generated AI Image for: ${prompt}`;
            generatedImage.style.display = 'block';
            imageDisplay.style.border = '2px solid #50fa7b'; // Indicate success
            imageDisplay.style.backgroundColor = '#282846'; // Darker background when image is present
            placeholderText.style.display = 'none'; // Ensure placeholder is hidden on success
        } catch (error) {
            console.error('Error generating image:', error);
            generatedImage.style.display = 'none';
            placeholderText.textContent = `Error: ${error.message || 'Failed to generate image.'} Please try again.`;
            placeholderText.style.display = 'block';
            imageDisplay.style.border = '2px dashed #ff5555'; // Indicate error
            imageDisplay.style.backgroundColor = '#333355'; // Reset background
        } finally {
            loadingSpinner.style.display = 'none';
        }
    };

    generateBtn.addEventListener('click', generateImage);

    // Optional: Allow pressing Enter in textarea to generate (if textarea is focused)
    promptInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) { // Shift+Enter for new line
            event.preventDefault(); // Prevent default Enter behavior
            generateImage();
        }
    });
});
