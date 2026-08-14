document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---s
    const addDataXInput = document.getElementById('addDataX');
    const addDataYInput = document.getElementById('addDataY');
    const addDataClassSelect = document.getElementById('addDataClass');
    const addPointBtn = document.getElementById('addPointBtn');
    const resetDataBtn = document.getElementById('resetDataBtn');

    const classifyXInput = document.getElementById('classifyX');
    const classifyYInput = document.getElementById('classifyY');
    const classifyPointBtn = document.getElementById('classifyPointBtn');

    const predictedClassSpan = document.getElementById('predictedClass');
    const probASpan = document.getElementById('probA');
    const probBSpan = document.getElementById('probB');

    const canvas = document.getElementById('bayesCanvas');
    const ctx = canvas.getContext('2d');

    // --- Configuration ---s
    let dataPoints = []; // Stores { x, y, class }
    let newPointToClassify = null; // Stores { x, y, predictedClass }

    const CANVAS_WIDTH = canvas.width;
    const CANVAS_HEIGHT = canvas.height;
    const DATA_MAX_X = 100; // Max value for X in data coordinates
    const DATA_MAX_Y = 100; // Max value for Y in data coordinates
    const POINT_RADIUS = 5;
    const EPSILON = 1e-6; // Small value to prevent division by zero for stdDev

    // --- Helper Functions ---s

    // Gaussian Probability Density Function (PDF)
    function gaussianPDF(x, mean, stdDev) {
        if (stdDev < EPSILON) { // Handle stdDev = 0 or very small
            // If stdDev is effectively zero, the probability is 1 if x is exactly the mean, else 0.
            // We allow a small tolerance for floating point comparisons.
            return Math.abs(x - mean) < EPSILON ? 1.0 : 0.0;
        }
        const exponent = -((x - mean) ** 2) / (2 * (stdDev ** 2));
        return (1 / (Math.sqrt(2 * Math.PI) * stdDev)) * Math.exp(exponent);
    }

    // Calculate mean and standard deviation for an array of numbers
    function calculateMeanAndStdDev(arr) {
        if (arr.length === 0) {
            return { mean: 0, stdDev: EPSILON }; // Return epsilon for stdDev if no data
        }
        const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length;
        // Bessel's correction for sample standard deviation (n-1), though for population (n) is fine for explainer
        const variance = arr.reduce((sum, val) => sum + (val - mean) ** 2, 0) / arr.length;
        const stdDev = Math.sqrt(variance);
        return { mean, stdDev: Math.max(stdDev, EPSILON) }; // Ensure stdDev is never too small
    }

    // Calculate statistics for each class (mean, stdDev for X and Y)
    function calculateClassStatistics(points) {
        const classA_X = points.filter(p => p.class === 'A').map(p => p.x);
        const classA_Y = points.filter(p => p.class === 'A').map(p => p.y);
        const classB_X = points.filter(p => p.class === 'B').map(p => p.x);
        const classB_Y = points.filter(p => p.class === 'B').map(p => p.y);

        const stats = {};
        const totalPoints = points.length;

        // Class A stats
        stats['A'] = {
            x: calculateMeanAndStdDev(classA_X),
            y: calculateMeanAndStdDev(classA_Y),
            count: classA_X.length,
            prior: classA_X.length / totalPoints || EPSILON // Avoid division by zero if no points in class
        };

        // Class B stats
        stats['B'] = {
            x: calculateMeanAndStdDev(classB_X),
            y: calculateMeanAndStdDev(classB_Y),
            count: classB_X.length,
            prior: classB_X.length / totalPoints || EPSILON
        };

        return stats;
    }

    // --- Naive Bayes Classifier Logic ---s
    function classify(point, trainingData) {
        if (trainingData.length === 0) {
            return { predictedClass: 'N/A', probabilities: { A: 'N/A', B: 'N/A' } };
        }

        const stats = calculateClassStatistics(trainingData);

        let likelihoodA = 1;
        let likelihoodB = 1;

        // Calculate P(X | Class) * P(Y | Class) for Class A
        if (stats.A.count > 0) {
            likelihoodA *= gaussianPDF(point.x, stats.A.x.mean, stats.A.x.stdDev);
            likelihoodA *= gaussianPDF(point.y, stats.A.y.mean, stats.A.y.stdDev);
        } else {
            likelihoodA = 0; // If no training data for class A, likelihood is 0
        }

        // Calculate P(X | Class) * P(Y | Class) for Class B
        if (stats.B.count > 0) {
            likelihoodB *= gaussianPDF(point.x, stats.B.x.mean, stats.B.x.stdDev);
            likelihoodB *= gaussianPDF(point.y, stats.B.y.mean, stats.B.y.stdDev);
        } else {
            likelihoodB = 0; // If no training data for class B, likelihood is 0
        }

        // Calculate unnormalized posterior probabilities: P(Class | X, Y) ~ P(X, Y | Class) * P(Class)
        const posteriorA_unnormalized = likelihoodA * stats.A.prior;
        const posteriorB_unnormalized = likelihoodB * stats.B.prior;

        const totalPosterior = posteriorA_unnormalized + posteriorB_unnormalized;

        let probA, probB;
        if (totalPosterior === 0) {
            // If both posteriors are 0, we can't determine, so assign equal probabilities or 'N/A'
            // For this explainer, we'll assign equal probabilities, or N/A if no data points at all
            probA = 0.5;
            probB = 0.5;
        } else {
            probA = posteriorA_unnormalized / totalPosterior;
            probB = posteriorB_unnormalized / totalPosterior;
        }

        const predictedClass = probA > probB ? 'A' : (probB > probA ? 'B' : 'Undetermined');

        return { predictedClass, probabilities: { A: probA, B: probB } };
    }

    // --- Canvas Drawing Functions ---s

    // Map data coordinates (0-100) to canvas pixels
    function dataToCanvas(x, y) {
        const canvasX = (x / DATA_MAX_X) * CANVAS_WIDTH;
        const canvasY = CANVAS_HEIGHT - (y / DATA_MAX_Y) * CANVAS_HEIGHT; // Invert Y for canvas, as canvas Y=0 is top
        return { x: canvasX, y: canvasY };
    }

    function drawPoint(point, color, radius) {
        const { x, y } = dataToCanvas(point.x, point.y);
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    function draw() {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // Clear canvas

        // Draw axes
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        // X-axis
        ctx.beginPath();
        ctx.moveTo(0, CANVAS_HEIGHT);
        ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.stroke();
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, CANVAS_HEIGHT);
        ctx.stroke();

        // Draw data points
        dataPoints.forEach(p => {
            const color = p.class === 'A' ? 'rgba(255, 99, 132, 0.7)' : 'rgba(54, 162, 235, 0.7)';
            drawPoint(p, color, POINT_RADIUS);
        });

        // Draw the point to classify
        if (newPointToClassify) {
            const color = newPointToClassify.predictedClass === 'A' ? 'rgba(255, 0, 0, 1)' : // Red for Class A
                          newPointToClassify.predictedClass === 'B' ? 'rgba(0, 0, 255, 1)' : // Blue for Class B
                          'rgba(128, 128, 128, 1)'; // Gray for undetermined
            drawPoint(newPointToClassify, color, POINT_RADIUS + 2); // Slightly larger for emphasis
            // Add a crosshair for the classified point
            const { x, y } = dataToCanvas(newPointToClassify.x, newPointToClassify.y);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x - (POINT_RADIUS + 5), y);
            ctx.lineTo(x + (POINT_RADIUS + 5), y);
            ctx.moveTo(x, y - (POINT_RADIUS + 5));
            ctx.lineTo(x, y + (POINT_RADIUS + 5));
            ctx.stroke();
        }
    }

    // --- Event Listeners ---s
    addPointBtn.addEventListener('click', () => {
        const x = parseFloat(addDataXInput.value);
        const y = parseFloat(addDataYInput.value);
        const className = addDataClassSelect.value;

        if (!isNaN(x) && !isNaN(y)) {
            dataPoints.push({ x, y, class: className });
            draw();
            // Clear classification results when new data is added
            predictedClassSpan.textContent = 'N/A';
            probASpan.textContent = 'N/A';
            probBSpan.textContent = 'N/A';
            newPointToClassify = null; // Clear classified point from canvas
        } else {
            alert('Please enter valid numbers for X and Y.');
        }
    });

    resetDataBtn.addEventListener('click', () => {
        dataPoints = [];
        newPointToClassify = null;
        draw();
        predictedClassSpan.textContent = 'N/A';
        probASpan.textContent = 'N/A';
        probBSpan.textContent = 'N/A';
    });

    classifyPointBtn.addEventListener('click', () => {
        const x = parseFloat(classifyXInput.value);
        const y = parseFloat(classifyYInput.value);

        if (!isNaN(x) && !isNaN(y)) {
            const result = classify({ x, y }, dataPoints);
            predictedClassSpan.textContent = result.predictedClass;
            probASpan.textContent = result.probabilities.A !== 'N/A' ? result.probabilities.A.toFixed(4) : 'N/A';
            probBSpan.textContent = result.probabilities.B !== 'N/A' ? result.probabilities.B.toFixed(4) : 'N/A';

            newPointToClassify = { x, y, predictedClass: result.predictedClass };
            draw();
        } else {
            alert('Please enter valid numbers for X and Y for classification.');
        }
    });

    // --- Initial Draw ---s
    draw();
});
