// script.js

document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const keywordInput = document.getElementById('keywordInput');
    const generatePaletteBtn = document.getElementById('generatePaletteBtn');
    const paletteDisplay = document.getElementById('paletteDisplay');

    // Predefined harmonious palettes for simulation
    const preDefinedPalettes = {
        "nature": [
            { hex: "#4CAF50", name: "Forest Green" },
            { hex: "#8BC34A", name: "Lime Green" },
            { hex: "#CDDC39", name: "Light Green" },
            { hex: "#FFEB3B", name: "Yellow Green" },
            { hex: "#795548", name: "Earth Brown" }
        ],
        "ocean": [
            { hex: "#2196F3", name: "Ocean Blue" },
            { hex: "#03A9F4", name: "Sky Blue" },
            { hex: "#00BCD4", name: "Aqua Cyan" },
            { hex: "#80DEEA", name: "Light Aqua" },
            { hex: "#B2EBF2", name: "Pale Cyan" }
        ],
        "sunset": [
            { hex: "#FF5722", name: "Sunset Orange" },
            { hex: "#FF9800", name: "Bright Orange" },
            { hex: "#FFC107", name: "Amber Glow" },
            { hex: "#FFEB3B", name: "Sun Yellow" },
            { hex: "#F44336", name: "Deep Red" }
        ],
        "vibrant": [
            { hex: "#E91E63", name: "Shocking Pink" },
            { hex: "#9C27B0", name: "Royal Purple" },
            { hex: "#673AB7", name: "Deep Violet" },
            { hex: "#3F51B5", name: "Indigo Blue" },
            { hex: "#00BCD4", name: "Electric Cyan" }
        ],
        "minimalist": [
            { hex: "#F5F5F5", name: "Off White" },
            { hex: "#E0E0E0", name: "Light Gray" },
            { hex: "#9E9E9E", name: "Medium Gray" },
            { hex: "#616161", name: "Dark Gray" },
            { hex: "#212121", name: "Charcoal Black" }
        ],
        "warm": [
            { hex: "#FF8A65", name: "Coral" },
            { hex: "#FFB74D", name: "Peach" },
            { hex: "#FFD54F", name: "Goldenrod" },
            { hex: "#FFECB3", name: "Cream" },
            { hex: "#D7CCC8", name: "Rose Quartz" }
        ],
        "cool": [
            { hex: "#64B5F6", name: "Sky Blue" },
            { hex: "#4DD0E1", name: "Turquoise" },
            { hex: "#81C784", name: "Mint Green" },
            { hex: "#A5D6A7", name: "Seafoam" },
            { hex: "#B39DDB", name: "Lavender" }
        ]
    };

    function getRandomPalette() {
        const paletteKeys = Object.keys(preDefinedPalettes);
        const randomKey = paletteKeys[Math.floor(Math.random() * paletteKeys.length)];
        return preDefinedPalettes[randomKey];
    }

    /**
     * Simulates AI-driven color palette generation.
     * In a real application, this would involve API calls to a backend
     * that uses machine learning models for image processing or natural language processing.
     * For this client-side example, we use predefined palettes and simple matching/random selection.
     */
    async function generatePalette(type, input) {
        paletteDisplay.innerHTML = '<p class="placeholder-text">Generating palette...</p>';
        
        return new Promise(resolve => {
            setTimeout(() => { // Simulate network/AI processing delay
                let palette = [];
                if (type === 'image' && input instanceof File) {
                    console.log("Simulating AI image processing for:", input.name);
                    // In a real app: upload image, AI extracts dominant colors, generates harmonious palette.
                    // For now, just return a random palette.
                    palette = getRandomPalette();
                } else if (type === 'keyword' && typeof input === 'string' && input.trim() !== '') {
                    console.log("Simulating AI keyword processing for:", input);
                    const lowerInput = input.toLowerCase();
                    let matched = false;
                    for (const key in preDefinedPalettes) {
                        if (lowerInput.includes(key) || key.includes(lowerInput)) {
                            palette = preDefinedPalettes[key];
                            matched = true;
                            break;
                        }
                    }
                    if (!matched) {
                        // If no specific keyword match, suggest a generic harmonious palette
                        palette = getRandomPalette();
                        console.log("No specific keyword match, returning a random harmonious palette.");
                    }
                } else {
                    console.log("No valid input provided.");
                    palette = [];
                }
                resolve(palette);
            }, 800); // Simulate a short delay for "AI" processing
        });
    }

    function displayPalette(palette) {
        paletteDisplay.innerHTML = ''; // Clear previous palettes
        if (palette.length === 0) {
            paletteDisplay.innerHTML = '<p class="placeholder-text">Could not generate a palette. Please try again with different input.</p>';
            return;
        }

        palette.forEach(color => {
            const swatch = document.createElement('div');
            swatch.classList.add('color-swatch');

            swatch.innerHTML = `
                <div class="color-box" style="background-color: ${color.hex};"></div>
                <div class="color-info">
                    <div class="color-hex">${color.hex}</div>
                    <div class="color-name">${color.name || 'Unnamed Color'}</div>
                </div>
            `;
            // Optional: Copy hex code on click
            swatch.addEventListener('click', () => {
                navigator.clipboard.writeText(color.hex).then(() => {
                    alert(`Copied ${color.hex} to clipboard!`);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            });
            paletteDisplay.appendChild(swatch);
        });
    }

    generatePaletteBtn.addEventListener('click', async () => {
        const imageFile = imageUpload.files[0];
        const keywords = keywordInput.value.trim();

        if (imageFile) {
            const palette = await generatePalette('image', imageFile);
            displayPalette(palette);
            keywordInput.value = ''; // Clear keyword input if image is used
        } else if (keywords) {
            const palette = await generatePalette('keyword', keywords);
            displayPalette(palette);
            imageUpload.value = ''; // Clear file input if keywords are used
        } else {
            alert('Please upload an image OR enter keywords to generate a palette.');
            paletteDisplay.innerHTML = '<p class="placeholder-text">Generated palettes will appear here.</p>';
        }
    });

    // Optional: Clear other input when one is focused/used
    imageUpload.addEventListener('change', () => {
        if (imageUpload.files.length > 0) {
            keywordInput.value = ''; // Clear keyword if an image is selected
        }
    });

    keywordInput.addEventListener('input', () => {
        if (keywordInput.value.trim() !== '') {
            imageUpload.value = ''; // Clear image if keywords are typed
        }
    });
});
