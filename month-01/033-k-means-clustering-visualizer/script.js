document.addEventListener('DOMContentLoaded', init);

// --- Configuration --- //
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const POINT_RADIUS = 3;
const CENTROID_RADIUS = 8;
const KMEANS_ITERATION_DELAY = 200; // ms between each step visualization
const CONVERGENCE_THRESHOLD = 0.5; // Minimum distance centroids must move to not be converged
const MAX_ITERATIONS = 100;

// Predefined distinct colors for clusters
const CLUSTER_COLORS = [
    '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
    '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe'
];

// --- Global State --- //
let canvas, ctx;
let numPointsInput, numClustersInput;
let generateBtn, runBtn, resetBtn;
let statusDiv;

let dataPoints = []; // Array of {x, y} objects
let assignments = []; // Array of cluster indices for each point
let centroids = [];   // Array of {x, y} objects for centroids
let kValue = 0;
let iterationCount = 0;
let animationTimeoutId = null;

// --- Initialization --- //
function init() {
    // Get DOM elements
    canvas = document.getElementById('kmeansCanvas');
    ctx = canvas.getContext('2d');
    numPointsInput = document.getElementById('numPoints');
    numClustersInput = document.getElementById('numClusters');
    generateBtn = document.getElementById('generateBtn');
    runBtn = document.getElementById('runBtn');
    resetBtn = document.getElementById('resetBtn');
    statusDiv = document.getElementById('status');

    // Set canvas dimensions explicitly (though also in HTML)
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Add event listeners
    generateBtn.addEventListener('click', generateNewData);
    runBtn.addEventListener('click', runKMeansAlgorithm);
    resetBtn.addEventListener('click', resetVisualization);

    // Initial state
    resetVisualization();
}

// --- K-Means Algorithm Core Functions --- //

/**
 * Calculates the Euclidean distance between two points.
 * @param {object} p1 - {x, y}
 * @param {object} p2 - {x, y}
 * @returns {number}
 */
function euclideanDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

/**
 * Generates random data points within the canvas boundaries.
 * @param {number} count - Number of points to generate.
 * @param {number} width - Max X coordinate.
 * @param {number} height - Max Y coordinate.
 * @returns {Array<object>} - Array of {x, y} points.
 */
function createRandomPoints(count, width, height) {
    const points = [];
    for (let i = 0; i < count; i++) {
        points.push({
            x: Math.random() * width,
            y: Math.random() * height
        });
    }
    return points;
}

/**
 * Randomly initializes K centroids by picking K unique points from the data.
 * @param {Array<object>} data - The dataset.
 * @param {number} k - Number of clusters.
 * @returns {Array<object>} - Array of {x, y} centroid points.
 */
function initializeCentroids(data, k) {
    const centroids = [];
    const dataCopy = [...data]; // Create a shallow copy to avoid modifying original data
    // Shuffle dataCopy to get random points without bias towards array start
    for (let i = dataCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dataCopy[i], dataCopy[j]] = [dataCopy[j], dataCopy[i]];
    }
    
    for (let i = 0; i < k; i++) {
        if (i < dataCopy.length) { // Ensure we don't pick more centroids than data points
            centroids.push(dataCopy[i]);
        } else {
            // Fallback for k > data.length (should be prevented by input limits)
            centroids.push({ x: Math.random() * CANVAS_WIDTH, y: Math.random() * CANVAS_HEIGHT });
        }
    }
    return centroids;
}

/**
 * Assigns each data point to the closest centroid.
 * @param {Array<object>} data - The dataset.
 * @param {Array<object>} centroids - Current centroids.
 * @returns {Array<number>} - Array of cluster indices for each point.
 */
function assignPointsToClusters(data, centroids) {
    const newAssignments = new Array(data.length);
    data.forEach((point, i) => {
        let minDist = Infinity;
        let closestCentroidIndex = -1;

        centroids.forEach((centroid, j) => {
            const dist = euclideanDistance(point, centroid);
            if (dist < minDist) {
                minDist = dist;
                closestCentroidIndex = j;
            }
        });
        newAssignments[i] = closestCentroidIndex;
    });
    return newAssignments;
}

/**
 * Updates the position of centroids based on the mean of their assigned points.
 * @param {Array<object>} data - The dataset.
 * @param {Array<number>} assignments - Cluster assignments for each point.
 * @param {number} k - Number of clusters.
 * @returns {Array<object>} - Array of new {x, y} centroid points.
 */
function updateCentroids(data, assignments, k) {
    const newCentroids = Array.from({ length: k }, () => ({ x: 0, y: 0, count: 0 }));

    data.forEach((point, i) => {
        const clusterIndex = assignments[i];
        if (clusterIndex !== -1 && clusterIndex < k) { // Ensure point is assigned and cluster index is valid
            newCentroids[clusterIndex].x += point.x;
            newCentroids[clusterIndex].y += point.y;
            newCentroids[clusterIndex].count++;
        }
    });

    return newCentroids.map((centroid, i) => {
        if (centroid.count > 0) {
            return { x: centroid.x / centroid.count, y: centroid.y / centroid.count };
        } else {
            // Handle empty clusters: re-initialize it to a random data point
            // This prevents a centroid from getting 'lost' if no points are assigned to it
            return data[Math.floor(Math.random() * data.length)];
        }
    });
}

/**
 * Checks if centroids have converged (moved less than a threshold).
 * @param {Array<object>} oldCentroids - Centroids from previous iteration.
 * @param {Array<object>} newCentroids - Centroids from current iteration.
 * @param {number} threshold - Minimum distance change to consider convergence.
 * @returns {boolean}
 */
