// Global state variables
let timeSeriesData = []; // Stores parsed CSV data: [{timestamp: Date, value: number}]
let anomalies = [];       // Stores detected anomalies: [{timestamp: Date, value: number, index: number}]
let chartInstance = null; // Stores the Chart.js instance

// DOM Elements
const csvFileInput = document.getElementById('csvFileInput');
const uploadProcessBtn = document.getElementById('uploadProcessBtn');
const uploadStatus = document.getElementById('uploadStatus');
const algorithmSelect = document.getElementById('algorithmSelect');
const sensitivityInput = document.getElementById('sensitivityInput');
const detectAnomaliesBtn = document.getElementById('detectAnomaliesBtn');
const detectionStatus = document.getElementById('detectionStatus');
const anomalyChartCanvas = document.getElementById('anomalyChart');
const anomalyList = document.getElementById('anomalyList');
const noAnomaliesMsg = document.getElementById('noAnomaliesMsg');

// --- Utility Functions ---

/**
 * Parses a CSV string into an array of objects.
 * Assumes first row is header, first column is timestamp, second column is value.
 * @param {string} csvText - The CSV data as a string.
 * @returns {Array<Object>} An array of objects with 'timestamp' (Date) and 'value' (number).
 */
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return []; // Need at least header and one data row

    const data = [];
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length >= 2) {
            const timestamp = moment(parts[0].trim());
            const value = parseFloat(parts[1].trim());

            if (timestamp.isValid() && !isNaN(value)) {
                data.push({ timestamp: timestamp.toDate(), value: value });
            }
        }
    }
    return data.n}

/**
 * Calculates the moving average for a given dataset.
 * @param {Array<Object>} data - The dataset [{timestamp, value}].
 * @param {number} windowSize - The size of the moving window.
 * @returns {Array<number>} An array of moving average values.
 */
function calculateMovingAverage(data, windowSize) {
    const averages = [];
    for (let i = 0; i < data.length; i++) {
        const start = Math.max(0, i - Math.floor(windowSize / 2));
        const end = Math.min(data.length, i + Math.ceil(windowSize / 2));
        const window = data.slice(start, end);
        const sum = window.reduce((acc, d) => acc + d.value, 0);
        averages.push(sum / window.length);
    }
    return averages;
}

/**
 * Calculates the standard deviation for a given dataset, relative to a moving average.
 * @param {Array<Object>} data - The dataset [{timestamp, value}].
 * @param {Array<number>} means - The corresponding moving average values.
 * @param {number} windowSize - The size of the moving window.
 * @returns {Array<number>} An array of standard deviation values.
 */
function calculateStandardDeviation(data, means, windowSize) {
    const stdDevs = [];
    for (let i = 0; i < data.length; i++) {
        const start = Math.max(0, i - Math.floor(windowSize / 2));
        const end = Math.min(data.length, i + Math.ceil(windowSize / 2));
        const window = data.slice(start, end);
        const mean = means[i]; // Use the mean calculated for the current point's window
        const sumOfSquares = window.reduce((acc, d) => acc + Math.pow(d.value - mean, 2), 0);
        stdDevs.push(Math.sqrt(sumOfSquares / window.length));
    }
    return stdDevs;
}

// --- Anomaly Detection Simulation Functions ---

/**
 * Simulates anomaly detection using a simple Moving Average + Standard Deviation approach.
 * @param {Array<Object>} data - The time-series data.
 * @param {number} sensitivity - Multiplier for standard deviation (e.g., 2 for 2-sigma).
 * @param {number} windowSize - The window size for moving calculations.
 * @returns {Array<Object>} An array of detected anomalies.
 */
function detectAnomaliesMovingAvgStdDev(data, sensitivity, windowSize = 10) {
    if (data.length < windowSize) return [];

    const means = calculateMovingAverage(data, windowSize);
    const stdDevs = calculateStandardDeviation(data, means, windowSize);

    const detectedAnomalies = [];
    for (let i = 0; i < data.length; i++) {
        const lowerBound = means[i] - sensitivity * stdDevs[i];
        const upperBound = means[i] + sensitivity * stdDevs[i];

        if (data[i].value < lowerBound || data[i].value > upperBound) {
            detectedAnomalies.push({ ...data[i], index: i });
        }
    }
    return detectedAnomalies;
}

/**
 * Placeholder for other simulated anomaly detection algorithms.
 * For a front-end only project, these will reuse the basic MA+StdDev logic
 * but might apply different default parameters or add a touch of randomness.
 */
function detectAnomaliesSimulated(data, algorithm, sensitivity) {
    let windowSize = 10;
    switch (algorithm) {
        case 'isolationForest':
            // Isolation Forest often works well with smaller contamination/thresholds
            // Simulate by making it slightly more sensitive or adding random anomalies
            windowSize = 8; // Slightly smaller window
            return detectAnomaliesMovingAvgStdDev(data, sensitivity * 0.9, windowSize);
        case 'oneClassSVM':
            // One-Class SVM can be sensitive to outliers, might detect more
            windowSize = 12; // Slightly larger window
            return detectAnomaliesMovingAvgStdDev(data, sensitivity * 1.1, windowSize);
        case 'movingAvgStdDev':
        default:
            return detectAnomaliesMovingAvgStdDev(data, sensitivity, windowSize);
    }
}

// --- Charting with Chart.js ---

/**
 * Renders or updates the Chart.js graph.
 * @param {Array<Object>} data - The time-series data.
 * @param {Array<Object>} anomalies - The detected anomalies.
 */
