document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('webcam-feed');
    const canvas = document.getElementById('filtered-feed');
    const ctx = canvas.getContext('2d', { willReadFrequently: true }); // Performance hint for frequent imageData access
    const filterSelect = document.getElementById('filter-select');

    let currentFilter = 'none'; // Stores the name of the current filter

    // Request access to the webcam
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.play();
                // Set canvas dimensions to match video
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                // Start drawing frames
                requestAnimationFrame(drawFrame);
            };
        })
        .catch(err => {
            console.error("Error accessing webcam: ", err);
            alert("Could not access your webcam. Please ensure it's connected and you've granted permission.");
        });

    // Main drawing loop
    function drawFrame() {
        if (video.paused || video.ended) {
            return;
        }

        // Draw the current video frame onto the canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Apply filter if selected
        if (currentFilter !== 'none') {
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let data = imageData.data; // Pixel data array [R, G, B, A, R, G, B, A, ...]

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                switch (currentFilter) {
                    case 'grayscale':
                        applyGrayscale(data, i, r, g, b);
                        break;
                    case 'sepia':
                        applySepia(data, i, r, g, b);
                        break;
                    case 'invert':
                        applyInvert(data, i, r, g, b);
                        break;
                    case 'threshold':
                        applyThreshold(data, i, r, g, b);
                        break;
                }
            }
            ctx.putImageData(imageData, 0, 0);
        }

        // Request the next frame
        requestAnimationFrame(drawFrame);
    }

    // Filter functions
    function applyGrayscale(data, i, r, g, b) {
        const avg = (r + g + b) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
    }

    function applySepia(data, i, r, g, b) {
        const tr = (r * 0.393) + (g * 0.769) + (b * 0.189);
        const tg = (r * 0.349) + (g * 0.686) + (b * 0.168);
        const tb = (r * 0.272) + (g * 0.534) + (b * 0.131);
        data[i] = Math.min(tr, 255);
        data[i + 1] = Math.min(tg, 255);
        data[i + 2] = Math.min(tb, 255);
    }

    function applyInvert(data, i, r, g, b) {
        data[i] = 255 - r;
        data[i + 1] = 255 - g;
        data[i + 2] = 255 - b;
    }

    function applyThreshold(data, i, r, g, b) {
        const threshold = 128; // Mid-point threshold
        const avg = (r + g + b) / 3;
        const color = avg > threshold ? 255 : 0;
        data[i] = color;
        data[i + 1] = color;
        data[i + 2] = color;
    }

    // Event listener for filter selection
    filterSelect.addEventListener('change', (event) => {
        currentFilter = event.target.value;
    });
});
