(function() {
    // DOM Elements
    const fileInput = document.getElementById('fileInput');
    const filterInput = document.getElementById('filterInput');
    const tableContainer = document.getElementById('tableContainer');
    const messageDiv = document.getElementById('message');

    // Global Data State
    let originalData = []; // Stores the parsed data directly from the file
    let currentHeaders = []; // Stores the headers of the current data
    let sortColumn = null;
    let sortDirection = 'asc'; // 'asc' or 'desc'

    // --- Utility Functions ---

    /**
     * Displays a message to the user.
     * @param {string} msg - The message text.
     * @param {string} type - 'success', 'error', or default.
     */
    function showMessage(msg, type = '') {
        messageDiv.textContent = msg;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        }
    }

    function clearMessage() {
        messageDiv.style.display = 'none';
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    }

    /**
     * Simple CSV parser. Assumes comma delimiter and first row as header.
     * Does not handle quoted commas or complex CSV structures for conciseness.
     * @param {string} csvString
     * @returns {{headers: string[], data: object[]}}
     */
    function parseCSV(csvString) {
        const lines = csvString.trim().split('\n');
        if (lines.length === 0) {
            throw new Error('CSV file is empty.');
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length !== headers.length) {
                // Skip malformed rows or warn
                console.warn(`Skipping malformed CSV row ${i + 1}: ${lines[i]}`);
                continue;
            }
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index];
            });
            data.push(row);
        }
        return { headers, data };
    }

    /**
     * Parses a JSON string.
     * Assumes it's an array of objects.
     * @param {string} jsonString
     * @returns {{headers: string[], data: object[]}}
     */
    function parseJSON(jsonString) {
        const parsed = JSON.parse(jsonString);

        if (!Array.isArray(parsed) || parsed.length === 0) {
            throw new Error('JSON file must contain an array of objects.');
        }

        // Get headers from the keys of the first object
        const headers = Object.keys(parsed[0]);
        return { headers, data: parsed };
    }

    // --- Core Logic Functions ---

    /**
     * Handles file selection and initiates parsing.
     * @param {Event} event
     */
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        clearMessage();
        tableContainer.innerHTML = '<p>Loading data...</p>';
        resetTableState();

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const content = e.target.result;
                const fileName = file.name.toLowerCase();
                let parsedResult;

                if (fileName.endsWith('.csv')) {
                    parsedResult = parseCSV(content);
                } else if (fileName.endsWith('.json')) {
                    parsedResult = parseJSON(content);
                } else {
                    throw new Error('Unsupported file type. Please upload a CSV or JSON file.');
                }

                originalData = parsedResult.data;
                currentHeaders = parsedResult.headers;
                showMessage(`Successfully loaded ${originalData.length} rows.`, 'success');
                renderTable();
                filterInput.disabled = false;
            } catch (error) {
                showMessage(`Error processing file: ${error.message}`, 'error');
                tableContainer.innerHTML = '<p>Failed to load data.</p>';
                filterInput.disabled = true;
            }
        };
        reader.onerror = function() {
            showMessage('Error reading file.', 'error');
            tableContainer.innerHTML = '<p>Failed to load data.</p>';
            filterInput.disabled = true;
        };
        reader.readAsText(file);
    }

    /**
     * Resets sorting state and filter when a new file is loaded.
     */
    function resetTableState() {
        sortColumn = null;
        sortDirection = 'asc';
        filterInput.value = '';
    }

    /**
     * Filters the data based on the filter input value.
     * @param {Array<object>} dataToFilter
     * @returns {Array<object>}
     */
    function applyFilter(dataToFilter) {
        const searchTerm = filterInput.value.toLowerCase().trim();
        if (!searchTerm) {
            return dataToFilter;
        }
        return dataToFilter.filter(row =>
            Object.values(row).some(value =>
                String(value).toLowerCase().includes(searchTerm)
            )
        );
    }

    /**
     * Sorts the data based on the current sort column and direction.
     * @param {Array<object>} dataToSort
     * @returns {Array<object>}
     */
    function applySort(dataToSort) {
        if (!sortColumn || !currentHeaders.includes(sortColumn)) {
            return dataToSort; // No sorting applied or invalid column
        }

        // Create a shallow copy to sort, avoiding mutation of the original array
        const sortedData = [...dataToSort];

        sortedData.sort((a, b) => {
            let valA = a[sortColumn];
            let valB = b[sortColumn];

            // Attempt to convert to number for numerical sorting
            const numA = Number(valA);
            const numB = Number(valB);

            if (!isNaN(numA) && !isNaN(numB) && valA !== '' && valB !== '') {
                // Both are numbers (and not just empty strings converting to 0)
                return (numA - numB) * (sortDirection === 'asc' ? 1 : -1);
            } else {
                // Compare as strings (case-insensitive)
                valA = String(valA).toLowerCase();
                valB = String(valB).toLowerCase();
                if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            }
        });

        return sortedData;
    }

    /**
     * Renders the table with current headers, filtered, and sorted data.
     */
    function renderTable() {
        if (originalData.length === 0 || currentHeaders.length === 0) {
            tableContainer.innerHTML = '<p>No data to display. Upload a file.</p>';
            filterInput.disabled = true;
            return;
        }

        const filteredData = applyFilter(originalData);
        const finalData = applySort(filteredData);

        tableContainer.innerHTML = ''; // Clear previous table

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        const headerRow = document.createElement('tr');

        currentHeaders.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            th.setAttribute('data-column', headerText);
            th.addEventListener('click', () => sortTable(headerText));

            if (sortColumn === headerText) {
                th.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
            }
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        if (finalData.length === 0) {
            const noDataRow = document.createElement('tr');
            const noDataCell = document.createElement('td');
            noDataCell.colSpan = currentHeaders.length;
            noDataCell.textContent = 'No matching data found.';
            noDataCell.style.textAlign = 'center';
            noDataCell.style.fontStyle = 'italic';
            noDataRow.appendChild(noDataCell);
            tbody.appendChild(noDataRow);
        } else {
            finalData.forEach(rowData => {
                const tr = document.createElement('tr');
                currentHeaders.forEach(header => {
                    const td = document.createElement('td');
                    td.textContent = rowData[header] !== undefined ? rowData[header] : '';
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
        }

        table.appendChild(tbody);
        tableContainer.appendChild(table);
        filterInput.disabled = false; // Enable filter once data is present
    }

    /**
     * Initiates sorting when a column header is clicked.
     * @param {string} column - The column to sort by.
     */
    function sortTable(column) {
        if (sortColumn === column) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortColumn = column;
            sortDirection = 'asc';
        }
        renderTable();
    }

    // --- Initialization ---
    function init() {
        fileInput.addEventListener('change', handleFileSelect);
        // Debounce filter input for better performance on large datasets
        let filterTimeout;
        filterInput.addEventListener('input', () => {
            clearTimeout(filterTimeout);
            filterTimeout = setTimeout(renderTable, 300); // Rerender after 300ms of no input
        });
        filterInput.disabled = true; // Disable filter until data is loaded
        renderTable(); // Initial render for empty state
    }

    // Run initialization when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', init);
})();
