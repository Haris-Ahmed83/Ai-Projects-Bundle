document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('classifierCanvas');
    const ctx = canvas.getContext('2d');
    const CANVAS_WIDTH = canvas.width;
    const CANVAS_HEIGHT = canvas.height;
    const POINT_RADIUS = 5;

    const trainXInput = document.getElementById('trainX');
    const trainYInput = document.getElementById('trainY');
    const trainClassSelect = document.getElementById('trainClass');
    const addPointBtn = document.getElementById('addPointBtn');

    const classifyXInput = document.getElementById('classifyX');
    const classifyYInput = document.getElementById('classifyY');
    const classifyBtn = document.getElementById('classifyBtn');
    const classificationResultDiv = document.getElementById('classificationResult');
    const resetBtn = document.getElementById('resetBtn');

    let trainingData = []; // Stores [{x, y, class}]
    let model = {}; // Stores {class: {prior, meanX, stdX, meanY, stdY}}

    const classColors = {
        'A': '#007bff', // Blue
        'B': '#dc3545'  // Red
    };

    // Helper function for Gaussian Probability Density Function (PDF)
    function gaussianPDF(x, mean, stdDev) {
        // Handle cases with zero or very small standard deviation
        if (stdDev < 1e-6) {
            return (Math.abs(x - mean) < 1e-6) ? 1.0 : 0.0; // Point must be exactly at the mean
        }
        const exponent = -((x - mean) ** 2) / (2 * (stdDev ** 2));
        return (1 / (Math.sqrt(2 * Math.PI) * stdDev)) * Math.exp(exponent);
    }

    // Helper function to calculate mean of an array of numbers
    function calculateMean(arr) {
        if (arr.length === 0) return 0;
        return arr.reduce((sum, val) => sum + val, 0) / arr.length;
    }

    // Helper function to calculate standard deviation of an array of numbers
    function calculateStdDev(arr, mean) {
        if (arr.length < 2) return 0; // Need at least 2 points for meaningful std dev (sample std dev)
        const variance = arr.reduce((sum, val) => sum + (val - mean) ** 2, 0) / (arr.length - 1);
        return Math.sqrt(variance);
    }

    // Train the Naive Bayes model based on the current trainingData
    function trainModel() {
        model = {};
        const classes = [...new Set(trainingData.map(d => d.class))]; // Get unique classes
        const totalPoints = trainingData.length;

        if (totalPoints === 0) {
            // No training data, model is empty
            classificationResultDiv.textContent = 'Add some training data first!';
            return;
        }

        classes.forEach(cls => {
            const classPoints = trainingData.filter(d => d.class === cls);
            const classCount = classPoints.length;

            if (classCount === 0) return; // Should not happen if classes are from trainingData

            const xValues = classPoints.map(d => d.x);
            const yValues = classPoints.map(d => d.y);

            const meanX = calculateMean(xValues);
            const stdX = calculateStdDev(xValues, meanX);
            const meanY = calculateMean(yValues);
            const stdY = calculateStdDev(yValues, meanY);

            model[cls] = {
                prior: classCount / totalPoints,
                meanX: meanX,
                stdX: stdX,
                meanY: meanY,
                stdY: stdY
            };
        });
        // console.log('Model trained:', model);
    }

    // Classify a new point using the trained Naive Bayes model
    function classifyPoint(point) {
        let bestClass = null;
        let maxPosterior = -1;
        let probabilities = {};

        if (Object.keys(model).length === 0) {
            return { predictedClass: 'N/A', probabilities: {} }; // Model not trained
        }

        for (const cls in model) {
            const classModel = model[cls];
            if (!classModel) continue;

            // Calculate likelihoods for each feature (X and Y) given the class
            const likelihoodX = gaussianPDF(point.x, classModel.meanX, classModel.stdX);
            const likelihoodY = gaussianPDF(point.y, classModel.meanY, classModel.stdY);

            // Naive Bayes assumption: P(features|class) = P(x|class) * P(y|class)
            // Posterior = P(x|class) * P(y|class) * P(class)
            const posterior = likelihoodX * likelihoodY * classModel.prior;
            probabilities[cls] = posterior;

            if (posterior > maxPosterior) {
                maxPosterior = posterior;
                bestClass = cls;
            }
        }

        // Normalize probabilities for display (optional, as relative values are enough for classification)
        const sumProbabilities = Object.values(probabilities).reduce((sum, val) => sum + val, 0);
        for (const cls in probabilities) {
            probabilities[cls] = sumProbabilities > 0 ? probabilities[cls] / sumProbabilities : 0;
        }

        return { predictedClass: bestClass, probabilities: probabilities };
    }

    // Main drawing function for the canvas
    function draw() {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // Clear canvas

        // Draw training points
        trainingData.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, POINT_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = classColors[point.class] || '#999'; // Fallback color
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    }

    // Event Handler for adding a training point
    addPointBtn.addEventListener('click', () => {
        const x = parseFloat(trainXInput.value);
        const y = parseFloat(trainYInput.value);
        const cls = trainClassSelect.value;

        if (isNaN(x) || isNaN(y) || x < 0 || y < 0 || x > CANVAS_WIDTH || y > CANVAS_HEIGHT) {
            alert('Please enter valid X and Y coordinates within canvas bounds (0-' + CANVAS_WIDTH + ').');
            return;
        }

        trainingData.push({ x, y, class: cls });
        trainModel(); // Retrain model with new data
        draw(); // Redraw canvas
        classificationResultDiv.textContent = 'Model re-trained with new data.';

        // Optionally clear classification inputs or reset to center for next classification
        // classifyXInput.value = '';
        // classifyYInput.value = '';
    });

    // Event Handler for classifying a new point
    classifyBtn.addEventListener('click', () => {
        const x = parseFloat(classifyXInput.value);
        const y = parseFloat(classifyYInput.value);

        if (isNaN(x) || isNaN(y) || x < 0 || y < 0 || x > CANVAS_WIDTH || y > CANVAS_HEIGHT) {
            alert('Please enter valid X and Y coordinates for classification within canvas bounds (0-' + CANVAS_WIDTH + ').');
            return;
        }

        if (trainingData.length === 0) {
            classificationResultDiv.textContent = 'Please add training data points first!';
            return;
        }

        const newPoint = { x, y };
        const { predictedClass, probabilities } = classifyPoint(newPoint);

        draw(); // Redraw existing points to clear previous classification highlight

        // Draw the new classified point with a distinct style
        ctx.beginPath();
        ctx.arc(newPoint.x, newPoint.y, POINT_RADIUS + 3, 0, Math.PI * 2); // Slightly larger for emphasis
        ctx.fillStyle = classColors[predictedClass] || '#ffc107'; // Use predicted class color, default yellow
        ctx.fill();
        ctx.strokeStyle = '#000'; // Black border
        ctx.lineWidth = 2;
        ctx.stroke();

        // Display classification result
        let resultText = `Predicted Class: <span style="color: ${classColors[predictedClass] || '#ffc107'}; font-weight: bold;">${predictedClass || 'N/A'}</span><br>`;
        resultText += 'Probabilities: '; 
        for (const cls in probabilities) {
            resultText += `<span style="color: ${classColors[cls] || '#999'};">${cls}: ${probabilities[cls].toFixed(4)}</span> `; 
        }
        classificationResultDiv.innerHTML = resultText;
    });

    // Event Handler for resetting everything
    resetBtn.addEventListener('click', () => {
        trainingData = [];
        model = {};
        draw(); // Clear canvas
        classificationResultDiv.textContent = 'All data and model reset.';
        // Reset input values to defaults
        trainXInput.value = '100';
        trainYInput.value = '100';
        classifyXInput.value = '250';
        classifyYInput.value = '250';
    });

    // Initial setup
    draw(); // Draw empty canvas initially
    classificationResultDiv.textContent = 'Ready to add training data.';
});
