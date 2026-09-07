document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const contentImageInput = document.getElementById('contentImage');
    const styleImageInput = document.getElementById('styleImage');
    const contentPreview = document.getElementById('contentPreview');
    const stylePreview = document.getElementById('stylePreview');
    const transferStyleBtn = document.getElementById('transferStyleBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultImage = document.getElementById('resultImage');
    const errorMessage = document.getElementById('errorMessage');

    // Helper function to display image preview
    function displayImagePreview(inputElement, imgElement) {
        const file = inputElement.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imgElement.src = e.target.result;
                imgElement.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            imgElement.src = '';
            imgElement.style.display = 'none';
        }
    }

    // Event listeners for image input changes to show previews
    contentImageInput.addEventListener('change', () => displayImagePreview(contentImageInput, contentPreview));
    styleImageInput.addEventListener('change', () => displayImagePreview(styleImageInput, stylePreview));

    // Helper function to convert a File object to a Base64 string
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    }

    // Function to simulate AI style transfer API call
    // In a real application, this would make an actual fetch request to a backend server
    // that hosts your AI model (e.g., Python Flask/FastAPI, Node.js, etc.).
    // The backend would receive the images, process them, and return the result.
    async function simulateStyleTransferAPI(contentBase64, styleBase64) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay

        // Simulate API response
        const success = Math.random() > 0.1; // 90% chance of success

        if (success) {
            // In a real scenario, the API would return a base64 encoded image string
            // representing the styled output.
            // For this simulation, we use a placeholder base64 image (a grey square).
            const placeholderResultBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADIAQMAAACy+c5CAAAABlBMVEXw8PD////r/l3+AAAAAXRSTlMAQObYZgAAADxJREFUWMPtwTEBAAAAgqD+r2lHBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPhPAAFnAAE+U4VygAAAAABJRU5ErkJggg==";
            return placeholderResultBase64;
        } else {
            throw new Error('API simulation failed. Please try again.');
        }
    }

    // Event listener for the transfer style button
    transferStyleBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
        resultImage.style.display = 'none';
        resultImage.src = '';

        const contentFile = contentImageInput.files[0];
        const styleFile = styleImageInput.files[0];

        if (!contentFile || !styleFile) {
            errorMessage.textContent = 'Please upload both a content image and a style image.';
            errorMessage.style.display = 'block';
            return;
        }

        loadingIndicator.style.display = 'block';

        try {
            const contentBase64 = await fileToBase64(contentFile);
            const styleBase64 = await fileToBase64(styleFile);

            // Call the simulated API
            const resultBase64 = await simulateStyleTransferAPI(contentBase64, styleBase64);

            resultImage.src = resultBase64;
            resultImage.style.display = 'block';

        } catch (error) {
            errorMessage.textContent = `Error: ${error.message}`;
            errorMessage.style.display = 'block';
        } finally {
            loadingIndicator.style.display = 'none';
        }
    });
});