function areCentroidsConverged(oldCentroids, newCentroids, threshold = CONVERGENCE_THRESHOLD) {
    if (oldCentroids.length !== newCentroids.length) return false; 
    for (let i = 0; i < oldCentroids.length; i++) {
        if (euclideanDistance(oldCentroids[i], newCentroids[i]) > threshold) {
            return false;
        }
    }
    return true;
}

// --- Visualization Functions --- //

/**
 * Clears the canvas.
 */
function clearCanvas() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

/**
 * Draws a single circle (point or centroid) on the canvas.
 * @param {object} point - {x, y}
 * @param {string} color - CSS color string.
 * @param {number} radius - Radius of the circle.
 * @param {boolean} isCentroid - True if drawing a centroid to apply specific styling.
 */
function drawCircle(point, color, radius, isCentroid = false) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = isCentroid ? '#000' : '#333';
    ctx.lineWidth = isCentroid ? 2 : 0.5;
    ctx.stroke();
}

/**
 * Draws all data points and centroids on the canvas.
 */
function drawVisualization() {
    clearCanvas();

    // Draw data points
    dataPoints.forEach((point, i) => {
        const clusterIndex = assignments[i];
        const color = clusterIndex !== -1 && clusterIndex < CLUSTER_COLORS.length
            ? CLUSTER_COLORS[clusterIndex]
            : '#aaaaaa'; // Default color for unassigned or out-of-bounds clusters
        drawCircle(point, color, POINT_RADIUS);
    });

    // Draw centroids
    centroids.forEach((centroid, i) => {
        const color = i < CLUSTER_COLORS.length ? CLUSTER_COLORS[i] : '#000000';
        drawCircle(centroid, color, CENTROID_RADIUS, true); // Pass true for isCentroid
    });
}

// --- UI Event Handlers --- //

/**
 * Generates new random data points and resets clustering state.
 */
function generateNewData() {
    if (animationTimeoutId) {
        clearTimeout(animationTimeoutId);
        animationTimeoutId = null;
    }
    dataPoints = createRandomPoints(parseInt(numPointsInput.value), CANVAS_WIDTH, CANVAS_HEIGHT);
    assignments = new Array(dataPoints.length).fill(-1); // -1 means unassigned
    centroids = []; // Centroids will be initialized when K-Means runs
    kValue = parseInt(numClustersInput.value);
    iterationCount = 0;

    drawVisualization(); // Draw just the points
    statusDiv.textContent = `Status: Generated ${dataPoints.length} data points. Ready to run K-Means for K=${kValue}.`;
    runBtn.disabled = false;
    generateBtn.disabled = false;
}

/**
 * Runs the K-Means algorithm step-by-step with visualization.
 */
function runKMeansAlgorithm() {
    if (dataPoints.length === 0) {
        generateNewData(); // Generate data if none exists
    }

    runBtn.disabled = true;
    generateBtn.disabled = true;

    kValue = parseInt(numClustersInput.value);
    if (kValue < 2) {
        statusDiv.textContent = "Error: K must be at least 2.";
        runBtn.disabled = false;
        generateBtn.disabled = false;
        return;
    }
    if (kValue > dataPoints.length) {
        statusDiv.textContent = "Error: K cannot be greater than the number of data points.";
        runBtn.disabled = false;
        generateBtn.disabled = false;
        return;
    }

    // Initialize centroids if not already done (e.g., after initial generateData without running)
    // Or if K has changed since last run
    if (centroids.length === 0 || centroids.length !== kValue) {
        centroids = initializeCentroids(dataPoints, kValue);
        assignments = new Array(dataPoints.length).fill(-1); // Reset assignments for new K
    } else {
        // If K hasn't changed and data hasn't been regenerated, start from current state
        // This allows re-running K-Means from its last converged state or mid-run.
    }

    iterationCount = 0;
    statusDiv.textContent = `Status: K-Means started for K=${kValue}.`;
    kmeansIteration();
}

/**
 * Performs one iteration of K-Means and schedules the next if not converged.
 */
function kmeansIteration() {
    if (iterationCount >= MAX_ITERATIONS) {
        statusDiv.textContent = `Status: K-Means stopped after ${iterationCount} iterations (max iterations reached).`;
        runBtn.disabled = false;
        generateBtn.disabled = false;
        drawVisualization();
        return;
    }

    const oldCentroids = JSON.parse(JSON.stringify(centroids)); // Deep copy to compare later

    // E-step: Assign points to clusters
    assignments = assignPointsToClusters(dataPoints, centroids);

    // M-step: Update centroids
    centroids = updateCentroids(dataPoints, assignments, kValue);

    iterationCount++;
    drawVisualization();

    if (areCentroidsConverged(oldCentroids, centroids)) {
        statusDiv.textContent = `Status: K-Means converged in ${iterationCount} iterations.`;
        runBtn.disabled = false;
        generateBtn.disabled = false;
    } else {
        statusDiv.textContent = `Status: Iteration ${iterationCount}. Centroids moving...`;
        animationTimeoutId = setTimeout(kmeansIteration, KMEANS_ITERATION_DELAY);
    }
}

/**
 * Resets the entire visualization and algorithm state.
 */
function resetVisualization() {
    if (animationTimeoutId) {
        clearTimeout(animationTimeoutId);
        animationTimeoutId = null;
    }
    dataPoints = [];
    assignments = [];
    centroids = [];
    kValue = 0;
    iterationCount = 0;

    clearCanvas();
    numPointsInput.value = 150;
    numClustersInput.value = 3;
    statusDiv.textContent = 'Status: Ready';
    runBtn.disabled = false;
    generateBtn.disabled = false;
}
