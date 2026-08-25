// DOM Elements
const dataInput = document.getElementById('dataInput');
const fileInput = document.getElementById('fileInput');
const loadDataBtn = document.getElementById('loadDataBtn');
const modelSelect = document.getElementById('modelSelect');
const modelParamsDiv = document.getElementById('modelParams');
const forecastStepsInput = document.getElementById('forecastSteps');
const applyForecastBtn = document.getElementById('applyForecastBtn');
const timeSeriesChartCtx = document.getElementById('timeSeriesChart').getContext('2d');
const resultsDisplay = document.getElementById('resultsDisplay');

let chart; // Chart.js instance
let originalData = []; // Stores { date: Date, value: number }
let chartLabels = []; // Dates for x-axis (Chart.js expects this to be consistent)
let chartValues = []; // Values for y-axis

// Initialize Chart.js
function initializeChart() {
    if (chart) {
        chart.destroy();
    }
    chart = new Chart(timeSeriesChartCtx, {
        type: 'line',
        data: {
            labels: chartLabels, // Initially, these are the original data dates
            datasets: [{
                label: 'Original Data',
                data: chartValues, // Initially, these are the original data values
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
                fill: false,
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        tooltipFormat: 'yyyy-MM-dd'
                    },
                    title: {
                        display: true,
                        text: 'Date'
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
                    position: 'top',
                }
            }
        }
    });
}

// Parse CSV data
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
        alert('Please provide at least a header and one data row.');
        return [];
    }

    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const dateColIndex = header.indexOf('date');
    const valueColIndex = header.indexOf('value');

    if (dateColIndex === -1 || valueColIndex === -1) {
        alert('CSV must contain "date" and "value" columns in the header.');
        return [];
    }

    const parsed = [];
    for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length > Math.max(dateColIndex, valueColIndex)) {
            const dateStr = parts[dateColIndex];
            const valueStr = parts[valueColIndex];
            const date = new Date(dateStr); // Direct parsing assuming YYYY-MM-DD
            const value = parseFloat(valueStr);

            if (!isNaN(date.getTime()) && !isNaN(value)) {
                parsed.push({ date: date, value: value });
            } else {
                console.warn(`Skipping invalid row: ${lines[i]}`);
            }
        }
    }
    // Sort by date to ensure correct time series order
    parsed.sort((a, b) => a.date.getTime() - b.date.getTime());
    return parsed;
}

function loadData(text) {
    originalData = parseCSV(text);
    if (originalData.length > 0) {
        chartLabels = originalData.map(d => d.date);
        chartValues = originalData.map(d => d.value);
        initializeChart();
        applyForecastBtn.disabled = false;
        modelSelect.disabled = false;
        forecastStepsInput.disabled = false;
        resultsDisplay.textContent = `Data loaded successfully. ${originalData.length} data points.`;
    } else {
        chartLabels = [];
        chartValues = [];
        initializeChart(); // Clear chart
        applyForecastBtn.disabled = true;
        modelSelect.disabled = true;
        forecastStepsInput.disabled = true;
        resultsDisplay.textContent = 'Failed to load data. Please check format (Date,Value).';
    }
}

// Event Listeners for data input
loadDataBtn.addEventListener('click', () => {
    loadData(dataInput.value);
});

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            dataInput.value = e.target.result; // Populate textarea for visibility
            loadData(e.target.result);
        };
        reader.readAsText(file);
    }
});

// Model parameter rendering based on selection
modelSelect.addEventListener('change', () => {
    modelParamsDiv.innerHTML = ''; // Clear previous params
    const selectedModel = modelSelect.value;

    if (selectedModel === 'movingAverage') {
        modelParamsDiv.innerHTML = `
            <label for="maWindow">Window Size:</label>
            <input type="number" id="maWindow" value="3" min="1" step="1">
        `;
    } else if (selectedModel === 'exponentialSmoothing') {
        modelParamsDiv.innerHTML = `
            <label for="esAlpha">Alpha (Smoothing Factor):</label>
            <input type="number" id="esAlpha" value="0.2" min="0" max="1" step="0.01">
        `;
    }
});

// Forecasting functions
// Basic Moving Average: Forecast is the average of the last 'windowSize' actual values.
function calculateMovingAverage(data, windowSize, forecastSteps) {
    if (data.length < windowSize) {
        return [];
    }
    const actualValues = data.map(d => d.value);
    
    let sum = 0;
    for (let i = actualValues.length - windowSize; i < actualValues.length; i++) {
        sum += actualValues[i];
    }
    const lastAvg = sum / windowSize;

    return Array(forecastSteps).fill(lastAvg);
}

