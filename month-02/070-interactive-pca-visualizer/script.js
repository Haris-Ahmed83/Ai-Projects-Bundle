let rawData = null; // Original parsed data, array of objects
let headers = []; // Headers of numerical columns
let numericalDataMatrix = null; // 2D array of numerical data after preprocessing
let pcaInstance = null; // ml-pca PCA instance
let pcaTransformedData = null; // Data projected onto principal components
let chart = null; // Chart.js instance

// DOM Elements
const csvFileInput = document.getElementById('csvFileInput');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const dataPreview = document.getElementById('dataPreview');
const numComponentsInput = document.getElementById('numComponents');
const xAxisComponentSelect = document.getElementById('xAxisComponent');
const yAxisComponentSelect = document.getElementById('yAxisComponent');
const runPcaBtn = document.getElementById('runPcaBtn');
const pcaChartCtx = document.getElementById('pcaChart').getContext('2d');
const explainedVarianceList = document.getElementById('explainedVariance');
const loadingSpinner = document.getElementById('loadingSpinner');

// Register zoom plugin globally once
Chart.register(ChartZoom);

// --- Event Listeners ---
csvFileInput.addEventListener('change', handleFileUpload);
runPcaBtn.addEventListener('click', runPCAAndVisualize);
numComponentsInput.addEventListener('change', updateComponentDropdowns);
xAxisComponentSelect.addEventListener('change', updateChart);
yAxisComponentSelect.addEventListener('change', updateChart);

// Disable controls initially
runPcaBtn.disabled = true;
numComponentsInput.disabled = true;
xAxisComponentSelect.disabled = true;
yAxisComponentSelect.disabled = true;

// --- Helper Functions ---
function showSpinner() {
    loadingSpinner.style.display = 'block';
    runPcaBtn.disabled = true;
}

function hideSpinner() {
    loadingSpinner.style.display = 'none';
    // runPcaBtn.disabled is re-enabled by processData or runPCAAndVisualize finally block
}

function showAlert(message, type = 'error') {
    // Simple alert for now, could be a more styled modal
    alert(message);
    console.error(message);
}

// --- Data Processing ---
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) {
        fileNameDisplay.textContent = '';
        dataPreview.innerHTML = '';
        runPcaBtn.disabled = true;
        numComponentsInput.disabled = true;
        xAxisComponentSelect.disabled = true;
        yAxisComponentSelect.disabled = true;
        return;
    }

    fileNameDisplay.textContent = `File: ${file.name}`;
    showSpinner();

    PapaParse.parse(file, {
        header: true,
        dynamicTyping: true, // Attempt to convert numbers
        skipEmptyLines: true,
        complete: function(results) {
            if (results.data.length === 0) {
                showAlert('CSV file is empty or contains no valid data rows.');
                hideSpinner();
                return;
            }
            processData(results.data);
            hideSpinner();
        },
        error: function(err) {
            showAlert(`Error parsing CSV: ${err.message}`);
            hideSpinner();
        }
    });
}

function processData(data) {
    rawData = data;
    let allHeaders = Object.keys(rawData[0] || {});

    // Filter for numerical columns and handle NaNs
    const tempNumericalData = [];
    const numericalHeaders = [];

    // Identify numerical columns based on the first few rows (or all if small)
    if (rawData.length > 0) {
        for (const header of allHeaders) {
            let isNumerical = true;
            // Check a sample of rows to determine if column is numerical
            for (let i = 0; i < Math.min(rawData.length, 100); i++) { // Check up to 100 rows
                let value = rawData[i][header];
                if (value === null || value === undefined || (typeof value !== 'number' && isNaN(parseFloat(value)))) {
                    isNumerical = false;
                    break;
                }
            }
            if (isNumerical) {
                numericalHeaders.push(header);
            }
        }
    }

    if (numericalHeaders.length === 0) {
        showAlert('No numerical columns found in the dataset. PCA cannot be performed.');
        dataPreview.innerHTML = 'No numerical data available for preview.';
        runPcaBtn.disabled = true;
        numComponentsInput.disabled = true;
        xAxisComponentSelect.disabled = true;
        yAxisComponentSelect.disabled = true;
        return;
    }

    headers = numericalHeaders; // Update global headers to only include numerical ones

    for (const row of rawData) {
        const numericalRow = [];
        let hasNaN = false;
        for (const header of headers) {
            let value = row[header];
            if (typeof value !== 'number') {
                value = parseFloat(value); // Try parsing again
            }
            if (isNaN(value)) {
                hasNaN = true;
                break; // Skip this row if it has any NaN in a numerical column
            }
            numericalRow.push(value);
        }
        if (!hasNaN) {
            tempNumericalData.push(numericalRow);
        }
    }

    if (tempNumericalData.length < 2) {
        showAlert('Not enough valid rows (at least 2 required) after filtering non-numerical data or rows with missing values. PCA cannot be performed.');
        dataPreview.innerHTML = 'Not enough valid data rows for preview.';
        runPcaBtn.disabled = true;
        numComponentsInput.disabled = true;
        return;
    }

    // Display a preview of the processed data
    displayDataPreview(tempNumericalData, headers);

    // Standardize the data
    numericalDataMatrix = standardizeData(tempNumericalData);

    // Enable PCA controls
    numComponentsInput.disabled = false;
    runPcaBtn.disabled = false;

    // Set max components
    const maxPossibleComponents = Math.min(headers.length, numericalDataMatrix.length - 1);
    numComponentsInput.max = Math.max(1, maxPossibleComponents); // Ensure min is 1 if possible
    if (parseInt(numComponentsInput.value) > maxPossibleComponents) {
        numComponentsInput.value = Math.max(1, maxPossibleComponents);
    } else if (parseInt(numComponentsInput.value) < 1) {
        numComponentsInput.value = 1;
    }

    if (maxPossibleComponents < 1) { 
        numComponentsInput.value = 0; // No components can be extracted
        numComponentsInput.disabled = true;
        runPcaBtn.disabled = true;
        showAlert('Cannot perform PCA: Insufficient unique samples or features after preprocessing.');
        return;
    }

    updateComponentDropdowns();
}

