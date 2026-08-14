document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const fileNameDisplay = document.getElementById('fileName');
    const imagePreview = document.getElementById('imagePreview');
    const noImageText = document.getElementById('noImageText');
    const extractButton = document.getElementById('extractButton');
    const statusText = document.getElementById('status');
    const extractedTextOutput = document.getElementById('extractedText');

    let uploadedImage = null; // To store the image file or data URL

    // Handle image file selection
    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            fileNameDisplay.textContent = file.name;
            uploadedImage = file; // Store the file object

            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.classList.remove('hidden');
                noImageText.classList.add('hidden');
                extractButton.disabled = false; // Enable the extract button
                statusText.textContent = ''; // Clear previous status
                extractedTextOutput.value = ''; // Clear previous text
            };
            reader.readAsDataURL(file);
        } else {
            fileNameDisplay.textContent = 'No image chosen';
            imagePreview.src = '#';
            imagePreview.classList.add('hidden');
            noImageText.classList.remove('hidden');
            extractButton.disabled = true; // Disable the button if no image
            statusText.textContent = '';
            extractedTextOutput.value = '';
            uploadedImage = null;
        }
    });

    // Handle text extraction
    extractButton.addEventListener('click', async () => {
        if (!uploadedImage) {
            statusText.textContent = 'Please upload an image first.';
            return;
        }

        extractButton.disabled = true;
        statusText.textContent = 'Loading OCR engine...';
        extractedTextOutput.value = '';

        try {
            // Create a Tesseract worker
            const worker = await Tesseract.createWorker();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');

            worker.setProgress(m => {
                if (m.status === 'recognizing') {
                    statusText.textContent = `Recognizing text: ${Math.round(m.progress * 100)}%`;
                } else if (m.status === 'loading tesseract core' || m.status === 'loading language traineddata') {
                    statusText.textContent = `Loading: ${m.status}...`;
                } else if (m.status === 'initializing tesseract') {
                    statusText.textContent = `Initializing OCR engine...`;
                } else {
                    // Fallback for other status messages
                    statusText.textContent = `${m.status.charAt(0).toUpperCase() + m.status.slice(1)}...`;
                }
            });

            const { data: { text } } = await worker.recognize(uploadedImage);
            extractedTextOutput.value = text;
            statusText.textContent = 'OCR complete!';

            await worker.terminate(); // Terminate the worker to free up resources

        } catch (error) {
            console.error('OCR Error:', error);
            statusText.textContent = `Error during OCR: ${error.message || 'Check console for details.'}`;
            extractedTextOutput.value = 'Failed to extract text.';
        } finally {
            extractButton.disabled = false; // Re-enable the button
        }
    });
});