// Basic Exponential Smoothing: Ft = α * Yt-1 + (1 - α) * Ft-1
// Forecast is the last smoothed value, repeated.
function calculateExponentialSmoothing(data, alpha, forecastSteps) {
    if (data.length === 0) {
        return [];
    }
    const actualValues = data.map(d => d.value);

    let lastForecast = actualValues[0]; // F1 = Y1 (common initialization)

    for (let i = 1; i < actualValues.length; i++) {
        lastForecast = alpha * actualValues[i - 1] + (1 - alpha) * lastForecast;
    }

    return Array(forecastSteps).fill(lastForecast);
}

// Apply forecast button event listener
applyForecastBtn.addEventListener('click', applyForecast);

function applyForecast() {
    if (originalData.length === 0) {
        alert('Please load data first.');
        return;
    }

    const selectedModel = modelSelect.value;
    const forecastSteps = parseInt(forecastStepsInput.value);
    let forecastValues = [];
    let forecastDates = [];
    let modelName = '';
    let paramsDisplay = '';

    resultsDisplay.innerHTML = ''; // Clear previous results

    if (selectedModel === 'movingAverage') {
        const maWindow = parseInt(document.getElementById('maWindow')?.value || '3');
        if (isNaN(maWindow) || maWindow < 1) {
            alert('Window size must be a positive number.');
            return;
        }
        if (originalData.length < maWindow) {
             resultsDisplay.textContent = `Error: Not enough data points (${originalData.length}) for Moving Average with window size ${maWindow}.`;
             return;
        }
        forecastValues = calculateMovingAverage(originalData, maWindow, forecastSteps);
        modelName = 'Moving Average';
        paramsDisplay = `Window Size: ${maWindow}`;
    } else if (selectedModel === 'exponentialSmoothing') {
        const esAlpha = parseFloat(document.getElementById('esAlpha')?.value || '0.2');
        if (isNaN(esAlpha) || esAlpha < 0 || esAlpha > 1) {
            alert('Alpha must be a number between 0 and 1.');
            return;
        }
        forecastValues = calculateExponentialSmoothing(originalData, esAlpha, forecastSteps);
        modelName = 'Exponential Smoothing';
        paramsDisplay = `Alpha: ${esAlpha}`;
    } else {
        alert('Please select a forecasting model.');
        return;
    }

    // Generate forecast dates starting from the day after the last original data point
    const lastOriginalDate = originalData[originalData.length - 1].date;
    for (let i = 1; i <= forecastSteps; i++) {
        const nextDate = new Date(lastOriginalDate);
        nextDate.setDate(lastOriginalDate.getDate() + i);
        forecastDates.push(nextDate);
    }

    // Update Chart.js data
    // Combine original labels and forecast dates for the x-axis
    const combinedLabels = [...chartLabels, ...forecastDates];
    
    // Original data dataset
    chart.data.datasets[0].data = chartValues;
    chart.data.datasets[0].label = 'Original Data';
    chart.data.datasets[0].borderColor = 'rgb(75, 192, 192)';

    // Forecast dataset: nulls for the historical period, then forecast values
    const forecastDataset = {
        label: `${modelName} Forecast`,
        data: Array(chartValues.length).fill(null).concat(forecastValues.map((val, idx) => ({x: forecastDates[idx], y: val}))), // Chart.js needs {x,y} for mixed data
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1,
        fill: false,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderDash: [5, 5] // Dashed line for forecast
    };

    // Ensure labels are correctly set for time scale (Chart.js will handle mapping)
    chart.data.labels = combinedLabels;

    // Remove old forecast dataset if exists (datasets[1] would be the forecast)
    if (chart.data.datasets.length > 1) {
        chart.data.datasets.pop();
    }
    chart.data.datasets.push(forecastDataset);
    chart.update();

    // Display results
    resultsDisplay.innerHTML = `
        <h3>Forecast Results</h3>
        <p><strong>Model:</strong> ${modelName}</p>
        <p><strong>Parameters:</strong> ${paramsDisplay}</p>
        <p><strong>Forecast Steps:</strong> ${forecastSteps}</p>
        <p>Forecasted values for the next ${forecastSteps} periods:</p>
        <ul>
            ${forecastValues.map((val, idx) => `<li>${forecastDates[idx].toLocaleDateString('en-US')}: ${val.toFixed(2)}</li>`).join('')}
        </ul>
    `;
}

// Initial setup on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeChart();
    // Disable controls until data is loaded
    applyForecastBtn.disabled = true;
    modelSelect.disabled = true;
    forecastStepsInput.disabled = true;
    // Trigger change event to show initial model parameters if a default is selected
    modelSelect.dispatchEvent(new Event('change')); 
    resultsDisplay.textContent = 'Load data (CSV or manual input) to begin forecasting.';
});
