document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const uploadedImage = document.getElementById('uploadedImage');
    const recognizeButton = document.getElementById('recognizeButton');
    const objectList = document.getElementById('objectList');
    const loadingIndicator = document.getElementById('loading');

    let uploadedFile = null;

    // Handle image file selection
    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            uploadedFile = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImage.src = e.target.result;
                uploadedImage.style.display = 'block';
                recognizeButton.disabled = false; // Enable button once image is loaded
                objectList.innerHTML = '<li class="placeholder">Click "Recognize Objects" to analyze.</li>'; // Reset results
            };
            reader.readAsDataURL(file);
        } else {
            uploadedFile = null;
            uploadedImage.src = '#';
            uploadedImage.style.display = 'none';
            recognizeButton.disabled = true; // Disable if no image
            objectList.innerHTML = '<li class="placeholder">Upload an image and click "Recognize" to see results.</li>';
        }
    });

    // Simulate AI recognition on button click
    recognizeButton.addEventListener('click', async () => {
        if (!uploadedFile) {
            alert('Please upload an image first!');
            return;
        }

        objectList.innerHTML = ''; // Clear previous results
        loadingIndicator.style.display = 'block'; // Show loading indicator
        recognizeButton.disabled = true; // Disable button during analysis

        try {
            // Simulate an API call with a delay
            const simulatedResults = await new Promise(resolve => {
                setTimeout(() => {
                    // This is where a real API call would go.
                    // For demonstration, we return a hardcoded set of objects.
                    // In a real app, you'd send `uploadedFile` to a backend/AI API.
                    const dummyObjects = [
                        { label: 'Dog', score: 0.98 },
                        { label: 'Leash', score: 0.85 },
                        { label: 'Grass', score: 0.92 },
                        { label: 'Sky', score: 0.90 },
                        { label: 'Tree', score: 0.88 },
                        { label: 'Ball', score: 0.75 },
                        { label: 'Person', score: 0.65 }
                    ];

                    // Make the results a bit dynamic based on file type or other factors
                    let results = [];
                    if (uploadedFile.type.includes('image/jpeg')) {
                        // Example: JPEGs might be outdoor scenes
                        results = dummyObjects.filter(obj => ['Dog', 'Grass', 'Sky', 'Tree', 'Person'].includes(obj.label));
                    } else if (uploadedFile.type.includes('image/png')) {
                        // Example: PNGs might be more indoor or graphic-like
                        results = dummyObjects.filter(obj => ['Dog', 'Ball', 'Leash'].includes(obj.label));
                    } else {
                        results = dummyObjects.slice(0, 5); // Default to first few if type unknown
                    }

                    // Add some random variation to scores
                    results = results.map(obj => ({
                        label: obj.label,
                        score: Math.min(0.99, parseFloat(obj.score) + (Math.random() * 0.1 - 0.05)).toFixed(2)
                    }));

                    resolve(results);
                }, 2000); // Simulate a 2-second API call
            });

            if (simulatedResults.length > 0) {
                simulatedResults.forEach(obj => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `<span>${obj.label}</span> <span>Confidence: ${Math.round(obj.score * 100)}%</span>`;
                    objectList.appendChild(listItem);
                });
            } else {
                objectList.innerHTML = '<li class="placeholder">No specific objects detected or results are empty.</li>';
            }

        } catch (error) {
            console.error('Simulated AI recognition failed:', error);
            objectList.innerHTML = '<li class="placeholder" style="color: red;">Error during analysis simulation.</li>';
        } finally {
            loadingIndicator.style.display = 'none'; // Hide loading indicator
            recognizeButton.disabled = false; // Re-enable button
        }
    });
});
