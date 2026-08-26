document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements --- //
    const fileInput = document.getElementById('fileInput');
    const dataTable = document.getElementById('dataTable');
    const missingInfo = document.getElementById('missingInfo');
    const imputationStrategySelect = document.getElementById('imputationStrategy');
    const customValueInputGroup = document.querySelector('.custom-value-input');
    const customValueInput = document.getElementById('customValue');
    const applyImputationBtn = document.getElementById('applyImputationBtn');
    const chartContainer = document.getElementById('chartContainer');

    // --- Global Variables --- //
    let originalData = []; // Array of arrays: [ [header1, header2], [row1_val1, row1_val2], ... ]
    let headers = [];
    let imputedData = [];
    let missingCellsBeforeImputation = []; // Stores { row, col } of original missing cells

    // --- Helper Functions --- //

    /**
     * Detects delimiter (comma or tab) and parses CSV/TSV text into an array of arrays.
     * Handles potential quotes in CSV.
     * @param {string} text - The raw CSV/TSV string.
     * @returns {{headers: string[], data: string[][]}} An object containing headers and data.
     */
    function parseCSV(text) {
        // Determine delimiter: count commas vs tabs in the first few lines
        const lines = text.trim().split(/\r?\n/);
        if (lines.length === 0) return { headers: [], data: [] };

        const firstLine = lines[0];
        const commaCount = (firstLine.match(/,/g) || []).length;
        const tabCount = (firstLine.match(/\t/g) || []).length;
        const delimiter = tabCount > commaCount ? '\t' : ',';

        const parsedLines = lines.map(line => {
            // Simple split for TSV or if no quotes for CSV. For robust CSV, a regex or library is better.
            // For this project, we'll assume relatively clean CSV/TSV without complex quoted delimiters.
            if (delimiter === ',') {
                // Basic CSV parsing that handles quoted commas, but not quoted newlines.
                const regex = /(?:"([^"]*(?:""[^"]*)*)"|([^,]*))/g;
                let match;
                const row = [];
                while ((match = regex.exec(line)) !== null) {
                    // If it's a quoted group (match[1]), remove extra quotes and unescape double quotes
                    // Otherwise, take the unquoted group (match[2])
                    row.push(match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2]);
                }
                return row.filter(cell => cell !== undefined && cell !== ''); // Filter out empty matches from the regex if at end
            } else {
                return line.split(delimiter);
            }
        });

        const fileHeaders = parsedLines[0];
        const fileData = parsedLines.slice(1);

        // Trim whitespace from all cells and treat empty strings as missing
        const cleanedData = fileData.map(row =>
            row.map(cell => {
                const trimmedCell = cell ? cell.trim() : '';
                return trimmedCell === '' || trimmedCell.toLowerCase() === 'nan' || trimmedCell.toLowerCase() === 'null' ? '' : trimmedCell;
            })
        );

        return { headers: fileHeaders, data: cleanedData };
    }

    /**
     * Renders the data into the HTML table.
     * @param {string[][]} data - The data to display (array of rows, where each row is an array of cell values).
     * @param {string[]} currentHeaders - The column headers.
     * @param {boolean} highlightImputed - If true, highlight cells that were originally missing and are now filled.
     */
    function renderTable(data, currentHeaders, highlightImputed = false) {
        dataTable.innerHTML = ''; // Clear existing table content

        if (currentHeaders.length === 0) return;

        // Create table header
        const thead = dataTable.createTHead();
        const headerRow = thead.insertRow();
        currentHeaders.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        // Create table body
        const tbody = dataTable.createTBody();
        data.forEach((row, rowIndex) => {
            const tr = tbody.insertRow();
            row.forEach((cellValue, colIndex) => {
                const td = tr.insertCell();
                td.textContent = cellValue;

                const isOriginalMissing = missingCellsBeforeImputation.some(mc => mc.row === rowIndex && mc.col === colIndex);

                if (cellValue === '') {
                    td.classList.add('missing-cell');
                } else if (highlightImputed && isOriginalMissing) {
                    td.classList.add('imputed-cell');
                }
            });
        });
    }

    /**
     * Counts the total number of missing cells in the dataset.
     * @param {string[][]} data - The dataset to check.
     * @returns {number} The total count of missing cells.
     */
    function countMissingCells(data) {
        let count = 0;
        const missingCoords = [];
        data.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell === '') {
                    count++;
                    missingCoords.push({ row: rowIndex, col: colIndex });
                }
            });
        });
        return { count, missingCoords };
    }

    /**
     * Checks if a string can be parsed as a number.
     * @param {string} str - The string to check.
     * @returns {boolean} True if the string is numeric, false otherwise.
     */
    function isNumeric(str) {
        return !isNaN(parseFloat(str)) && isFinite(str);
    }

    /**
     * Calculates descriptive statistics (mean, median, mode) for a given array of numeric values.
     * @param {number[]} values - An array of numeric values.
     * @returns {{mean: number, median: number, mode: number|string[]}} An object with calculated stats.
     */
    function calculateStats(values) {
        const numericValues = values.filter(v => isNumeric(v)).map(Number).sort((a, b) => a - b);

        if (numericValues.length === 0) {
            return { mean: NaN, median: NaN, mode: NaN };
        }

        // Mean
        const mean = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;

        // Median
        const mid = Math.floor(numericValues.length / 2);
        const median = numericValues.length % 2 === 0
            ? (numericValues[mid - 1] + numericValues[mid]) / 2
            : numericValues[mid];

        // Mode
        const frequencyMap = {};
        numericValues.forEach(val => {
            frequencyMap[val] = (frequencyMap[val] || 0) + 1;
        });

        let maxFreq = 0;
        let modes = [];
        for (const key in frequencyMap) {
            if (frequencyMap[key] > maxFreq) {
                maxFreq = frequencyMap[key];
                modes = [Number(key)];
            } else if (frequencyMap[key] === maxFreq && maxFreq > 0) {
                modes.push(Number(key));
            }
        }

        return { mean, median, mode: modes.length === Object.keys(frequencyMap).length ? 'No unique mode' : modes.sort((a,b)=>a-b).join(', ') }; // Handle no unique mode case
    }

    /**
     * Calculates the mode for an array of values (can be mixed numeric/string).
     * @param {Array<string|number>} values - An array of values.
     * @returns {string|number|string[]} The mode(s) or 'No unique mode'.
     */
    function calculateModeGeneral(values) {
        const frequencyMap = {};
        values.forEach(val => {
            if (val !== '') {
                frequencyMap[val] = (frequencyMap[val] || 0) + 1;
            }
        });

        let maxFreq = 0;
        let modes = [];
        for (const key in frequencyMap) {
            if (frequencyMap[key] > maxFreq) {
                maxFreq = frequencyMap[key];
                modes = [key];
            } else if (frequencyMap[key] === maxFreq && maxFreq > 0) {
                modes.push(key);
            }
        }
        if (Object.keys(frequencyMap).length === 0) return ''; // No values to calculate mode from
        if (modes.length === Object.keys(frequencyMap).length) return 'No unique mode'; // All values have same frequency
        return modes.length === 1 ? modes[0] : modes.join(', ');
    }

    /**
     * Renders a bar chart showing missing values per column before and after imputation.
     */
    function renderVisualization() {
        chartContainer.innerHTML = ''; // Clear previous chart

        if (headers.length === 0) {
            chartContainer.textContent = 'Upload data to see missing value visualization.';
            return;
        }

        const legendDiv = document.createElement('div');
        legendDiv.classList.add('legend');
        legendDiv.innerHTML = `
            <div class="legend-item"><span class="legend-color original"></span> Original Missing</div>
            <div class="legend-item"><span class="legend-color imputed"></span> Imputed (0 missing after strategy)</div>
        `;
        chartContainer.appendChild(legendDiv);

        const chartArea = document.createElement('div');
        chartArea.classList.add('chart-area');

        const originalMissingCounts = {};
        const imputedMissingCounts = {};
        let maxMissingCount = 0;

        // Calculate missing counts for original data
        headers.forEach((_, colIndex) => {
            originalMissingCounts[colIndex] = 0;
            for (let i = 0; i < originalData.length; i++) {
                if (originalData[i][colIndex] === '') {
                    originalMissingCounts[colIndex]++;
                }
            }
            maxMissingCount = Math.max(maxMissingCount, originalMissingCounts[colIndex]);
        });

        // Calculate missing counts for imputed data
        headers.forEach((_, colIndex) => {
            imputedMissingCounts[colIndex] = 0;
            for (let i = 0; i < imputedData.length; i++) {
                if (imputedData[i][colIndex] === '') {
                    imputedMissingCounts[colIndex]++;
                }
            }
            maxMissingCount = Math.max(maxMissingCount, imputedMissingCounts[colIndex]);
        });

        // Render bars
        headers.forEach((header, colIndex) => {
            const colDiv = document.createElement('div');
            colDiv.classList.add('chart-column');

            const barGroup = document.createElement('div');
            barGroup.classList.add('chart-bar-group');

            const originalBar = document.createElement('div');
            originalBar.classList.add('bar');
            const originalHeight = maxMissingCount > 0 ? (originalMissingCounts[colIndex] / maxMissingCount) * 100 : 0;
            originalBar.style.height = `${originalHeight}%`;
            originalBar.title = `Original Missing: ${originalMissingCounts[colIndex]}`;
            barGroup.appendChild(originalBar);

            const imputedBar = document.createElement('div');
            imputedBar.classList.add('bar', 'imputed');
            const imputedHeight = maxMissingCount > 0 ? (imputedMissingCounts[colIndex] / maxMissingCount) * 100 : 0;
            imputedBar.style.height = `${imputedHeight}%`;
            imputedBar.title = `Imputed Missing: ${imputedMissingCounts[colIndex]}`;
            barGroup.appendChild(imputedBar);

            colDiv.appendChild(barGroup);

            const labelDiv = document.createElement('div');
            labelDiv.classList.add('column-name');
            labelDiv.textContent = header;
            colDiv.appendChild(labelDiv);

            chartArea.appendChild(colDiv);
        });

        chartContainer.appendChild(chartArea);
    }

    // --- Event Handlers --- //

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            missingInfo.textContent = 'No file selected.';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const { headers: parsedHeaders, data: parsedData } = parseCSV(e.target.result);
            headers = parsedHeaders;
            originalData = parsedData;
            imputedData = JSON.parse(JSON.stringify(originalData)); // Deep copy

            const { count, missingCoords } = countMissingCells(originalData);
            missingCellsBeforeImputation = missingCoords;

            missingInfo.textContent = `Dataset loaded. Total missing cells: ${count}.`;
            renderTable(originalData, headers);
            applyImputationBtn.disabled = false;
            renderVisualization(); // Initial visualization based on original data
        };
        reader.readAsText(file);
    });

    imputationStrategySelect.addEventListener('change', (event) => {
        if (event.target.value === 'custom') {
            customValueInputGroup.classList.remove('hidden');
        } else {
            customValueInputGroup.classList.add('hidden');
        }
    });

    applyImputationBtn.addEventListener('click', () => {
        if (originalData.length === 0) {
            alert('Please upload a dataset first.');
            return;
        }

        const strategy = imputationStrategySelect.value;
        const customValue = customValueInput.value;

        // Create a deep copy to work on, preserving originalData
        imputedData = JSON.parse(JSON.stringify(originalData));

        headers.forEach((header, colIndex) => {
            // Extract all non-missing values for the current column
            const columnValues = originalData.map(row => row[colIndex]);
            const nonMissingValues = columnValues.filter(val => val !== '');

            // Check if column is predominantly numeric for mean/median
            const numericNonMissing = nonMissingValues.filter(isNumeric).map(Number);
            const isColumnNumeric = numericNonMissing.length / nonMissingValues.length > 0.5; // Heuristic: >50% numeric

            let imputationValue = '';

            if (strategy === 'custom') {
                imputationValue = customValue;
            } else if (strategy === 'zero') {
                imputationValue = '0';
            } else if (isColumnNumeric) {
                const stats = calculateStats(numericNonMissing);
                if (strategy === 'mean') imputationValue = stats.mean.toFixed(2);
                if (strategy === 'median') imputationValue = stats.median.toFixed(2);
                if (strategy === 'mode') imputationValue = calculateModeGeneral(nonMissingValues);
            } else { // For non-numeric or if strategy is mode for mixed types
                imputationValue = calculateModeGeneral(nonMissingValues);
                // If mode is 'No unique mode' and it's a numeric strategy, fallback to a default or skip
                if (imputationValue === 'No unique mode' && (strategy === 'mean' || strategy === 'median')) {
                    imputationValue = ''; // Cannot impute mean/median for non-numeric/no unique mode
                    console.warn(`Column '${header}' is non-numeric or has no unique mode. Skipping mean/median imputation.`);
                } else if (imputationValue === 'No unique mode' && strategy === 'mode'){
                    imputationValue = ''; // Cannot impute mode if no unique mode
                }
            }

            // Apply imputation to missing cells in the current column
            for (let i = 0; i < imputedData.length; i++) {
                if (imputedData[i][colIndex] === '') {
                    imputedData[i][colIndex] = String(imputationValue); // Ensure it's a string
                }
            }
        });

        renderTable(imputedData, headers, true);
        const { count: imputedCount } = countMissingCells(imputedData);
        missingInfo.textContent = `Imputation applied. Missing cells after imputation: ${imputedCount}.`;
        renderVisualization();
    });

    // Initial state setup
    imputationStrategySelect.dispatchEvent(new Event('change')); // Trigger to show/hide custom value input
});