function renderChart(data, anomalies) {
    const ctx = anomalyChartCanvas.getContext('2d');

    // Destroy existing chart instance if it exists
    if (chartInstance) {
        chartInstance.destroy();
    }

    const chartData = data.map(d => ({ x: d.timestamp, y: d.value }));
    const anomalyPoints = anomalies.map(a => ({ x: a.timestamp, y: a.value }));

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Time Series Data',
                    data: chartData,
                    borderColor: 'rgb(52, 152, 219)', // secondary-color
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 1.5,
                    pointRadius: 2,
                    pointHoverRadius: 5,
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'Detected Anomalies',
                    data: anomalyPoints,
                    borderColor: 'rgb(231, 76, 60)', // accent-color
                    backgroundColor: 'rgb(231, 76, 60)',
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: 'rgb(231, 76, 60)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    type: 'scatter'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour', // Adjust based on your data granularity
                        tooltipFormat: 'YYYY-MM-DD HH:mm'
                    },
                    title: {
                        display: true,
                        text: 'Timestamp'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Value'
                    }
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

// --- Anomaly List Rendering ---

/**
 * Renders the list of detected anomalies in the UI.
 * @param {Array<Object>} anomalies - The detected anomalies.
 */
function renderAnomalyTable(anomalies) {
    anomalyList.innerHTML = ''; // Clear previous list

    if (anomalies.length === 0) {
        noAnomaliesMsg.style.display = 'block';
        return;
    }

    noAnomaliesMsg.style.display = 'none';
    anomalies.forEach(anomaly => {
        const listItem = document.createElement('li');
        const timestampStr = moment(anomaly.timestamp).format('YYYY-MM-DD HH:mm:ss');
        listItem.innerHTML = `
            <span><strong>Timestamp:</strong> ${timestampStr}</span>
            <span><strong>Value:</strong> ${anomaly.value.toFixed(2)}</span>
        `;
        anomalyList.appendChild(listItem);
    });
}

// --- Event Handlers ---

/**
 * Handles file input change event.
 * Reads the CSV file and processes it.
 */
async function handleFileUpload() {
    const file = csvFileInput.files[0];
    if (!file) {
        uploadStatus.textContent = 'No file selected.';
        uploadStatus.className = 'status-message error';
        timeSeriesData = [];
        uploadProcessBtn.disabled = true;
        detectAnomaliesBtn.disabled = true;
        renderChart([], []);
        renderAnomalyTable([]);
        return;
    }

    uploadStatus.textContent = 'Reading file...';
    uploadStatus.className = 'status-message';
    uploadProcessBtn.disabled = false;
    detectAnomaliesBtn.disabled = true;

    try {
        const text = await file.text();
        timeSeriesData = parseCSV(text);

        if (timeSeriesData.length === 0) {
            uploadStatus.textContent = 'Failed to parse CSV or no valid data found.';
            uploadStatus.className = 'status-message error';
            timeSeriesData = [];
            uploadProcessBtn.disabled = true;
            return;
        }

        uploadStatus.textContent = `Successfully loaded ${timeSeriesData.length} data points. Click 'Process Data'.`;
        uploadStatus.className = 'status-message success';
        renderChart(timeSeriesData, []); // Show raw data

    } catch (error) {
        console.error('Error reading or parsing file:', error);
        uploadStatus.textContent = `Error: ${error.message}`;
        uploadStatus.className = 'status-message error';
        timeSeriesData = [];
        uploadProcessBtn.disabled = true;
    }
}

/**
 * Handles the 'Process Data' button click.
 * This is a placeholder for actual data preprocessing, here it just enables anomaly detection.
 */
function handleProcessData() {
    if (timeSeriesData.length > 0) {
        uploadStatus.textContent = `Data processed. Ready for anomaly detection!`;
        uploadStatus.className = 'status-message success';
        detectAnomaliesBtn.disabled = false;
    } else {
        uploadStatus.textContent = 'No data to process. Please upload a CSV.';
        uploadStatus.className = 'status-message error';
        detectAnomaliesBtn.disabled = true;
    }
}

/**
 * Handles the 'Detect Anomalies' button click.
 * Runs the selected anomaly detection algorithm.
 */
function handleDetectAnomalies() {
    if (timeSeriesData.length === 0) {
        detectionStatus.textContent = 'No data to analyze. Please upload and process a CSV.';
        detectionStatus.className = 'status-message error';
        return;
    }

    detectionStatus.textContent = 'Detecting anomalies...';
    detectionStatus.className = 'status-message';

    const selectedAlgorithm = algorithmSelect.value;
    const sensitivity = parseFloat(sensitivityInput.value);

    if (isNaN(sensitivity) || sensitivity <= 0) {
        detectionStatus.textContent = 'Invalid sensitivity value. Please enter a positive number.';
        detectionStatus.className = 'status-message error';
        return;
    }

    // Simulate API call or intensive computation
    setTimeout(() => {
        anomalies = detectAnomaliesSimulated(timeSeriesData, selectedAlgorithm, sensitivity);

        detectionStatus.textContent = `Detected ${anomalies.length} anomalies using ${selectedAlgorithm}.`;
        detectionStatus.className = 'status-message success';

        renderChart(timeSeriesData, anomalies);
        renderAnomalyTable(anomalies);
    }, 500); // Simulate network delay/computation time
}

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // Initial chart render (empty)
    renderChart([], []);

    // Attach event listeners
    csvFileInput.addEventListener('change', handleFileUpload);
    uploadProcessBtn.addEventListener('click', handleProcessData);
    detectAnomaliesBtn.addEventListener('click', handleDetectAnomalies);

    // Enable/disable buttons based on initial state
    uploadProcessBtn.disabled = true; // Enabled after file is selected and parsed
    detectAnomaliesBtn.disabled = true; // Enabled after data is processed
});
