document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const canvas = document.getElementById('kmeansCanvas');
    const ctx = canvas.getContext('2d');
    const kValueInput = document.getElementById('kValue');
    const numPointsInput = document.getElementById('numPoints');
    const generateDataBtn = document.getElementById('generateDataBtn');
    const startClusteringBtn = document.getElementById('startClusteringBtn');
    const resetClusteringBtn = document.getElementById('resetClusteringBtn');
    const fileInput = document.getElementById('fileInput');
    const animationSpeedInput = document.getElementById('animationSpeed');
    const animationSpeedDisplay = animationSpeedInput.nextElementSibling; // Span next to speed input

    // --- Global State Variables ---
    let data = []; // Array of {x, y} objects
    let k = parseInt(kValueInput.value); // Number of clusters
    let centroids = []; // Array of {x, y} objects for centroids
    let assignments = []; // Array of cluster indices for each data point
    let clusterColors = []; // Array of colors for each cluster
    let isClustering = false;
    let animationTimeoutId = null;
    let animationSpeed = parseInt(animationSpeedInput.value); // Milliseconds between steps

    // --- Canvas Settings ---
    const POINT_RADIUS = 3;
    const CENTROID_RADIUS = 7;

    // --- Utility Functions ---
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function generateClusterColors(numColors) {
        clusterColors = [];
        for (let i = 0; i < numColors; i++) {
            clusterColors.push(getRandomColor());
        }
    }

    function distance(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

    // --- K-Means Algorithm Steps ---
    function initializeCentroids(dataPoints, numClusters) {
        const initialCentroids = [];
        const dataLength = dataPoints.length;
        if (numClusters > dataLength) {
            console.error("K cannot be greater than the number of data points.");
            return [];
        }
        
        // Pick random data points as initial centroids
        const shuffledData = [...dataPoints].sort(() => 0.5 - Math.random());
        for (let i = 0; i < numClusters; i++) {
            initialCentroids.push({ x: shuffledData[i].x, y: shuffledData[i].y });
        }
        return initialCentroids;
    }

    function assignToClusters(dataPoints, currentCentroids) {
        const newAssignments = new Array(dataPoints.length);
        dataPoints.forEach((point, i) => {
            let minDistance = Infinity;
            let closestCentroidIndex = -1;

            currentCentroids.forEach((centroid, j) => {
                const dist = distance(point, centroid);
                if (dist < minDistance) {
                    minDistance = dist;
                    closestCentroidIndex = j;
                }
            });
            newAssignments[i] = closestCentroidIndex;
        });
        return newAssignments;
    }

    function updateCentroids(dataPoints, currentAssignments, numClusters) {
        const newCentroids = Array.from({ length: numClusters }, () => ({ x: 0, y: 0, count: 0 }));

        dataPoints.forEach((point, i) => {
            const clusterIndex = currentAssignments[i];
            if (clusterIndex !== -1 && newCentroids[clusterIndex]) { // Ensure clusterIndex is valid
                newCentroids[clusterIndex].x += point.x;
                newCentroids[clusterIndex].y += point.y;
                newCentroids[clusterIndex].count++;
            }
        });

        return newCentroids.map((centroid, i) => {
            if (centroid.count > 0) {
                return { x: centroid.x / centroid.count, y: centroid.y / centroid.count };
            } else {
                // Handle empty cluster: re-initialize it to a random data point
                // or keep its previous position. For simplicity, we'll keep previous.
                // A more robust solution might pick a point furthest from other centroids.
                console.warn(`Cluster ${i} is empty. Keeping old centroid position.`);
                return centroids[i]; 
            }
        });
    }

    function hasConverged(oldCentroids, newCentroids, threshold = 0.1) {
        if (oldCentroids.length !== newCentroids.length) return false;

        for (let i = 0; i < oldCentroids.length; i++) {
            if (distance(oldCentroids[i], newCentroids[i]) > threshold) {
                return false;
            }
        }
        return true;
    }

    // --- Drawing Functions ---
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw data points
        data.forEach((point, i) => {
            ctx.beginPath();
            const clusterIndex = assignments[i];
            ctx.arc(point.x, point.y, POINT_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = clusterIndex !== -1 && clusterColors[clusterIndex] ? clusterColors[clusterIndex] : '#888888'; // Grey for unassigned
            ctx.fill();
            ctx.closePath();
        });

        // Draw centroids
        centroids.forEach((centroid, i) => {
            ctx.beginPath();
            ctx.arc(centroid.x, centroid.y, CENTROID_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = clusterColors[i] || '#000000'; // Fallback to black
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
        });
    }

    // --- Main K-Means Animation Loop ---
    function stepKMeans() {
        if (!isClustering) {
            clearTimeout(animationTimeoutId);
            return;
        }

        const oldCentroids = JSON.parse(JSON.stringify(centroids)); // Deep copy for convergence check

        // Assignment step
        assignments = assignToClusters(data, centroids);
        draw(); // Visualize points assigned to clusters

        // Update centroids step
        const newCentroids = updateCentroids(data, assignments, k);

        if (hasConverged(oldCentroids, newCentroids)) {
            centroids = newCentroids; // Apply final update
            draw();
            isClustering = false;
            console.log('K-Means converged!');
            startClusteringBtn.textContent = 'Start Clustering';
            startClusteringBtn.disabled = false;
            return;
        }

        centroids = newCentroids;
        draw(); // Visualize updated centroids

        animationTimeoutId = setTimeout(stepKMeans, animationSpeed);
    }

    // --- Event Handlers ---
    function generateRandomData() {
        const numPoints = parseInt(numPointsInput.value);
        data = [];
        for (let i = 0; i < numPoints; i++) {
            data.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height
            });
        }
        resetClustering();
    }

    function startClustering() {
        k = parseInt(kValueInput.value);
        if (k <= 0 || isNaN(k)) {
            alert('Please enter a valid number of clusters (K > 0).');
            return;
        }
        if (data.length === 0) {
            alert('Please generate or upload data first.');
            return;
        }
        if (k > data.length) {
            alert('Number of clusters (K) cannot be greater than the number of data points.');
            return;
        }

        // Reset previous clustering state
        if (animationTimeoutId) clearTimeout(animationTimeoutId);
        isClustering = true;
        startClusteringBtn.textContent = 'Clustering...';
        startClusteringBtn.disabled = true;

        generateClusterColors(k);
        centroids = initializeCentroids(data, k);
        assignments = new Array(data.length).fill(-1); // Initialize all points unassigned
        draw(); // Draw initial state with random centroids

        // Start the animation loop after a short delay to show initial state
        setTimeout(stepKMeans, animationSpeed);
    }

    function resetClustering() {
        isClustering = false;
        if (animationTimeoutId) clearTimeout(animationTimeoutId);
        centroids = [];
        assignments = new Array(data.length).fill(-1); // Reset all assignments
        startClusteringBtn.textContent = 'Start Clustering';
        startClusteringBtn.disabled = false;
        draw(); // Redraw data without clusters/centroids
    }

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split('\n').filter(line => line.trim() !== '');
            const parsedData = [];
            // Assuming CSV format: x,y or x,y,other_columns
            for (const line of lines) {
                const parts = line.split(',').map(Number);
                if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                    // Scale data to canvas dimensions if necessary, or assume it's already in range
                    // For simplicity, we'll assume data is roughly in the range [0, 800] for X and [0, 600] for Y
                    parsedData.push({ x: parts[0], y: parts[1] });
                }
            }

            if (parsedData.length > 0) {
                data = parsedData;
                numPointsInput.value = data.length; // Update num points input
                resetClustering();
                draw();
            } else {
                alert("Could not parse data. Ensure it's a CSV with at least two numeric columns (e.g., '10,20').");
            }
        };
        reader.readAsText(file);
    }

    // --- Event Listeners ---
    generateDataBtn.addEventListener('click', generateRandomData);
    startClusteringBtn.addEventListener('click', startClustering);
    resetClusteringBtn.addEventListener('click', resetClustering);
    fileInput.addEventListener('change', handleFileUpload);

    kValueInput.addEventListener('change', () => {
        k = parseInt(kValueInput.value);
        resetClustering(); // Reset when K changes
    });

    animationSpeedInput.addEventListener('input', () => {
        animationSpeed = parseInt(animationSpeedInput.value);
        animationSpeedDisplay.textContent = `${animationSpeed}ms`;
    });

    // --- Initialization ---
    generateRandomData(); // Generate initial random data on load
});
