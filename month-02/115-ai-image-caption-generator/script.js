document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const generateCaptionBtn = document.getElementById('generateCaptionBtn');
    const captionOutput = document.getElementById('captionOutput');
    const loadingIndicator = document.getElementById('loadingIndicator');

    let uploadedImageBase64 = null; // Store base64 of the uploaded image

    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                // Display image preview
                const img = document.createElement('img');
                img.src = e.target.result;
                imagePreview.innerHTML = ''; // Clear previous content
                imagePreview.appendChild(img);

                // Store base64 for "API" call
                uploadedImageBase64 = e.target.result;
                generateCaptionBtn.disabled = false; // Enable button
                captionOutput.textContent = 'Your caption will appear here...'; // Reset caption
            };
            reader.readAsDataURL(file); // Read file as Data URL (base64)
        } else {
            imagePreview.innerHTML = '<p>No image selected</p>';
            generateCaptionBtn.disabled = true;
            uploadedImageBase64 = null;
            captionOutput.textContent = 'Your caption will appear here...';
        }
    });

    generateCaptionBtn.addEventListener('click', () => {
        if (!uploadedImageBase64) {
            alert('Please upload an image first.');
            return;
        }

        // Show loading indicator
        captionOutput.textContent = '';
        loadingIndicator.classList.remove('hidden');
        generateCaptionBtn.disabled = true; // Disable button during generation

        // Simulate an AI API call
        // In a real application, you would send `uploadedImageBase64` to a backend API
        // that processes it with an AI model (e.g., Google Vision API, custom ML model).
        // For this front-end-only project, we'll mock the response.

        // Mock API response logic:
        const mockCaptions = [
            "A serene landscape with lush greenery and a clear blue sky.",
            "A close-up shot of a cute cat looking curiously at the camera.",
            "A bustling city street at night, illuminated by vibrant lights.",
            "A delicious plate of pasta garnished with fresh herbs.",
            "A person enjoying the sunset on a beach, with calm waves.",
            "A group of friends laughing and having fun together.",
            "An abstract art piece with bold colors and intricate patterns.",
            "A majestic mountain range covered in snow under a cloudy sky.",
            "A vibrant market stall overflowing with fresh fruits and vegetables.",
            "A dog playing fetch in a park on a sunny day."
        ];
        const randomCaption = mockCaptions[Math.floor(Math.random() * mockCaptions.length)];

        setTimeout(() => {
            // Hide loading indicator
            loadingIndicator.classList.add('hidden');
            generateCaptionBtn.disabled = false; // Re-enable button

            // Display the generated caption
            captionOutput.textContent = randomCaption;

            // In a real scenario, you might parse JSON response like:
            // fetch('/api/generate-caption', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ image: uploadedImageBase64 })
            // })
            // .then(response => response.json())
            // .then(data => {
            //     captionOutput.textContent = data.caption;
            // })
            // .catch(error => {
            //     console.error('Error generating caption:', error);
            //     captionOutput.textContent = 'Failed to generate caption. Please try again.';
            // })
            // .finally(() => {
            //     loadingIndicator.classList.add('hidden');
            //     generateCaptionBtn.disabled = false;
            // });

        }, 2000); // Simulate 2 seconds of API latency
    });
});
