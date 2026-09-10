document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const uploadedImage = document.getElementById('uploadedImage');
    const detectionCanvas = document.getElementById('detectionCanvas');
    const ctx = detectionCanvas.getContext('2d');
    const detectButton = document.getElementById('detectButton');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const objectList = document.getElementById('objectList');
    const noImageMessage = document.getElementById('noImageMessage');

    let currentImage = null; // To store the image element for drawing

    // Function to clear canvas
    function clearCanvas() {
        ctx.clearRect(0, 0, detectionCanvas.width, detectionCanvas.height);
    }

    // Handle image upload
    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImage.src = e.target.result;
                // uploadedImage.onload will handle visibility and canvas sizing
                detectButton.disabled = true; // Disable until image fully loaded

                // Clear previous results
                clearCanvas();
                objectList.innerHTML = '<li>No objects detected yet.</li>';
            };
            reader.readAsDataURL(file);
        } else {
            uploadedImage.src = '#';
            uploadedImage.classList.add('hidden');
            noImageMessage.classList.remove('hidden');
            detectButton.disabled = true;
            clearCanvas();
            objectList.innerHTML = '<li>No objects detected yet.</li>';
        }
    });

    // When image is loaded, adjust canvas and enable button
    uploadedImage.onload = () => {
        currentImage = uploadedImage;
        uploadedImage.classList.remove('hidden');
        noImageMessage.classList.add('hidden');

        // Set canvas dimensions to match the image's *rendered* dimensions.
        // This ensures the canvas drawing surface is exactly the size of the displayed image.
        detectionCanvas.width = uploadedImage.clientWidth; 
        detectionCanvas.height = uploadedImage.clientHeight;

        detectButton.disabled = false;
        clearCanvas(); // Clear any previous drawings
    };

    // Handle detection button click
    detectButton.addEventListener('click', async () => {
        if (!currentImage || currentImage.src === '#') {
            alert('Please upload an image first.');
            return;
        }

        detectButton.disabled = true;
        loadingIndicator.classList.remove('hidden');
        objectList.innerHTML = '<li>Detecting objects...</li>';
        clearCanvas(); // Clear previous boxes before new detection

        try {
            const detections = await simulateAIDetection(currentImage);
            displayDetections(detections);
            displayObjectList(detections);
        } catch (error) {
            console.error('Detection failed:', error);
            objectList.innerHTML = '<li style="color: red;">Error: Could not detect objects.</li>';
            alert('Failed to detect objects. Please try again.');
        } finally {
            loadingIndicator.classList.add('hidden');
            detectButton.disabled = false;
        }
    });

    // --- AI Detection Simulation (MOCK API) ---
    async function simulateAIDetection(imageElement) {
        // In a real application, you would send imageElement.src (base64 or URL)
        // to a backend API or a client-side ML model (e.g., TensorFlow.js).
        // For this project, we simulate an API call with a delay and mock data.

        return new Promise(resolve => {
            setTimeout(() => {
                // Mock data: Bounding boxes are defined as percentages (0-1) of the image's natural dimensions.
                // We will scale these to the canvas's current rendered dimensions for drawing.
                const mockDetections = [
                    { label: 'Dog', score: 0.98, box: { x: 0.15, y: 0.2, width: 0.3, height: 0.5 } },
                    { label: 'Ball', score: 0.92, box: { x: 0.6, y: 0.7, width: 0.1, height: 0.1 } },
                    { label: 'Tree', score: 0.85, box: { x: 0.7, y: 0.1, width: 0.25, height: 0.8 } },
                    { label: 'Sky', score: 0.75, box: { x: 0.0, y: 0.0, width: 1.0, height: 0.3 } }
                ];

                // Randomly remove some detections for variety in demo
                const filteredDetections = mockDetections.filter(() => Math.random() > 0.3);

                resolve(filteredDetections);
            }, 1500); // Simulate network latency
        });
    }

    // --- Drawing Functions ---
    function displayDetections(detections) {
        clearCanvas(); // Clear previous drawings

        if (!currentImage) return;

        // Get the natural dimensions of the image (original file size)
        const naturalWidth = currentImage.naturalWidth;
        const naturalHeight = currentImage.naturalHeight;
        
        // Get the rendered dimensions of the canvas (which matches the displayed image)
        const renderedWidth = detectionCanvas.width;
        const renderedHeight = detectionCanvas.height;

        detections.forEach(detection => {
            const { label, score, box } = detection;

            // Scale bounding box coordinates from percentages of natural image size
            // to the canvas's current rendered dimensions.
            const x = box.x * naturalWidth * (renderedWidth / naturalWidth); 
            const y = box.y * naturalHeight * (renderedHeight / naturalHeight); 
            const width = box.width * naturalWidth * (renderedWidth / naturalWidth); 
            const height = box.height * naturalHeight * (renderedHeight / naturalHeight); 

            // Draw bounding box
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#00FF00'; // Green color
            ctx.stroke();

            // Draw label background and text
            const fontSize = Math.max(12, Math.min(20, width / 5, height / 5)); // Dynamic font size based on box
            ctx.font = `bold ${fontSize}px Arial`;
            const text = `${label} (${(score * 100).toFixed(0)}%)`;
            const textWidth = ctx.measureText(text).width;

            // Ensure label doesn't go off-canvas to the left or top
            const labelX = Math.max(0, x);
            const labelYOffset = fontSize + 8; // Height of the label background
            const labelY = Math.max(0, y - labelYOffset); // Position label above the box, or at top if box is too high

            // Adjust text drawing position if label background was pushed down
            const textDrawY = labelY === 0 ? fontSize + 2 : y - 5; 
            const bgDrawY = labelY === 0 ? 0 : y - labelYOffset; 

            ctx.fillStyle = '#00FF00';
            ctx.fillRect(labelX, bgDrawY, textWidth + 10, labelYOffset); // Background rectangle

            ctx.fillStyle = 'black';
            ctx.fillText(text, labelX + 5, textDrawY);
        });
    }

    // --- Display Object List ---
    function displayObjectList(detections) {
        objectList.innerHTML = ''; // Clear previous list

        if (detections.length === 0) {
            objectList.innerHTML = '<li>No objects detected.</li>';
            return;
        }

        detections.sort((a, b) => b.score - a.score); // Sort by score descending

        detections.forEach(detection => {
            const li = document.createElement('li');
            li.textContent = `${detection.label} (Score: ${(detection.score * 100).toFixed(1)}%)`;
            objectList.appendChild(li);
        });
    }

    // Initial state setup
    uploadedImage.classList.add('hidden');
    noImageMessage.classList.remove('hidden');
    detectButton.disabled = true;
    loadingIndicator.classList.add('hidden');
});
