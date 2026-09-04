document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const uploadedImage = document.getElementById('uploadedImage');
    const imageCanvas = document.getElementById('imageCanvas');
    const ctx = imageCanvas.getContext('2d');
    const colorPaletteDiv = document.getElementById('colorPalette');

    // Constants for color extraction
    const PALETTE_SIZE = 8; // Number of dominant colors to extract
    const PIXEL_SAMPLE_INTERVAL = 10; // Sample every Nth pixel to speed up processing
    const COLOR_BUCKET_SIZE = 16; // Group RGB values into buckets (e.g., 0-15, 16-31, etc.)

    imageUpload.addEventListener('change', handleImageUpload);

    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) {
            fileNameDisplay.textContent = '';
            uploadedImage.style.display = 'none';
            uploadedImage.src = '#'; // Clear image source
            colorPaletteDiv.innerHTML = '<p class="placeholder">Upload an image to see its color palette.</p>';
            return;
        }

        fileNameDisplay.textContent = `File: ${file.name}`;

        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedImage.src = e.target.result;
            uploadedImage.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    uploadedImage.onload = () => {
        extractColors(uploadedImage);
    };

    function extractColors(img) {
        // Clear previous palette
        colorPaletteDiv.innerHTML = '<p>Processing image...</p>';

        // Ensure canvas dimensions match image to avoid distortion
        // Limit canvas size to improve performance for very large images
        const MAX_CANVAS_SIZE = 500; // Max width/height for canvas processing
        let { naturalWidth, naturalHeight } = img;

        if (naturalWidth > MAX_CANVAS_SIZE || naturalHeight > MAX_CANVAS_SIZE) {
            if (naturalWidth > naturalHeight) {
                naturalHeight = Math.round(naturalHeight * (MAX_CANVAS_SIZE / naturalWidth));
                naturalWidth = MAX_CANVAS_SIZE;
            } else {
                naturalWidth = Math.round(naturalWidth * (MAX_CANVAS_SIZE / naturalHeight));
                naturalHeight = MAX_CANVAS_SIZE;
            }
        }

        imageCanvas.width = naturalWidth;
        imageCanvas.height = naturalHeight;
        ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);

        try {
            const imageData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height).data;
            const colorCounts = {}; // Stores buckets: { 'r_g_b_bucket': { count: N, rSum: M, gSum: K, bSum: L } }

            for (let i = 0; i < imageData.length; i += 4 * PIXEL_SAMPLE_INTERVAL) {
                const r = imageData[i];
                const g = imageData[i + 1];
                const b = imageData[i + 2];
                // Ignore transparent pixels (alpha < 128) for a cleaner palette
                if (imageData[i + 3] < 128) continue; 

                // Create a 'bucket' key for similar colors
                const rBucket = Math.floor(r / COLOR_BUCKET_SIZE) * COLOR_BUCKET_SIZE;
                const gBucket = Math.floor(g / COLOR_BUCKET_SIZE) * COLOR_BUCKET_SIZE;
                const bBucket = Math.floor(b / COLOR_BUCKET_SIZE) * COLOR_BUCKET_SIZE;
                const bucketKey = `${rBucket}_${gBucket}_${bBucket}`;

                if (!colorCounts[bucketKey]) {
                    colorCounts[bucketKey] = { count: 0, rSum: 0, gSum: 0, bSum: 0 };
                }
                colorCounts[bucketKey].count++;
                colorCounts[bucketKey].rSum += r;
                colorCounts[bucketKey].gSum += g;
                colorCounts[bucketKey].bSum += b;
            }

            // Convert map to array, calculate average colors, and sort by count
            const sortedColors = Object.values(colorCounts)
                .map(bucket => ({
                    r: Math.round(bucket.rSum / bucket.count),
                    g: Math.round(bucket.gSum / bucket.count),
                    b: Math.round(bucket.bSum / bucket.count),
                    count: bucket.count
                }))
                .sort((a, b) => b.count - a.count); // Sort descending by count

            displayPalette(sortedColors.slice(0, PALETTE_SIZE));

        } catch (error) {
            console.error("Error processing image:", error);
            colorPaletteDiv.innerHTML = '<p class="placeholder">Could not process image. It might be too large or have security restrictions (CORS).</p>';
        }
    }

    function displayPalette(colors) {
        colorPaletteDiv.innerHTML = ''; // Clear existing palette
        if (colors.length === 0) {
            colorPaletteDiv.innerHTML = '<p class="placeholder">No dominant colors found.</p>';
            return;
        }

        colors.forEach(color => {
            const hex = rgbToHex(color.r, color.g, color.b);
            const colorItem = document.createElement('div');
            colorItem.className = 'color-item';
            colorItem.style.backgroundColor = hex;

            // Determine if text should be light or dark for contrast (YIQ method)
            const brightness = ((color.r * 299) + (color.g * 587) + (color.b * 114)) / 1000;
            if (brightness > 180) { // Arbitrary threshold for light colors
                colorItem.classList.add('light-text');
            }

            const colorText = document.createElement('span');
            colorText.textContent = hex.toUpperCase();
            colorItem.appendChild(colorText);

            // Add copy-to-clipboard functionality
            colorItem.addEventListener('click', () => {
                navigator.clipboard.writeText(hex).then(() => {
                    const originalText = colorText.textContent;
                    colorText.textContent = 'Copied!';
                    setTimeout(() => {
                        colorText.textContent = originalText;
                    }, 1000);
                }).catch(err => {
                    console.error('Failed to copy color:', err);
                    alert('Failed to copy color. Please copy manually: ' + hex);
                });
            });

            colorPaletteDiv.appendChild(colorItem);
        });
    }

    // Helper function to convert RGB to Hex
    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
});