function standardizeData(matrix) {
    const numRows = matrix.length;
    const numCols = matrix[0].length;
    const standardizedMatrix = [];

    // Calculate mean and std deviation for each column
    const means = new Array(numCols).fill(0);
    const stdDevs = new Array(numCols).fill(0);

    for (let j = 0; j < numCols; j++) {
        let sum = 0;
        for (let i = 0; i < numRows; i++) {
            sum += matrix[i][j];
        }
        means[j] = sum / numRows;

        let sumOfSquares = 0;
        for (let i = 0; i < numRows; i++) {
            sumOfSquares += Math.pow(matrix[i][j] - means[j], 2);
        }
        stdDevs[j] = Math.sqrt(sumOfSquares / (numRows - 1)); // Sample standard deviation
        // Handle cases where stdDev is 0 (constant column)
        if (stdDevs[j] === 0) {
            stdDevs[j] = 1; // Prevent division by zero, effectively making these values 0 after centering
        }
    }

    // Apply standardization
    for (let i = 0; i < numRows; i++) {
        const standardizedRow = [];
        for (let j = 0; j < numCols; j++) {
            standardizedRow.push((matrix[i][j] - means[j]) / stdDevs[j]);
        }
        standardizedMatrix.push(standardizedRow);
    }
    return standardizedMatrix;
}

function displayDataPreview(data, headersToDisplay) {
    let html = '<table><thead><tr>';
    for (let i = 0; i < Math.min(headersToDisplay.length, 5); i++) { // Show max 5 headers
        html += `<th>${headersToDisplay[i]}</th>`;
    }
    html += '</tr></thead><tbody>';

    for (let i = 0; i < Math.min(data.length, 5); i++) { // Show max 5 rows
        html += '<tr>';
        for (let j = 0; j < Math.min(data[i].length, 5); j++) { // Show max 5 columns
            html += `<td>${data[i][j].toFixed(2)}</td>`; // Format numbers for display
        }
        html += '</tr>';
    }
    html += '</tbody></table>';
    dataPreview.innerHTML = html;
}

// --- PCA & Visualization ---
async function runPCAAndVisualize() {
    if (!numericalDataMatrix || numericalDataMatrix.length < 2) {
        showAlert('Please upload a valid CSV file with at least 2 rows of numerical data first.');
        return;
    }

    showSpinner();

    const numComponents = parseInt(numComponentsInput.value);
    if (isNaN(numComponents) || numComponents < 1) {
        showAlert('Please enter a valid number of components (at least 1).');
        hideSpinner();
        return;
    }

    const maxPossibleComponents = Math.min(headers.length, numericalDataMatrix.length - 1);
    const effectiveNumComponents = Math.min(numComponents, maxPossibleComponents);

    if (effectiveNumComponents < 1) {
        showAlert('Not enough features or samples to perform PCA with the requested number of components. Max possible components: ' + maxPossibleComponents);
        hideSpinner();
        return;
    }

    try {
        // ml-pca expects a Matrix object
        const matrix = new Matrix(numericalDataMatrix);
        pcaInstance = new PCA(matrix, {
            numberOfComponents: effectiveNumComponents
        });
        pcaTransformedData = pcaInstance.predict(matrix).to2DArray(); // Convert back to 2D array for Chart.js

        updateExplainedVariance();
        updateComponentDropdowns(); // Re-populate dropdowns based on actual components extracted
        updateChart();

        xAxisComponentSelect.disabled = false;
        yAxisComponentSelect.disabled = false;

    } catch (error) {
        showAlert(`Error performing PCA: ${error.message}`);
        console.error(error);
        pcaInstance = null;
        pcaTransformedData = null;
        explainedVarianceList.innerHTML = '';
        if (chart) {
            chart.destroy();
            chart = null;
        }
    } finally {
        hideSpinner();
        runPcaBtn.disabled = false; // Re-enable button after operation
    }
}

