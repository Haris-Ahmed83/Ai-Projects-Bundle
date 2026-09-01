// Global variables
let model; // Stores the loaded BodyPix model
let originalCanvas, resultCanvas; // Canvas elements
let originalCtx, resultCtx; // 2D rendering contexts for canvases
let fileInput, downloadBtn, loadingIndicator; // UI elements
let imageToProcess; // Stores the loaded HTMLImageElement for processing

document.addEventListener('DOMContentLoaded', init);

/**
 * Initializes the application: gets DOM elements, sets up event listeners,
 * and loads the client-side AI (BodyPix) model.
 */
async function init() {
    // Get DOM elements
    fileInput = document.getElementById('imageUpload');
    downloadBtn = document.getElementById('downloadBtn');
    loadingIndicator = document.getElementById('loadingIndicator');
    originalCanvas = document.getElementById('originalCanvas');
    resultCanvas = document.getElementById('resultCanvas');
    originalCtx = originalCanvas.getContext('2d');
    resultCtx = resultCanvas.getContext('2d');

    // Set up event listeners
    fileInput.addEventListener('change', handleImageUpload);
    downloadBtn.addEventListener('click', downloadResult);

    // Load BodyPix model
    // This can take a moment, so display a loading indicator.
    loadingIndicator.style.display = 'block';
    try {
        // Load the BodyPix model with specific architecture options for performance.
        model = await bodyPix.load({
            architecture: 'MobileNetV1',
            outputStride: 16,
            multiplier: 0.75,
            quantBytes: 2
        });
        console.log('BodyPix model loaded successfully.');
    } catch (error) {
        console.error('Failed to load BodyPix model:', error);
        alert('Failed to load AI model. Please check your internet connection and try again.');
        return; // Stop initialization if model fails to load
    } finally {
        loadingIndicator.style.display = 'none'; // Hide loading indicator regardless of success/failure
    }
}

/**
 * Handles the event when a user selects an image file.
 * Reads the image, displays it on the original canvas, and then triggers processing.
 * @param {Event} event - The change event from the file input.
 */
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    // Reset UI state for a new upload
    originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
    resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
    downloadBtn.style.display = 'none';
    resultCanvas.width = 0; // Clear result canvas dimensions
    resultCanvas.height = 0;
    originalCanvas.width = 0; // Clear original canvas dimensions
    originalCanvas.height = 0;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const img = new Image();
        img.onload = () => {
            imageToProcess = img; // Store the image element for AI processing

            // Set canvas dimensions to match the image
            originalCanvas.width = img.width;
            originalCanvas.height = img.height;
            
            // Draw the original image onto its canvas
            originalCtx.drawImage(img, 0, 0);

            // Trigger the AI processing
            processImage();
        };
        img.src = e.target.result; // Set image source from the file reader result
    };
    reader.readAsDataURL(file); // Read the file as a Data URL
}

/**
 * Processes the loaded image using the BodyPix model to remove its background.
 * Displays the result on the result canvas.
 */
async function processImage() {
    if (!model || !imageToProcess) {
        console.error('AI model not loaded or image not available for processing.');
        alert('AI model not ready or no image to process. Please try uploading again.');
        return;
    }

    loadingIndicator.style.display = 'block'; // Show loading indicator during AI processing
    downloadBtn.style.display = 'none'; // Hide download button until processing is complete

    try {
        // Perform person segmentation using BodyPix model.
        // Options can be tuned for performance vs. accuracy.
        const segmentation = await model.segmentPerson(imageToProcess, {
            flipHorizontal: false, // Image is not flipped horizontally
            internalResolution: 'medium', // 'low', 'medium', 'high', 'full' - affects quality and speed
            segmentationThreshold: 0.7, // Confidence threshold for a pixel to be part of a person
            maxDetections: 1 // Optimize for a single person in the image
        });

        // Use bodyPix.toImage to directly create an ImageData object
        // where the segmented person is visible and the background is transparent.
        const transparentBackgroundPerson = bodyPix.toImage(segmentation);

        // Set the result canvas dimensions and draw the processed image data.
        resultCanvas.width = imageToProcess.width;
        resultCanvas.height = imageToProcess.height;
        resultCtx.putImageData(transparentBackgroundPerson, 0, 0);

        downloadBtn.style.display = 'inline-block'; // Show download button after successful processing

    } catch (error) {
        console.error('Error during image segmentation:', error);
        alert('An error occurred during background removal. Please ensure the image contains a clear subject (preferably a person) and try again.');
    } finally {
        loadingIndicator.style.display = 'none'; // Hide loading indicator
    }
}

/**
 * Handles the download button click event.
 * Converts the result canvas content to a PNG image and triggers a download.
 */
function downloadResult() {
    if (resultCanvas.width === 0 || resultCanvas.height === 0) {
        alert('No image to download. Please upload and process an image first.');
        return;
    }

    // Get the image data from the result canvas as a PNG Data URL
    const image = resultCanvas.toDataURL('image/png');
    const link = document.createElement('a'); // Create a temporary anchor element
    link.href = image; // Set its href to the image data
    link.download = 'background-removed-image.png'; // Set the download filename
    document.body.appendChild(link); // Append to body (required for Firefox)
    link.click(); // Programmatically click the link to trigger download
    document.body.removeChild(link); // Clean up the temporary link
}
