document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('imageUpload');
    const previewImage = document.getElementById('previewImage');
    const uploadPrompt = document.getElementById('uploadPrompt');
    const removeBgBtn = document.getElementById('removeBgBtn');
    const resultImage = document.getElementById('resultImage');
    const resultPrompt = document.getElementById('resultPrompt');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const downloadBtn = document.getElementById('downloadBtn');

    let uploadedFile = null;
    let processedImageBlobUrl = null;

    // Handle image file selection
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            uploadedFile = file;
            const reader = new FileReader();

            reader.onload = (e) => {
                previewImage.src = e.target.result;
                previewImage.classList.remove('hidden');
                uploadPrompt.classList.add('hidden');
                removeBgBtn.disabled = false;

                // Reset result display
                resultImage.src = '#';
                resultImage.classList.add('hidden');
                resultPrompt.classList.remove('hidden');
                loadingSpinner.classList.add('hidden');
                downloadBtn.classList.add('hidden');

                if (processedImageBlobUrl) {
                    URL.revokeObjectURL(processedImageBlobUrl);
                    processedImageBlobUrl = null;
                }
            };

            reader.readAsDataURL(file);
        } else {
            // No file selected, reset everything
            uploadedFile = null;
            previewImage.src = '#';
            previewImage.classList.add('hidden');
            uploadPrompt.classList.remove('hidden');
            removeBgBtn.disabled = true;

            resultImage.src = '#';
            resultImage.classList.add('hidden');
            resultPrompt.classList.remove('hidden');
            loadingSpinner.classList.add('hidden');
            downloadBtn.classList.add('hidden');

            if (processedImageBlobUrl) {
                URL.revokeObjectURL(processedImageBlobUrl);
                processedImageBlobUrl = null;
            }
        }
    });

    // Handle background removal button click
    removeBgBtn.addEventListener('click', () => {
        if (!uploadedFile) {
            alert('Please upload an image first.');
            return;
        }

        // Show loading spinner and hide prompts
        loadingSpinner.classList.remove('hidden');
        resultPrompt.classList.add('hidden');
        resultImage.classList.add('hidden');
        downloadBtn.classList.add('hidden');
        removeBgBtn.disabled = true;
        fileInput.disabled = true;

        // --- MOCK AI / IMAGE PROCESSING SIMULATION ---
        // In a real application, you would send the 'uploadedFile' (or its base64 data)
        // to a backend API for AI processing (e.g., using Python with OpenCV/U-Net, or a cloud AI service).
        // The API would return a transparent PNG or a URL to it.
        //
        // For this client-side-only demo, we'll simulate the process using a canvas
        // to create a *simple* transparent area, mimicking a removal.
        // This is NOT real AI background removal, but demonstrates image manipulation.

        const img = new Image();
        img.crossOrigin = 'anonymous'; // Needed if loading images from different origins
        img.src = previewImage.src; // Use the already loaded preview image

        img.onload = () => {
            setTimeout(() => { // Simulate API latency
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = img.width;
                canvas.height = img.height;

                // Draw the original image onto the canvas
                ctx.drawImage(img, 0, 0);

                // --- MOCK BACKGROUND REMOVAL LOGIC ---
                // This part simulates an 'AI' removal by simply making a central circular area transparent.
                // A real AI would intelligently identify and remove the background pixels.
                ctx.globalCompositeOperation = 'destination-out'; // Subsequent drawing operations will make existing pixels transparent
                ctx.fillStyle = 'rgba(0,0,0,1)'; // Any opaque color will work with destination-out

                // Draw a large circle in the center to represent the 'foreground' that remains
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const radius = Math.min(canvas.width, canvas.height) * 0.45; // Make it 45% of the smaller dimension
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();

                ctx.globalCompositeOperation = 'source-over'; // Reset composite operation

                // Convert the canvas content to a PNG Blob
                canvas.toBlob((blob) => {
                    if (blob) {
                        if (processedImageBlobUrl) {
                            URL.revokeObjectURL(processedImageBlobUrl);
                        }
                        processedImageBlobUrl = URL.createObjectURL(blob);
                        resultImage.src = processedImageBlobUrl;
                        resultImage.classList.remove('hidden');
                        downloadBtn.classList.remove('hidden');
                    } else {
                        alert('Failed to process image. Please try again.');
                        resultPrompt.classList.remove('hidden'); // Show prompt if processing fails
                    }

                    // Hide loading spinner and re-enable buttons
                    loadingSpinner.classList.add('hidden');
                    removeBgBtn.disabled = false;
                    fileInput.disabled = false;
                }, 'image/png');

            }, 1500); // Simulate 1.5 seconds of processing time
        };

        img.onerror = () => {
            alert('Error loading image for processing.');
            loadingSpinner.classList.add('hidden');
            resultPrompt.classList.remove('hidden');
            removeBgBtn.disabled = false;
            fileInput.disabled = false;
        };
    });

    // Handle download button click
    downloadBtn.addEventListener('click', () => {
        if (processedImageBlobUrl) {
            // The href and download attributes are already set dynamically when the image is processed.
            // The anchor tag's default behavior will handle the download.
        } else {
            alert('No processed image to download.');
        }
    });
});
