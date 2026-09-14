document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const uploadedImage = document.getElementById('uploadedImage');
    const previewPlaceholder = document.getElementById('previewPlaceholder');
    const analysisResults = document.getElementById('analysisResults');
    const recommendationResults = document.getElementById('recommendationResults');

    // Simulated AI data (can be expanded)
    const clothingItems = [
        { name: "Blue Denim Jacket", colors: ["blue", "denim"], styles: ["casual", "streetwear"], season: "fall, spring", pairWith: ["black jeans, white t-shirt, sneakers", "floral dress, boots"] },
        { name: "White T-Shirt", colors: ["white"], styles: ["basic", "minimalist", "casual"], season: "all", pairWith: ["any jeans, blazer", "shorts, sandals", "under overalls"] },
        { name: "Black Skinny Jeans", colors: ["black"], styles: ["versatile", "edgy", "casual"], season: "all", pairWith: ["graphic tee, leather jacket", "sweater, ankle boots", "blouse, heels"] },
        { name: "Floral Summer Dress", colors: ["multicolor", "pastel"], styles: ["boho", "feminine", "summer"], season: "summer", pairWith: ["sandals, straw hat", "denim jacket, white sneakers"] },
        { name: "Grey Hoodie", colors: ["grey"], styles: ["athleisure", "casual", "cozy"], season: "fall, winter, spring", pairWith: ["joggers, sneakers", "jeans, baseball cap"] },
        { name: "Navy Blazer", colors: ["navy"], styles: ["business casual", "smart casual", "classic"], season: "all", pairWith: ["chinos, button-down shirt", "t-shirt, dark wash jeans", "dress pants"] },
        { name: "Striped Jumper", colors: ["navy", "white", "red"], styles: ["classic", "preppy", "casual"], season: "fall, winter", pairWith: ["dark wash jeans, loafers", "skirt, tights, boots"] },
        { name: "Leather Moto Jacket", colors: ["black", "brown"], styles: ["edgy", "rocker", "classic"], season: "fall, spring", pairWith: ["band tee, ripped jeans, boots", "simple dress, combat boots"] },
        { name: "Chinos", colors: ["beige", "khaki", "navy"], styles: ["smart casual", "everyday"], season: "all", pairWith: ["polo shirt, boat shoes", "oxford shirt, sneakers"] }
    ];

    imageUpload.addEventListener('change', function(event) {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function(e) {
                uploadedImage.src = e.target.result;
                uploadedImage.classList.remove('hidden');
                previewPlaceholder.classList.add('hidden');
                simulateAIAnalysis();
            };

            reader.readAsDataURL(file);
        } else {
            uploadedImage.src = "";
            uploadedImage.classList.add('hidden');
            previewPlaceholder.classList.remove('hidden');
            analysisResults.innerHTML = '<p>Upload an image to see analysis.</p>';
            recommendationResults.innerHTML = '<p>Recommendations will appear here.</p>';
        }
    });

    function simulateAIAnalysis() {
        // Clear previous results
        analysisResults.innerHTML = '';
        recommendationResults.innerHTML = '';

        // Simulate a delay for "AI processing"
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * clothingItems.length);
            const item = clothingItems[randomIndex];

            // Display analysis
            analysisResults.innerHTML = `
                <ul>
                    <li><strong>Detected Item:</strong> ${item.name}</li>
                    <li><strong>Colors:</strong> ${item.colors.join(', ')}</li>
                    <li><strong>Style Keywords:</strong> ${item.styles.join(', ')}</li>
                    <li><strong>Suggested Season:</strong> ${item.season}</li>
                </ul>
            `;

            // Display recommendations
            recommendationResults.innerHTML = `
                <p><strong>Pair with:</strong> ${item.pairWith[0]}</p>
                <p><strong>Further styling ideas:</strong> ${item.pairWith[1] || 'Experiment with different textures and layers!'}</p>
            `;
        }, 1000); // 1 second delay
    }
});
