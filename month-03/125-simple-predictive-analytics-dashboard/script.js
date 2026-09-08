// DOM Elements
const csvFileInput = document.getElementById('csvFile');
const loadDataBtn = document.getElementById('loadDataBtn');
const dataPreviewDiv = document.getElementById('dataPreview');
const featureColumnSelect = document.getElementById('featureColumn');
const targetColumnSelect = document.getElementById('targetColumn');
const predictionStepsInput = document.getElementById('predictionSteps');
const trainPredictBtn = document.getElementById('trainPredictBtn');
const predictionChartCanvas = document.getElementById('predictionChart');
const predictionOutputDiv = document.getElementById('predictionOutput');

let rawData = []; // Stores parsed CSV data (array of objects)
let headers = []; // Stores CSV headers
let myChart; // Chart.js instance
let model = { m: 0, b: 0 }; // Linear regression model parameters (slope, intercept)

// --- Utility Functions ---

// Simple CSV Parser
function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length === 0) return { data: [], headers: [] };

    const parsedHeaders = lines[0].split(',').map(h => h.trim());
    const parsedData = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length === parsedHeaders.length) {
            let row = {};
            parsedHeaders.forEach((header, index) => {
                // Try to convert to number, otherwise keep as string
                row[header] = isNaN(Number(values[index])) || values[index].trim() === '' ? values[index] : Number(values[index]);
            });
            parsedData.push(row);
        }
    }
    return { data: parsedData, headers: parsedHeaders };
}

// Render data preview table
function renderDataTable(data, headers) {
    dataPreviewDiv.innerHTML = '';
    if (data.length === 0) {
        dataPreviewDiv.textContent = 'No data to display.';
        return;
    }

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Table Header
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Table Body (show first 10 rows)
    data.slice(0, 10).forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            td.textContent = row[header];
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    dataPreviewDiv.appendChild(table);
}

// Populate column selectors
function populateColumnSelectors(headers) {
    featureColumnSelect.innerHTML = '';
    targetColumnSelect.innerHTML = '';

    headers.forEach(header => {
        const optionX = document.createElement('option');
        optionX.value = header;
        optionX.textContent = header;
        featureColumnSelect.appendChild(optionX);

        const optionY = document.createElement('option');
        optionY.value = header;
        optionY.textContent = header;
        targetColumnSelect.appendChild(optionY);
    });

    // Enable selectors if headers exist
    featureColumnSelect.disabled = headers.length === 0;
    targetColumnSelect.disabled = headers.length === 0;
    predictionStepsInput.disabled = headers.length === 0;
    trainPredictBtn.disabled = headers.length === 0;
}

// Basic Linear Regression (Least Squares Method)
// Returns { m: slope, b: intercept }
function linearRegression(x, y) {
    const n = x.length;
    if (n === 0 || n !== y.length) return { m: 0, b: 0 };

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumX2 += x[i] * x[i];
    }

    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = (n * sumX2) - (sumX * sumX);

    if (denominator === 0) {
        // Handle vertical line case (all X values are the same) or no variance in X
        // In this case, prediction is simply the average Y
        return { m: 0, b: sumY / n };
    }

    const m = numerator / denominator;
    const b = (sumY / n) - (m * sumX / n);

    return { m, b };
}

// Predict Y for a given X using the model
function predict(x_value, m, b) {
    return m * x_value + b;
}

// Render/Update Chart
function renderChart(historicalLabels, historicalDataPoints, predictedLabels, predictedDataPoints) {
    const ctx = predictionChartCanvas.getContext('2d');

    if (myChart) {
        myChart.destroy(); // Destroy previous chart instance
    }

    // Combine labels for continuous X-axis
    const allLabels = [...historicalLabels, ...predictedLabels];

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: allLabels,
            datasets: [
                {
                    label: 'Historical Data',
                    data: historicalDataPoints,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: false,
                    tension: 0.1,
                    pointRadius: 3,
                    pointBackgroundColor: 'rgba(75, 192, 192, 1)'
                },
                {
                    label: 'Predicted Trend',
                    // Only show predicted data points for future labels
                    data: Array(historicalLabels.length).fill(null).concat(predictedDataPoints),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: false,
                    tension: 0.1,
                    borderDash: [5, 5],
                    pointRadius: 3,
                    pointBackgroundColor: 'rgba(255, 99, 132, 1)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: featureColumnSelect.value || 'Feature'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: targetColumnSelect.value || 'Target'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toFixed(2);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// --- Event Handlers ---

// Handle file selection
csvFileInput.addEventListener('change', () => {
    if (csvFileInput.files.length > 0) {
        loadDataBtn.disabled = false;
    } else {
        loadDataBtn.disabled = true;
    }
});

// Handle Load Data button click
loadDataBtn.addEventListener('click', () => {
    const file = csvFileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        const parsed = parseCSV(text);
        rawData = parsed.data;
        headers = parsed.headers;

        renderDataTable(rawData, headers);
        populateColumnSelectors(headers);
        predictionOutputDiv.innerHTML = '';
        if (myChart) myChart.destroy();
    };
    reader.readAsText(file);
});

// Handle Train Model & Predict button click
trainPredictBtn.addEventListener('click', () => {
    const featureCol = featureColumnSelect.value;
    const targetCol = targetColumnSelect.value;
    const predictionSteps = parseInt(predictionStepsInput.value);

    if (!featureCol || !targetCol || !rawData.length) {
        alert('Please load data and select both feature and target columns.');
        return;
    }

    // Filter out non-numeric values and create X, Y arrays
    const validData = rawData.filter(row => 
        typeof row[featureCol] === 'number' && typeof row[targetCol] === 'number'
    );

    const xValues = validData.map(row => row[featureCol]);
    const yValues = validData.map(row => row[targetCol]);

    if (xValues.length === 0 || yValues.length === 0 || xValues.length !== yValues.length) {
        alert('Selected columns do not contain sufficient valid numerical data for prediction, or data lengths mismatch.');
        return;
    }

    // Train the model
    model = linearRegression(xValues, yValues);
    console.log('Model trained:', model);
    predictionOutputDiv.innerHTML = `<p><strong>Model:</strong> Y = ${model.m.toFixed(4)}X + ${model.b.toFixed(4)}</p>`;

    // Prepare historical data for chart
    const historicalLabels = xValues;
    const historicalDataPoints = yValues;

    // Generate predictions based on the last observed feature value
    const lastX = xValues[xValues.length - 1];
    const predictedLabels = [];
    const predictedDataPoints = [];

    for (let i = 1; i <= predictionSteps; i++) {
        const nextX = lastX + i; // Assumes feature column is sequential (e.g., time, index)
        const predictedY = predict(nextX, model.m, model.b);
        predictedLabels.push(nextX);
        predictedDataPoints.push(predictedY);
        predictionOutputDiv.innerHTML += `<p>X=${nextX}: Predicted Y=${predictedY.toFixed(2)}</p>`;
    }

    // Render chart
    renderChart(historicalLabels, historicalDataPoints, predictedLabels, predictedDataPoints);
});

// Initial state: disable buttons
loadDataBtn.disabled = true;
trainPredictBtn.disabled = true;
featureColumnSelect.disabled = true;
targetColumnSelect.disabled = true;
predictionStepsInput.disabled = true;
