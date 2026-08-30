document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements --- //
    const csvFileInput = document.getElementById('csvFile');
    const csvDataTextarea = document.getElementById('csvData');
    const loadSampleBtn = document.getElementById('loadSampleBtn');
    const visualizeBtn = document.getElementById('visualizeBtn');
    const normalizationTypeRadios = document.querySelectorAll('input[name="normalizationType"]');
    const minMaxOptionsDiv = document.getElementById('minMaxOptions');
    const zScoreOptionsDiv = document.getElementById('zScoreOptions');
    const minRangeInput = document.getElementById('minRange');
    const maxRangeInput = document.getElementById('maxRange');
    const originalDataTableDiv = document.getElementById('originalDataTable');
    const normalizedDataTableDiv = document.getElementById('normalizedDataTable');
    const featureSelect = document.getElementById('featureSelect');
    const visualizationArea = document.getElementById('visualizationArea');
    const errorMessageDiv = document.getElementById('errorMessage');

    // --- Global Data Storage --- //
    let originalHeaders = [];
    let originalData = []; // Array of arrays, numerical values only
    let normalizedData = [];

    // --- Helper Functions --- //
    function showMessage(message, isError = true) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.classList.remove('hidden');
        if (isError) {
            errorMessageDiv.style.backgroundColor = '#fce4e4';
            errorMessageDiv.style.color = '#d32f2f';
        } else {
            errorMessageDiv.style.backgroundColor = '#e6f7e6';
            errorMessageDiv.style.color = '#388e3c';
        }
    }

    function hideMessage() {
        errorMessageDiv.classList.add('hidden');
    }

    function parseCSV(csvString) {
        hideMessage();
        const lines = csvString.trim().split('\n');
        if (lines.length < 2) {
            showMessage('CSV must contain at least a header and one row of data.');
            return null;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];
        const numericColumns = []; // Store indices of numeric columns

        // First pass: determine numeric columns and parse data
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length !== headers.length) {
                showMessage(`Row ${i + 1} has ${values.length} columns, but header has ${headers.length}. Data might be malformed.`);
                return null;
            }
            data.push(values);
        }

        if (data.length === 0) {
            showMessage('No data rows found after header.');
            return null;
        }

        // Identify numeric columns based on the first data row
        data[0].forEach((val, colIndex) => {
            if (!isNaN(parseFloat(val)) && isFinite(val)) {
                numericColumns.push(colIndex);
            }
        });

        if (numericColumns.length === 0) {
            showMessage('No numeric columns found in the dataset for normalization.');
            return null;
        }

        // Second pass: convert numeric columns to numbers, keep headers for numeric columns only
        const processedHeaders = numericColumns.map(idx => headers[idx]);
        const processedData = data.map(row => numericColumns.map(idx => parseFloat(row[idx])));

        return { headers: processedHeaders, data: processedData };
    }

    function renderTable(containerDiv, headers, data) {
        containerDiv.innerHTML = ''; // Clear previous table
        if (!data || data.length === 0) {
            containerDiv.innerHTML = '<p>No data to display.</p>';
            return;
        }

        const table = document.createElement('table');
        const thead = table.createTHead();
        const tbody = table.createTBody();

        // Render header
        const headerRow = thead.insertRow();
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        // Render data rows
        data.forEach(rowData => {
            const tr = tbody.insertRow();
            rowData.forEach(value => {
                const td = tr.insertCell();
                td.textContent = typeof value === 'number' ? value.toFixed(4) : value;
            });
        });

        containerDiv.appendChild(table);
    }

    function calculateMinMax(data, colIndex) {
        if (!data || data.length === 0) return { min: 0, max: 0 };
        let min = data[0][colIndex];
        let max = data[0][colIndex];
        for (let i = 1; i < data.length; i++) {
            const value = data[i][colIndex];
            if (value < min) min = value;
            if (value > max) max = value;
        }
        return { min, max };
    }

    function calculateMean(data, colIndex) {
        if (!data || data.length === 0) return 0;
        const sum = data.reduce((acc, row) => acc + row[colIndex], 0);
        return sum / data.length;
    }

    function calculateStdDev(data, colIndex, mean) {
        if (!data || data.length < 2) return 0; // Need at least 2 points for std dev
        const sumOfSquares = data.reduce((acc, row) => acc + Math.pow(row[colIndex] - mean, 2), 0);
        return Math.sqrt(sumOfSquares / (data.length - 1)); // Sample standard deviation
    }

    function minMaxScaling(data, newMin = 0, newMax = 1) {
        if (!data || data.length === 0) return [];
        const scaledData = data.map(row => [...row]); // Deep copy

        for (let colIndex = 0; colIndex < data[0].length; colIndex++) {
            const { min, max } = calculateMinMax(data, colIndex);
            const oldRange = max - min;
            const newRange = newMax - newMin;

            if (oldRange === 0) {
                // All values are the same, scale to midpoint of new range or newMin
                for (let i = 0; i < data.length; i++) {
                    scaledData[i][colIndex] = newMin + newRange / 2; // Or just newMin
                }
            } else {
                for (let i = 0; i < data.length; i++) {
                    scaledData[i][colIndex] = ((data[i][colIndex] - min) / oldRange) * newRange + newMin;
                }
            }
        }
        return scaledData;
    }

    function zScoreStandardization(data) {
        if (!data || data.length === 0) return [];
        const standardizedData = data.map(row => [...row]); // Deep copy

        for (let colIndex = 0; colIndex < data[0].length; colIndex++) {
            const mean = calculateMean(data, colIndex);
            const stdDev = calculateStdDev(data, colIndex, mean);

            if (stdDev === 0) {
                // All values are the same, set to 0 (mean of normalized data)
                for (let i = 0; i < data.length; i++) {
                    standardizedData[i][colIndex] = 0;
                }
            } else {
                for (let i = 0; i < data.length; i++) {
                    standardizedData[i][colIndex] = (data[i][colIndex] - mean) / stdDev;
                }
            }
        }
        return standardizedData;
    }

    function updateFeatureSelect(headers) {
        featureSelect.innerHTML = '';
        if (!headers || headers.length === 0) {
            featureSelect.innerHTML = '<option value="">No features</option>';
            featureSelect.disabled = true;
            return;
        }
        headers.forEach((header, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = header;
            featureSelect.appendChild(option);
        });
        featureSelect.disabled = false;
    }

    function renderVisualization(featureIndex) {
        visualizationArea.innerHTML = '';
        if (originalData.length === 0 || normalizedData.length === 0 || featureIndex === undefined || featureIndex === null || originalHeaders.length === 0) {
            visualizationArea.innerHTML = '<p>No data or feature selected for visualization.</p>';
            return;
        }

        const featureName = originalHeaders[featureIndex];
        const originalFeatureValues = originalData.map(row => row[featureIndex]);
        const normalizedFeatureValues = normalizedData.map(row => row[featureIndex]);

        // Find overall max value for scaling bar heights consistently across original and normalized
        const allValues = [...originalFeatureValues, ...normalizedFeatureValues];
        const maxOverall = Math.max(...allValues.map(Math.abs)); // Use absolute for values that might be negative (z-score)

        if (maxOverall === 0) {
            visualizationArea.innerHTML = `<p>All values for feature '${featureName}' are zero, no variation to visualize.</p>`;
            return;
        }

        // Add legend
        const legendDiv = document.createElement('div');
        legendDiv.className = 'bar-legend';
        legendDiv.innerHTML = `
            <div class="legend-item"><span class="legend-color original"></span> Original</div>
            <div class="legend-item"><span class="legend-color normalized"></span> Normalized</div>
        `;
        visualizationArea.appendChild(legendDiv);

        originalFeatureValues.forEach((originalVal, i) => {
            const normalizedVal = normalizedFeatureValues[i];

            const barChartContainer = document.createElement('div');
            barChartContainer.className = 'bar-chart-container';

            const label = document.createElement('div');
            label.className = 'bar-chart-label';
            label.textContent = `Row ${i + 1}`;
            barChartContainer.appendChild(label);

            const barsWrapper = document.createElement('div');
            barsWrapper.className = 'bars-wrapper';

            // Original Bar
            const originalBar = document.createElement('div');
            originalBar.className = 'bar original';
            originalBar.style.height = `${(Math.abs(originalVal) / maxOverall) * 100}%`;
            originalBar.innerHTML = `<span class="bar-value">${originalVal.toFixed(2)}</span>`;
            barsWrapper.appendChild(originalBar);

            // Normalized Bar
            const normalizedBar = document.createElement('div');
            normalizedBar.className = 'bar normalized';
            normalizedBar.style.height = `${(Math.abs(normalizedVal) / maxOverall) * 100}%`;
            normalizedBar.innerHTML = `<span class="bar-value">${normalizedVal.toFixed(2)}</span>`;
            barsWrapper.appendChild(normalizedBar);

            barChartContainer.appendChild(barsWrapper);
            visualizationArea.appendChild(barChartContainer);
        });
    }

    // --- Main Logic --- //
    async function loadDataAndVisualize() {
        hideMessage();
        let csvString = '';

        // Prioritize file input
        if (csvFileInput.files.length > 0) {
            try {
                csvString = await csvFileInput.files[0].text();
            } catch (error) {
                showMessage('Error reading file: ' + error.message);
                return;
            }
        } else if (csvDataTextarea.value.trim() !== '') {
            csvString = csvDataTextarea.value;
        } else {
            showMessage('Please upload a CSV file or paste data.');
            return;
        }

        const parsed = parseCSV(csvString);
        if (!parsed) {
            originalHeaders = [];
            originalData = [];
            normalizedData = [];
            renderTable(originalDataTableDiv, [], []);
            renderTable(normalizedDataTableDiv, [], []);
            updateFeatureSelect([]);
            renderVisualization(null);
            return;
        }

        originalHeaders = parsed.headers;
        originalData = parsed.data;

        if (originalData.length === 0) {
            showMessage('No valid numeric data found to process.');
            originalHeaders = [];
            renderTable(originalDataTableDiv, [], []);
            renderTable(normalizedDataTableDiv, [], []);
            updateFeatureSelect([]);
            renderVisualization(null);
            return;
        }

        // Render original data table
        renderTable(originalDataTableDiv, originalHeaders, originalData);

        // Perform normalization
        const normalizationType = document.querySelector('input[name="normalizationType"]:checked').value;
        if (normalizationType === 'minMax') {
            const newMin = parseFloat(minRangeInput.value);
            const newMax = parseFloat(maxRangeInput.value);
            if (isNaN(newMin) || isNaN(newMax) || newMin >= newMax) {
                showMessage('Invalid Min-Max range. Ensure New
