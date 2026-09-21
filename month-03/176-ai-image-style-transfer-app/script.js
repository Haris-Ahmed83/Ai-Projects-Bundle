document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const contentImageInput = document.getElementById('contentImageInput');
    const styleImageInput = document.getElementById('styleImageInput');
    const contentImagePreview = document.getElementById('contentImagePreview');
    const styleImagePreview = document.getElementById('styleImagePreview');
    const resultImage = document.getElementById('resultImage');
    const transferButton = document.getElementById('transferButton');
    const loadingIndicator = document.getElementById('loadingIndicator');

    // Store file objects
    let contentImageFile = null;
    let styleImageFile = null;

    // Function to update the state of the transfer button
    const updateTransferButtonState = () => {
        if (contentImageFile && styleImageFile) {
            transferButton.disabled = false;
        } else {
            transferButton.disabled = true;
        }
    };

    // Function to load and display an image preview
    const loadImage = (file, imgElement, callback) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imgElement.src = e.target.result;
                if (callback) callback();
            };
            reader.readAsDataURL(file);
        } else {
            imgElement.src = imgElement.alt.includes('Content') ? 'https://via.placeholder.com/250x250?text=Your+Image' : 'https://via.placeholder.com/250x250?text=Style+Image';
            if (callback) callback();
        }
    };

    // Event listener for content image input
    contentImageInput.addEventListener('change', (event) => {
        contentImageFile = event.target.files[0];
        loadImage(contentImageFile, contentImagePreview, updateTransferButtonState);
        // Reset result image when inputs change
        resultImage.src = 'https://via.placeholder.com/350x350?text=Result+Appears+Here';
    });

    // Event listener for style image input
    styleImageInput.addEventListener('change', (event) => {
        styleImageFile = event.target.files[0];
        loadImage(styleImageFile, styleImagePreview, updateTransferButtonState);
        // Reset result image when inputs change
        resultImage.src = 'https://via.placeholder.com/350x350?text=Result+Appears+Here';
    });

    // Event listener for the Transfer Style button
    transferButton.addEventListener('click', () => {
        if (!contentImageFile || !styleImageFile) {
            alert('Please upload both a content image and a style image.');
            return;
        }

        // Simulate API call for style transfer
        // In a real application, you would send contentImageFile and styleImageFile
        // to a backend AI/ML service (e.g., via fetch API to an endpoint like /api/style-transfer).
        // The backend would process the images using models like VGG, CycleGAN, etc.,
        // and return the styled image.

        transferButton.disabled = true;
        loadingIndicator.classList.add('active');
        resultImage.src = 'https://via.placeholder.com/350x350?text=Processing...'; // Indicate processing

        // Simulate a network delay for AI processing
        setTimeout(() => {
            loadingIndicator.classList.remove('active');
            transferButton.disabled = false;

            // --- SIMULATION OF RESULT --- //
            // For this client-side demo, we'll just show a generic placeholder
            // or a visually 'processed' placeholder to represent the AI output.
            // A real AI service would return a data URL or a URL to the styled image.
            const simulatedResultImageSrc = 'https://via.placeholder.com/350x350/800080/FFFFFF?text=Styled+Image+Result!\n(Simulated+AI)';
            resultImage.src = simulatedResultImageSrc;

            console.log('Style transfer simulated successfully!');
            console.log('Content Image:', contentImageFile.name);
            console.log('Style Image:', styleImageFile.name);

            // You could also try a simple visual blend for a more dynamic, albeit not AI, effect:
            // For example, overlaying the style image on the content image with CSS blend modes
            // or filters, but that adds complexity beyond a concise functional demo.
            // Keeping it simple with a placeholder for clarity of simulation.

        }, 3000); // Simulate 3 seconds of processing time
    });

    // Initialize button state
    updateTransferButtonState();
});
