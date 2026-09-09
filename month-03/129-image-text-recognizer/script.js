document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const fileNameSpan = document.getElementById('fileName');
    const imagePreview = document.getElementById('imagePreview');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const extractedText = document.getElementById('extractedText');
    const copyTextBtn = document.getElementById('copyTextBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');

    let currentImageFile = null;

    // Event listener for image file selection
    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            fileNameSpan.textContent = file.name;
            currentImageFile = file;
            displayImageAndProcess(file);
        } else {
            fileNameSpan.textContent = 'No file chosen';
            imagePreview.classList.add('hidden');
            imagePreview.src = '#';
            extractedText.value = '';
            copyTextBtn.disabled = true;
            currentImageFile = null;
        }
    });

    // Function to display image and initiate OCR
    async function displayImageAndProcess(file) {
        // Clear previous results
        extractedText.value = '';
        copyTextBtn.disabled = true;
        loadingIndicator.classList.remove('hidden');
        imagePreview.classList.add('hidden');

        const reader = new FileReader();
        reader.onload = async (e) => {
            imagePreview.src = e.target.result;
            imagePreview.classList.remove('hidden');
            
            try {
                // Perform OCR using Tesseract.js
                const { data: { text } } = await Tesseract.recognize(
                    imagePreview.src, // Use the image data URL
                    'eng',             // Language code (English)
                    { 
                        logger: m => {
                            // Update loading indicator with progress
                            if (m.status === 'recognizing text') {
                                loadingIndicator.querySelector('p').textContent = `Processing image... (${Math.round(m.progress * 100)}%)`;
                            } else {
                                loadingIndicator.querySelector('p').textContent = `Processing image... (${m.status})`;
                            }
                        }
                    }
                );
                extractedText.value = text.trim();
                copyTextBtn.disabled = text.trim().length === 0;
            } catch (error) {
                console.error('OCR Error:', error);
                extractedText.value = 'Error recognizing text. Please try another image or ensure text is clear.';
                copyTextBtn.disabled = true;
            } finally {
                loadingIndicator.classList.add('hidden');
                loadingIndicator.querySelector('p').textContent = 'Processing image...'; // Reset text
            }
        };
        reader.readAsDataURL(file);
    }

    // Event listener for copy button
    copyTextBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(extractedText.value);
            alert('Text copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy text. Please try manually.');
        }
    });

    // Initialize button state
    copyTextBtn.disabled = true;
});