function updateExplainedVariance() {
    explainedVarianceList.innerHTML = '';
    if (pcaInstance && pcaInstance.explainedVariance) {
        pcaInstance.explainedVariance.forEach((variance, index) => {
            const li = document.createElement('li');
            li.textContent = `PC${index + 1}: ${((variance || 0) * 100).toFixed(2)}%`;
            explainedVarianceList.appendChild(li);
        });
    }
}

function updateComponentDropdowns() {
    // Use the actual number of components if PCA has been run, otherwise use the input value
    const currentNumComponents = pcaInstance ? pcaInstance.principalComponents.rows : parseInt(numComponentsInput.value);
    const maxPossibleComponents = Math.min(headers.length, numericalDataMatrix ? numericalDataMatrix.length - 1 : 0);
    const componentsToShow = Math.min(currentNumComponents, maxPossibleComponents);

    xAxisComponentSelect.innerHTML = '';
    yAxisComponentSelect.innerHTML = '';

    if (componentsToShow === 0) {
        xAxisComponentSelect.disabled = true;
        yAxisComponentSelect.disabled = true;
        return;
    }

    for (let i = 0; i < componentsToShow; i++) {
        const optionX = document.createElement('option');
        optionX.value = i;
        optionX.textContent = `PC${i + 1}`;
        xAxisComponentSelect.appendChild(optionX);

        const optionY = document.createElement('option');
        optionY.value = i;
        optionY.textContent = `PC${i + 1}`;
        yAxisComponentSelect.appendChild(optionY);
    }

    // Set defaults: PC1 for X, PC2 for Y
    xAxisComponentSelect.value = 0;
    yAxisComponentSelect.value = componentsToShow > 1 ? 1 : 0; // If only 1 component, both X and Y are PC1
    
    // Only enable if PCA has been run and there are components to select
    if (pcaTransformedData && pcaTransformedData.length > 0 && componentsToShow > 0) {
        xAxisComponentSelect.disabled = false;
        yAxisComponentSelect.disabled = false;
    } else {
        xAxisComponentSelect.disabled = true;
        yAxisComponentSelect.disabled = true;
    }
}

function updateChart() {
    if (!pcaTransformedData || pcaTransformedData.length === 0 || !pcaTransformedData[0]) {
        if (chart) {
            chart.destroy();
            chart = null;
        }
        return;
    }

    const xAxisIndex = parseInt(xAxisComponentSelect.value);
    const yAxisIndex = parseInt(yAxisComponentSelect.value);

    if (isNaN(xAxisIndex) || isNaN(yAxisIndex) || xAxisIndex >= pcaTransformedData[0].length || yAxisIndex >= pcaTransformedData[0].length) {
        if (chart) {
            chart.destroy();
            chart = null;
        }
        // This scenario can happen if numComponents is reduced after initial PCA
        // and the selected indices are now out of bounds. The dropdowns should auto-update
        // but as a fallback, we clear the chart.
        return;
    }

    const chartData = pcaTransformedData.map(row => ({
        x: row[xAxisIndex],
        y: row[yAxisIndex]
    }));

    const datasets = [{
        label: 'PCA Transformed Data',
        data: chartData,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        pointRadius: 5,
        pointHoverRadius: 7
    }];

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: `PCA Scatter Plot: PC${xAxisIndex + 1} vs PC${yAxisIndex + 1}`
            },
            zoom: {
                zoom: {
                    wheel: {
                        enabled: true,
                    },
                    pinch: {
                        enabled: true
                    },
                    mode: 'xy',
                },
                pan: {
                    enabled: true,
                    mode: 'xy',
                },
                limits: {
                    y: { min: 'original', max: 'original' },
                    x: { min: 'original', max: 'original' }
                }
            }
        },
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                title: {
                    display: true,
                    text: `Principal Component ${xAxisIndex + 1}`
                }
            },
            y: {
                type: 'linear',
                position: 'left',
                title: {
                    display: true,
                    text: `Principal Component ${yAxisIndex + 1}`
                }
            }
        }
    };

    if (chart) {
        chart.data.datasets = datasets;
        chart.options.plugins.title.text = options
