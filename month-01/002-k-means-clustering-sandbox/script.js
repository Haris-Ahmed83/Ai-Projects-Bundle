// script.js

const canvas = document.getElementById('kmeans-canvas');
const ctx = canvas.getContext('2d');
const kInput = document.getElementById('k-input');
const runButton = document.getElementById('run-kmeans');
const resetButton = document.getElementById('reset-canvas');

let points = []; // [{x, y, cluster_id}]
let centroids = []; // [{x, y}]
let k = parseInt(kInput.value); // Initial K value
let animationTimeoutId = null; // To stop ongoing K-Means visualization

// Predefined colors for clusters. More can be added if K is very large.
const clusterColors = [
    '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
    '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
    '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000',
    '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080'
];

// --- Canvas Interaction ---
let isDrawing = false;
let lastPoint = null; // For smooth drawing when dragging

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    addPoint(e.offsetX, e.offsetY);
    lastPoint = { x: e.offsetX, y: e.offsetY };
    drawAll();
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;

    // Add points along the line for smoother drawing
    const currentPoint = { x: e.offsetX, y: e.offsetY };
    if (lastPoint) {
        const dist = distance(lastPoint, currentPoint);
        const steps = Math.max(1, Math.floor(dist / 5)); // Add a point every 5 pixels
        for (let i = 1; i <= steps; i++) {
            const ratio = i / steps;
            const x = lastPoint.x + (currentPoint.x - lastPoint.x) * ratio;
            const y = lastPoint.y + (currentPoint.y - lastPoint.y) * ratio;
            addPoint(x, y);
        }
    }
    lastPoint = currentPoint;
    drawAll();
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    lastPoint = null;
});

canvas.addEventListener('mouseleave', () => {
    isDrawing = false; // Stop drawing if mouse leaves canvas
    lastPoint = null;
});

function addPoint(x, y) {
    points.push({ x: x, y: y, cluster: -1 }); // -1 means unassigned
}

// --- Drawing Functions ---
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawPoint(point, color, radius = 4) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

