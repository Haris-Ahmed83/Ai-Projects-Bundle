document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const uploadedImage = document.getElementById('uploadedImage');
    const imageCanvas = document.getElementById('imageCanvas');
    const asciiOutput = document.getElementById('asciiOutput');
    const convertBtn = document.getElementById('convertBtn');
    const ctx = imageCanvas.getContext('2d');

    let currentImage = null; // Store the loaded Image object

    // ASCII character set from darkest to lightest
    const asciiChars = "@%#*+=-:. ";

    // Function to calculate luminance (grayscale value) of a pixel
    function getLuminance(r, g, b) {
        // ITU-R BT.709 standard for luminance
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    // Function to map luminance to an ASCII character
    function mapLuminanceToChar(luminance) {
        // Luminance ranges from 0 (black) to 255 (white)
        // We want dark pixels to map to dense characters (start of asciiChars)
        // and light pixels to map to sparse characters (end of asciiChars)
        const index = Math.floor(luminance / 255 * (asciiChars.length - 1));
        return asciiChars[index];
    }

    // Handle image file selection
    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImage.src = e.target.result;
                uploadedImage.style.display = 'block'; // Show the img element

                currentImage = new Image();
                currentImage.onload = () => {
                    // Clear previous canvas content
                    ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
                    
                    // Set canvas dimensions to match the image
                    // For better performance and fitting ASCII output, scale down if image is too large.
                    const maxWidth = 400; // Max width for the canvas (visual display and processing size)
                    const scaleFactor = Math.min(maxWidth / currentImage.width, 1); // Only scale down if larger than maxWidth
                    
                    imageCanvas.width = currentImage.width * scaleFactor;
                    imageCanvas.height = currentImage.height * scaleFactor;

                    ctx.drawImage(currentImage, 0, 0, imageCanvas.width, imageCanvas.height);
                    convertBtn.disabled = false; // Enable convert button once image is loaded
                    asciiOutput.textContent = ''; // Clear previous ASCII output
                };
                currentImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            uploadedImage.src = '#';
            uploadedImage.style.display = 'none';
            convertBtn.disabled = true;
            asciiOutput.textContent = '';
        }
    });

    // Handle conversion button click
    convertBtn.addEventListener('click', () => {
        if (!currentImage) {
            alert('Please upload an image first!');
            return;
        }

        // Get image data from the canvas
        const imageData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
        const pixels = imageData.data; // RGBA pixel data

        // Define ASCII conversion parameters
        const charactersPerWidth = 80; // Target number of characters horizontally in the output
        const characterWidth = Math.floor(imageCanvas.width / charactersPerWidth);
        
        // ASCII characters are typically taller than they are wide (e.g., 9:5 or 2:1 aspect ratio in monospace fonts).
        // Adjust block height to compensate for font aspect ratio, making the output look less stretched.
        const characterHeight = Math.floor(characterWidth * 1.8); // Adjust multiplier for desired output aspect ratio

        let asciiArt = '';

        // Loop through the image in blocks
        for (let y = 0; y < imageCanvas.height; y += characterHeight) {
            for (let x = 0; x < imageCanvas.width; x += characterWidth) {
                let totalLuminance = 0;
                let pixelCount = 0;

                // Calculate average luminance for the current block
                for (let blockY = 0; blockY < characterHeight && (y + blockY) < imageCanvas.height; blockY++) {
                    for (let blockX = 0; blockX < characterWidth && (x + blockX) < imageCanvas.width; blockX++) {
                        const pixelIndex = ((y + blockY) * imageCanvas.width + (x + blockX)) * 4;
                        const r = pixels[pixelIndex];
                        const g = pixels[pixelIndex + 1];
                        const b = pixels[pixelIndex + 2];
                        // const a = pixels[pixelIndex + 3]; // Alpha channel, not needed for luminance

                        totalLuminance += getLuminance(r, g, b);
                        pixelCount++;
                    }
                }

                const averageLuminance = pixelCount > 0 ? totalLuminance / pixelCount : 0;
                asciiArt += mapLuminanceToChar(averageLuminance);
            }
            asciiArt += '\n'; // New line after each row of characters
        }

        asciiOutput.textContent = asciiArt;
    });
});
