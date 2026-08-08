document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const fileNameSpan = document.getElementById('fileName');
    const uploadedImage = document.getElementById('uploadedImage');
    const imagePlaceholder = document.getElementById('imagePlaceholder');
    const colorPaletteDiv = document.getElementById('colorPalette');

    // Hidden canvas for image processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.style.display = 'none'; // Keep it hidden
    document.body.appendChild(canvas); // Append to body, but hidden

    imageUpload.addEventListener('change', handleImageUpload);

    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) {
            fileNameSpan.textContent = 'No image chosen';
            uploadedImage.style.display = 'none';
            imagePlaceholder.style.display = 'block';
            displayMessage('Upload an image to see its color palette.');
            return;
        }

        fileNameSpan.textContent = file.name;

        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedImage.src = e.target.result;
            uploadedImage.style.display = 'block';
            imagePlaceholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    uploadedImage.addEventListener('load', () => {
        extractAndDisplayColors(uploadedImage);
    });

    function extractAndDisplayColors(imgElement) {
        // Clear previous palette and show processing message
        displayMessage('Analyzing image...');

        // Set canvas dimensions to match image
        canvas.width = imgElement.naturalWidth;
        canvas.height = imgElement.naturalHeight;

        // Draw the image onto the canvas
        ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

        try {
            // Get image data from canvas
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const dominantColors = getDominantColors(imageData);
            displayPalette(dominantColors);
        } catch (error) {
            console.error("Error processing image data:", error);
            displayMessage('Error processing image. Please try another one.');
        }
    }

    /**
     * Extracts dominant colors from image data.
     * @param {ImageData} imageData The pixel data from a canvas.
     * @param {number} numColors The desired number of colors in the palette.
     * @param {number} sampleSize How many pixels to skip when sampling (e.g., 10 means 1 in 100 pixels).
     * @param {number} distinctnessThreshold Max RGB component difference for colors to be considered similar.
     * @returns {Array<Object>} An array of color objects { rgb: [r,g,b], hex: '#RRGGBB' }.
     */
    function getDominantColors(imageData, numColors = 8, sampleSize = 10, distinctnessThreshold = 35) {
        const data = imageData.data; // RGBA pixel data
        const pixelCountMap = new Map(); // Map<"r,g,b", count>

        const width = imageData.width;
        const height = imageData.height;

        // Sample pixels in a 2D grid to improve performance
        for (let y = 0; y < height; y += sampleSize) {
            for (let x = 0; x < width; x += sampleSize) {
                const i = (y * width + x) * 4; // Index for RGBA data (r, g, b, a)
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];

                // Filter out highly transparent, very dark, or very white pixels as potential background/noise
                if (a < 128 || (r < 10 && g < 10 && b < 10) || (r > 245 && g > 245 && b > 245)) {
                    continue;
                }

                const rgbKey = `${r},${g},${b}`;
                pixelCountMap.set(rgbKey, (pixelCountMap.get(rgbKey) || 0) + 1);
            }
        }

        // Convert map to array and sort by frequency (most frequent first)
        const sortedColors = Array.from(pixelCountMap.entries()).sort((a, b) => b[1] - a[1]);

        const palette = [];
        for (const [rgbKey] of sortedColors) {
            if (palette.length >= numColors) break; // Stop if we have enough colors

            const [r, g, b] = rgbKey.split(',').map(Number);
            let isDistinct = true;

            // Check if this color is too similar to any color already in the palette
            for (const pColor of palette) {
                const [pr, pg, pb] = pColor.rgb;
                // Calculate max difference in RGB components (simple perceptual distinctness)
                const diff = Math.max(Math.abs(r - pr), Math.abs(g - pg), Math.abs(b - pb));
                if (diff < distinctnessThreshold) {
                    isDistinct = false;
                    break; // Not distinct enough, move to the next color
                }
            }

            if (isDistinct) {
                palette.push({ rgb: [r, g, b], hex: rgbToHex(r, g, b) });
            }
        }

        return palette;
    }

    /**
     * Converts RGB color components to a hexadecimal string.
     * @param {number} r Red component (0-255).
     * @param {number} g Green component (0-255).
     * @param {number} b Blue component (0-255).
     * @returns {string} Hexadecimal color string (e.g., "#FF00AA").
     */
    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    /**
     * Displays the generated color palette in the UI.
     * @param {Array<Object>} colors An array of color objects to display.
     */
    function displayPalette(colors) {
        colorPaletteDiv.innerHTML = ''; // Clear existing content

        if (colors.length === 0) {
            displayMessage('Could not extract a distinct color palette. Try another image?');
            return;
        }

        colors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';

            const colorBox = document.createElement('div');
            colorBox.className = 'color-box';
            colorBox.style.backgroundColor = color.hex;

            const colorInfo = document.createElement('div');
            colorInfo.className = 'color-info';
            colorInfo.textContent = color.hex;

            swatch.appendChild(colorBox);
            swatch.appendChild(colorInfo);

            // Optional: Copy hex code to clipboard on click
            swatch.addEventListener('click', () => {
                navigator.clipboard.writeText(color.hex).then(() => {
                    // Simple visual feedback
                    const originalText = colorInfo.textContent;
                    colorInfo.textContent = 'Copied!';
                    setTimeout(() => {
                        colorInfo.textContent = originalText;
                    }, 800);
                }).catch(err => {
                    console.error('Failed to copy hex code: ', err);
                    alert('Failed to copy color: ' + color.hex + '. Please copy manually.');
                });
            });

            colorPaletteDiv.appendChild(swatch);
        });
    }

    /**
     * Displays a message in the color palette area.
     * @param {string} message The message to display.
     */
    function displayMessage(message) {
        colorPaletteDiv.innerHTML = `<p class="placeholder-text">${message}</p>`;
    }
});
