document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const fileNameSpan = document.getElementById('fileName');
    const uploadedImage = document.getElementById('uploadedImage');
    const imageCanvas = document.getElementById('imageCanvas');
    const colorPaletteDiv = document.getElementById('colorPalette');
    const paletteMessage = document.getElementById('paletteMessage');
    const ctx = imageCanvas.getContext('2d');

    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            fileNameSpan.textContent = file.name;
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImage.src = e.target.result;
                uploadedImage.style.display = 'block';
                paletteMessage.textContent = 'Analyzing image...';
                colorPaletteDiv.innerHTML = ''; // Clear previous palette
            };
            reader.readAsDataURL(file);
        } else {
            fileNameSpan.textContent = 'No image chosen';
            uploadedImage.style.display = 'none';
            uploadedImage.src = '';
            colorPaletteDiv.innerHTML = '';
            paletteMessage.textContent = 'Upload an image to see its color palette.';
        }
    });

    uploadedImage.addEventListener('load', () => {
        generateColorPalette();
    });

    function generateColorPalette() {
        const img = uploadedImage;
        if (!img.src) {
            paletteMessage.textContent = 'Upload an image to see its color palette.';
            return;
        }

        // Set canvas dimensions to match image, but scale down for performance
        const maxWidth = 200; // Max width for analysis
        const scaleFactor = img.naturalWidth > maxWidth ? maxWidth / img.naturalWidth : 1;
        const canvasWidth = img.naturalWidth * scaleFactor;
        const canvasHeight = img.naturalHeight * scaleFactor;

        imageCanvas.width = canvasWidth;
        imageCanvas.height = canvasHeight;

        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

        try {
            const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
            const pixels = imageData.data;
            const colorCounts = new Map(); // Map<"r,g,b", count>

            // Sample pixels to improve performance and get dominant colors
            const sampleStep = 10; // Sample every 10th pixel
            for (let i = 0; i < pixels.length; i += 4 * sampleStep) {
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];

                // Basic quantization to group similar colors
                const quantizedR = Math.floor(r / 10) * 10;
                const quantizedG = Math.floor(g / 10) * 10;
                const quantizedB = Math.floor(b / 10) * 10;

                const key = `${quantizedR},${quantizedG},${quantizedB}`;
                colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
            }

            const sortedColors = Array.from(colorCounts.entries())
                .sort((a, b) => b[1] - a[1]) // Sort by count descending
                .slice(0, 6); // Take top 6 dominant colors

            displayColorPalette(sortedColors.map(entry => {
                const [r, g, b] = entry[0].split(',').map(Number);
                return `rgb(${r},${g},${b})`;
            }));

        } catch (error) {
            console.error('Error processing image:', error);
            paletteMessage.textContent = 'Could not process image for palette. Please try another image.';
            colorPaletteDiv.innerHTML = '';
        }
    }

    function displayColorPalette(colors) {
        colorPaletteDiv.innerHTML = ''; // Clear existing palette
        if (colors.length === 0) {
            paletteMessage.textContent = 'No dominant colors found for this image.';
            return;
        }

        paletteMessage.textContent = ''; // Clear message if palette is generated

        colors.forEach(color => {
            const colorSwatch = document.createElement('div');
            colorSwatch.classList.add('color-swatch');
            colorSwatch.style.backgroundColor = color;
            colorSwatch.textContent = color.toUpperCase();

            // Determine if text should be light or dark based on background color luminance
            const rgb = color.match(/\d+/g).map(Number);
            const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
            if (luminance > 0.5) {
                colorSwatch.style.color = '#333'; // Dark text for light colors
                colorSwatch.style.textShadow = 'none';
            } else {
                colorSwatch.style.color = '#fff'; // Light text for dark colors
                colorSwatch.style.textShadow = '1px 1px 2px rgba(0,0,0,0.5)';
            }

            colorPaletteDiv.appendChild(colorSwatch);
        });
    }
});
