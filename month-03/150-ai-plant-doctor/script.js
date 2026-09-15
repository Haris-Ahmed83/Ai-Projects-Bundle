document.addEventListener('DOMContentLoaded', () => {
    const plantImageInput = document.getElementById('plantImage');
    const imagePreviewDiv = document.getElementById('imagePreview');
    const analyzeButton = document.getElementById('analyzeButton');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const diagnosisResultDiv = document.getElementById('diagnosisResult');
    const diagnosisText = document.getElementById('diagnosisText');
    const treatmentText = document.getElementById('treatmentText');

    let uploadedImage = null; // Store the image data URL

    // --- Helper Functions to show/hide elements ---
    function showElement(element) {
        element.classList.remove('hidden');
    }

    function hideElement(element) {
        element.classList.add('hidden');
    }

    // --- Event Listener for Image Upload ---
    plantImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImage = e.target.result; // Store the image data
                imagePreviewDiv.innerHTML = `<img src="${uploadedImage}" alt="Plant Image Preview">`;
                analyzeButton.disabled = false; // Enable analyze button
                hideElement(diagnosisResultDiv); // Hide previous diagnosis
            };
            reader.readAsDataURL(file);
        } else {
            uploadedImage = null;
            imagePreviewDiv.innerHTML = '<p>No image selected</p>';
            analyzeButton.disabled = true;
            hideElement(diagnosisResultDiv);
        }
    });

    // --- Event Listener for Analyze Button ---
    analyzeButton.addEventListener('click', () => {
        if (uploadedImage) {
            hideElement(diagnosisResultDiv);
            showElement(loadingIndicator);
            analyzeButton.disabled = true; // Disable button during analysis
            plantImageInput.disabled = true; // Disable input during analysis

            // Simulate AI analysis with a delay
            setTimeout(() => {
                hideElement(loadingIndicator);
                showElement(diagnosisResultDiv);
                analyzeButton.disabled = false; // Re-enable button
                plantImageInput.disabled = false; // Re-enable input

                // Randomly generate a diagnosis for demonstration purposes
                const diagnoses = [
                    {
                        condition: "Early Stage Fungal Infection (Powdery Mildew)",
                        treatment: "Isolate the plant, remove affected leaves, and treat with a neem oil solution every 3-5 days. Ensure good air circulation."
                    },
                    {
                        condition: "Nutrient Deficiency (Nitrogen)",
                        treatment: "Apply a balanced, slow-release fertilizer rich in nitrogen. Consider a liquid feed for faster absorption. Check soil pH."
                    },
                    {
                        condition: "Pest Infestation (Aphids)",
                        treatment: "Spray affected areas with insecticidal soap or a strong stream of water. Introduce beneficial insects if possible. Repeat treatment weekly."
                    },
                    {
                        condition: "Overwatering/Root Rot",
                        treatment: "Allow soil to dry out completely between waterings. Ensure proper drainage. Repot if root rot is severe, trimming affected roots. Reduce watering frequency."
                    },
                    {
                        condition: "Underwatering/Dehydration",
                        treatment: "Water thoroughly until water drains from the bottom. Increase watering frequency but avoid waterlogging. Consider a self-watering pot."
                    },
                    {
                        condition: "Sunburn/Light Stress",
                        treatment: "Move the plant to a location with indirect or filtered light. Gradually acclimate it to brighter conditions if desired over several days."
                    },
                    {
                        condition: "Healthy Plant!",
                        treatment: "Your plant appears to be healthy! Keep up the good work with regular watering, appropriate light, and occasional fertilization. Continue monitoring for any changes."
                    },
                    {
                        condition: "Possible Viral Infection",
                        treatment: "Viral infections are difficult to treat. Isolate the plant immediately to prevent spread. Remove severely infected parts. Consult a local plant expert."
                    }
                ];

                const randomDiagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];

                diagnosisText.textContent = randomDiagnosis.condition;
                treatmentText.textContent = randomDiagnosis.treatment;

            }, 3000); // Simulate 3 seconds of AI processing delay
        }
    });
});