function drawCentroid(centroid, color, radius = 8) {
    ctx.beginPath();
    ctx.arc(centroid.x, centroid.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#333'; // Dark border for centroids
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

function drawAll() {
    clearCanvas();
    points.forEach(p => {
        const color = p.cluster !== -1 ? clusterColors[p.cluster % clusterColors.length] : '#888'; // Grey for unassigned
        drawPoint(p, color);
    });
    centroids.forEach((c, index) => {
        drawCentroid(c, clusterColors[index % clusterColors.length]); // Centroid color matches its cluster
    });
}

// --- K-Means Algorithm Logic ---

function distance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function initializeCentroids(k, dataPoints) {
    const initialCentroids = [];
    // Randomly pick k distinct points from dataPoints as initial centroids
    const shuffledPoints = [...dataPoints].sort(() => 0.5 - Math.random());
    for (let i = 0; i < k; i++) {
        initialCentroids.push({ x: shuffledPoints[i].x, y: shuffledPoints[i].y });
    }
    return initialCentroids;
}

function assignPointsToCentroids(dataPoints, currentCentroids) {
    let changed = false;
    dataPoints.forEach(point => {
        let minDistance = Infinity;
        let closestCentroidIndex = -1;

        currentCentroids.forEach((centroid, index) => {
            const dist = distance(point, centroid);
            if (dist < minDistance) {
                minDistance = dist;
                closestCentroidIndex = index;
            }
        });

        if (point.cluster !== closestCentroidIndex) {
            point.cluster = closestCentroidIndex;
            changed = true;
        }
    });
    return changed;
}

function updateCentroids(dataPoints, numClusters) {
    const newCentroids = Array.from({ length: numClusters }, () => ({ x: 0, y: 0, count: 0 }));

    dataPoints.forEach(point => {
        if (point.cluster !== -1 && point.cluster < numClusters) { // Ensure cluster_id is valid and within bounds
            newCentroids[point.cluster].x += point.x;
            newCentroids[point.cluster].y += point.y;
            newCentroids[point.cluster].count++;
        }
    });

    return newCentroids.map((c, index) => {
        if (c.count > 0) {
            return { x: c.x / c.count, y: c.y / c.count };
        } else {
            // If a cluster is empty, re-initialize its centroid to a random data point
            // This prevents centroids from getting stuck or causing NaN values.
            const randomPoint = dataPoints[Math.floor(Math.random() * dataPoints.length)];
            console.warn(`Cluster ${index} became empty. Re-initializing centroid.`);
            return { x: randomPoint.x, y: randomPoint.y };
        }
    });
}

function hasConverged(oldCentroids, newCentroids, epsilon = 0.1) {
    if (oldCentroids.length !== newCentroids.length) return false; // Should not happen if k is consistent
    for (let i = 0; i < oldCentroids.length; i++) {
        if (distance(oldCentroids[i], newCentroids[i]) > epsilon) {
            return false;
        }
    }
    return true;
}

async function runKMeans() {
    // Stop any ongoing animation
    if (animationTimeoutId) {
        clearTimeout(animationTimeoutId);
        animationTimeoutId = null;
    }

    k = parseInt(kInput.value); // Get current K value from input

    // --- Input Validation ---
    if (isNaN(k) || k < 1) {
        alert("Please enter a valid number for K (at least 1).");
        return;
    }
    if (points.length === 0) {
        alert("Please add some data points to the canvas first!");
        return;
    }
    if (k > points.length) {
        // Automatically adjust K if it's too high for the number of points
        console.warn(`K (${k}) cannot be greater than the number of data points (${points.length}). Setting K to ${points.length}.`);
        k = points.length;
        kInput.value = k; // Update the input field as well
    }
    if (k === 0) { // Edge case if points.length was 0 and k was adjusted to 0
        alert("Cannot run K-Means with 0 clusters or 0 points.");
        return;
    }

    // Reset cluster assignments for all points before starting new run
    points.forEach(p => p.cluster = -1);

    centroids = initializeCentroids(k, points);
    drawAll(); // Draw initial centroids

    let iterations = 0;
    const maxIterations = 100; // Limit iterations to prevent infinite loops
    let converged = false;

    runButton.disabled = true; // Disable buttons during execution
    resetButton.disabled = true;

    // Asynchronous loop for step-by-step visualization
    const kmeansLoop = async () => {
        if (iterations >= maxIterations) {
            console.log("Max iterations reached.");
            converged = true;
        }

        if (!converged) {
            iterations++;
            console.log(`Iteration ${iterations}`);

            const oldCentroids = centroids.map(c => ({ ...c })); // Deep copy for convergence check

            const assignmentsChanged = assignPointsToCentroids(points, centroids);
            centroids = updateCentroids(points, k);

            drawAll(); // Redraw after assignment and centroid update

            // Check for convergence: if assignments didn't change AND centroids moved minimally
            if (!assignmentsChanged && hasConverged(oldCentroids, centroids)) {
                converged = true;
                console.log("K-Means converged.");
            } else {
                animationTimeoutId = setTimeout(kmeansLoop, 500); // Small delay for visualization
            }
        }

        if (converged) {
            runButton.disabled = false; // Re-enable buttons after convergence or max iterations
            resetButton.disabled = false;
            animationTimeoutId = null;
        }
    };

    kmeansLoop(); // Start the K-Means loop
}

function resetCanvas() {
    // Stop any ongoing animation
    if (animationTimeoutId) {
        clearTimeout(animationTimeoutId);
        animationTimeoutId = null;
    }

    points = [];
    centroids = [];
    kInput.value = 3; // Reset K input to default
    k = 3;
    clearCanvas();
    runButton.disabled = false;
    resetButton.disabled = false;
    drawAll(); // Draw an empty canvas
}

// --- Event Listeners ---
kInput.addEventListener('change', () => {
    k = parseInt(kInput.value);
    if (isNaN(k) || k < 1) {
        kInput.value = 1; // Enforce minimum K
        k = 1;
    } else if (k > 20) { // Optional: enforce a reasonable max K for visualization
        kInput.value = 20;
        k = 20;
    }
    // No need to redraw anything, just update internal k value. 
    // Visualization happens when runKMeans is clicked.
});

runButton.addEventListener('click', runKMeans);
resetButton.addEventListener('click', resetCanvas);

// Initial draw to show an empty canvas (or any pre-existing points if loaded)
drawAll();
