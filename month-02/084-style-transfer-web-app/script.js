document.addEventListener('DOMContentLoaded', () => {
    const contentImageInput = document.getElementById('contentImageInput');
    const styleImageInput = document.getElementById('styleImageInput');
    const contentImagePreview = document.getElementById('contentImagePreview');
    const styleImagePreview = document.getElementById('styleImagePreview');
    const applyStyleBtn = document.getElementById('applyStyleBtn');
    const resultImage = document.getElementById('resultImage');
    const loadingSpinner = document.getElementById('loadingSpinner');

    let contentImageFile = null;
    let styleImageFile = null;

    // Helper function to read a file and display it in an image element
    function readFileAndDisplay(file, imgElement) {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imgElement.src = e.target.result;
            };
            reader.readAsDataURL(file); // Read file as a data URL (base64)
        }
    }

    // Event listener for content image input
    contentImageInput.addEventListener('change', (event) => {
        contentImageFile = event.target.files[0];
        if (contentImageFile) {
            readFileAndDisplay(contentImageFile, contentImagePreview);
            // Reset result image when new content is uploaded
            resultImage.src = 'https://via.placeholder.com/400x300?text=Result+Image';
            resultImage.alt = 'Result Image';
        }
    });

    // Event listener for style image input
    styleImageInput.addEventListener('change', (event) => {
        styleImageFile = event.target.files[0];
        if (styleImageFile) {
            readFileAndDisplay(styleImageFile, styleImagePreview);
            // Reset result image when new style is uploaded
            resultImage.src = 'https://via.placeholder.com/400x300?text=Result+Image';
            resultImage.alt = 'Result Image';
        }
    });

    // Event listener for the "Apply Style" button
    applyStyleBtn.addEventListener('click', () => {
        if (!contentImageFile || !styleImageFile) {
            alert('Please upload both a content image and a style image.');
            return;
        }

        // Show loading spinner and disable button
        loadingSpinner.classList.remove('hidden');
        applyStyleBtn.disabled = true;
        resultImage.src = 'https://via.placeholder.com/400x300?text=Processing...'; // Indicate processing
        resultImage.alt = 'Processing...';

        // --- MOCK API CALL (for this vanilla JS, frontend-only project) ---
        // In a real application, you would send contentImageFile and styleImageFile
        // to a backend API (e.g., using FormData and fetch).
        /*
        const formData = new FormData();
        formData.append('content_image', contentImageFile);
        formData.append('style_image', styleImageFile);

        fetch('/api/style-transfer', {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.blob(); // Assuming API returns an image blob
        })
        .then(imageBlob => {
            const imageUrl = URL.createObjectURL(imageBlob);
            resultImage.src = imageUrl;
            resultImage.alt = 'Style Transferred Image';
        })
        .catch(error => {
            console.error('Style transfer failed:', error);
            alert('Failed to apply style. Please try again.');
            resultImage.src = 'https://via.placeholder.com/400x300?text=Error';
            resultImage.alt = 'Error';
        })
        .finally(() => {
            loadingSpinner.classList.add('hidden');
            applyStyleBtn.disabled = false;
        });
        */

        // Simulate a network request and processing time
        setTimeout(() => {
            // Hide loading spinner and re-enable button
            loadingSpinner.classList.add('hidden');
            applyStyleBtn.disabled = false;

            // Simulate a successful result with a random image from Lorem Picsum
            const mockResultImageUrl = 'https://picsum.photos/400/300?random=' + Math.floor(Math.random() * 1000);
            resultImage.src = mockResultImageUrl;
            resultImage.alt = 'Style Transferred Image';

            // You could also simulate an error:
            // alert('Simulated API error: Could not process images.');
            // resultImage.src = 'https://via.placeholder.com/400x300?text=Error';
            // resultImage.alt = 'Error';

        }, 3000); // Simulate 3 seconds of processing
    });
});
