document.addEventListener('DOMContentLoaded', () => {
    const csvFileInput = document.getElementById('csvFileInput');
    const dataTableContainer = document.getElementById('dataTableContainer');
    const xAxisSelect = document.getElementById('xAxisSelect');
    const yAxisSelect = document.getElementById('yAxisSelect');
    const chartTypeSelect = document.getElementById('chartTypeSelect');
    const dataChartCanvas = document.getElementById('dataChart');
    const chartMessage = document.getElementById('chartMessage');
    const aiInsightsContainer = document.getElementById('aiInsightsContainer');
    const ctx = dataChartCanvas.getContext('2d');

    let rawData = []; // Array of objects, each object is a row
    let headers = [];

    // --- CSV File Handling ---
    csvFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                parseCSV(e.target.result);
                renderDataTable();
                populateColumnSelectors();
                drawChart(); // Attempt to draw chart with default selections
                displayAIInsights();
            };
            reader.readAsText(file);
        }
    });

    function parseCSV(text) {
        const lines = text.trim().split('\n');
        if (lines.length === 0) return;

        headers = lines[0].split(',').map(h => h.trim());
        rawData = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length === headers.length) {
                let row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index];
                });
                rawData.push(row);
            }
        }
    }

    // --- Data Table Rendering ---
    function renderDataTable() {
        if (rawData.length === 0) {
            dataTableContainer.innerHTML = '<p>No data to display.</p>';
            return;
        }

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        // Create table header
        const headerRow = document.createElement('tr');
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create table body
        // Display first 100 rows for preview, or all if less than 100
        rawData.slice(0, Math.min(rawData.length, 100)).forEach(rowData => {
            const tr = document.createElement('tr');
            headers.forEach(header => {
                const td = document.createElement('td');
                td.textContent = rowData[header];
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        dataTableContainer.innerHTML = '';
        dataTableContainer.appendChild(table);
    }

    // --- Column Selector Population ---
    function populateColumnSelectors() {
        // Clear previous options
        xAxisSelect.innerHTML = '<option value="">Select X-Axis</option>';
        yAxisSelect.innerHTML = '<option value="">Select Y-Axis</option>';

        headers.forEach(header => {
            const optionX = document.createElement('option');
            optionX.value = header;
            optionX.textContent = header;
            xAxisSelect.appendChild(optionX);

            const optionY = document.createElement('option');
            optionY.value = header;
            optionY.textContent = header;
            yAxisSelect.appendChild(optionY);
        });
    }

    // --- Chart Drawing ---
    function drawChart() {
        ctx.clearRect(0, 0, dataChartCanvas.width, dataChartCanvas.height);
        chartMessage.style.display = 'block';

        if (rawData.length === 0) {
            chartMessage.textContent = 'Upload data to visualize.';
            return;
        }

        const xAxisColumn = xAxisSelect.value;
        const yAxisColumn = yAxisSelect.value;
        const chartType = chartTypeSelect.value;

        if (!xAxisColumn || !yAxisColumn) {
            chartMessage.textContent = 'Please select both X-Axis and Y-Axis columns.';
            return;
        }

        chartMessage.style.display = 'none';

        // Group data for the bar chart
        const groupedData = {};
        rawData.forEach(row => {
            const xValue = String(row[xAxisColumn]); // Ensure category is string
            const yValue = parseFloat(row[yAxisColumn]);
            if (!isNaN(yValue)) {
                if (!groupedData[xValue]) {
                    groupedData[xValue] = 0;
                }
                groupedData[xValue] += yValue; // Sum values for each category
            }
        });

        const categories = Object.keys(groupedData);
        const values = Object.values(groupedData);

        if (categories.length === 0 || values.every(val => val === 0)) {
            chartMessage.style.display = 'block';
            chartMessage.textContent = 'No valid numeric data for the selected Y-Axis or all values are zero.';
            return;
        }

        // Basic Bar Chart Drawing
        const canvasWidth = dataChartCanvas.width;
        const canvasHeight = dataChartCanvas.height;
        const padding = 50;
        const chartAreaWidth = canvasWidth - 2 * padding;
        const chartAreaHeight = canvasHeight - 2 * padding;

        const maxValue = Math.max(...values);
        const barSpacing = 15; // Space between bars
        const barWidth = (chartAreaWidth / categories.length) - barSpacing;

        if (barWidth < 5) { // Prevent bars from becoming too thin for many categories
             chartMessage.style.display = 'block';
             chartMessage.textContent = 'Too many categories to display effectively. Try fewer unique X-axis values.';
             return;
        }

        // Draw Y-axis
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvasHeight - padding);
        ctx.strokeStyle = '#333';
        ctx.stroke();

        // Draw X-axis
        ctx.beginPath();
        ctx.moveTo(padding, canvasHeight - padding);
        ctx.lineTo(canvasWidth - padding, canvasHeight - padding);
        ctx.strokeStyle = '#333';
        ctx.stroke();

        // Draw Y-axis labels and grid lines
        const numYLabels = 5;
        ctx.font = '10px Roboto';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'right';
        for (let i = 0; i <= numYLabels; i++) {
            const y = canvasHeight - padding - (i * chartAreaHeight / numYLabels);
            const value = (i * maxValue / numYLabels);
            ctx.fillText(value.toFixed(value < 1 ? 1 : 0), padding - 10, y + 3);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvasWidth - padding, y);
            ctx.strokeStyle = '#eee';
            ctx.stroke();
        }

        // Draw Bars
        categories.forEach((category, index) => {
            const value = values[index];
            const barHeight = (value / maxValue) * chartAreaHeight;
            const x = padding + (index * (barWidth + barSpacing));
            const y = canvasHeight - padding - barHeight;

            ctx.fillStyle = '#007bff'; // Blue color for bars
            ctx.fillRect(x, y, barWidth, barHeight);

            ctx.fillStyle = '#333';
            ctx.font = '10px Roboto';
            // Draw X-axis labels
            ctx.save();
            ctx.translate(x + barWidth / 2, canvasHeight - padding + 15);
            ctx.rotate(Math.PI / 4); // Rotate labels for better readability
            ctx.textAlign = 'left';
            ctx.fillText(category, 0, 0);
            ctx.restore();

            // Draw value on top of bar
            ctx.textAlign = 'center';
            if (barHeight > 15) { // Only show value if bar is tall enough
                ctx.fillText(value.toFixed(value < 1 ? 1 : 0), x + barWidth / 2, y - 5);
            }
        });

        // Labels for axes
        ctx.fillStyle = '#333';
        ctx.font = '14px Roboto';
        ctx.textAlign = 'center';
        ctx.fillText(xAxisColumn, canvasWidth / 2, canvasHeight - 10);
        ctx.save();
        ctx.translate(15, canvasHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(yAxisColumn + ' (Sum)', 0, 0);
        ctx.restore();
    }

    // --- AI Insights (Basic Analysis) ---
    function displayAIInsights() {
        aiInsightsContainer.innerHTML = '<p>Upload data and select columns for basic insights.</p>';
        if (rawData.length === 0) return;

        const yAxisColumn = yAxisSelect.value;
        if (!yAxisColumn) return;

        const numericValues = rawData.map(row => parseFloat(row[yAxisColumn])).filter(val => !isNaN(val));

        if (numericValues.length === 0) {
            aiInsightsContainer.innerHTML = `<p>No numeric data found in column '${yAxisColumn}' for insights.</p>`;
            return;
        }

        const sum = numericValues.reduce((acc, val) => acc + val, 0);
        const mean = sum / numericValues.length;
        const max = Math.max(...numericValues);
        const min = Math.min(...numericValues);

        // Calculate median
        const sortedValues = [...numericValues].sort((a, b) => a - b);
        const mid = Math.floor(sortedValues.length / 2);
        const median = sortedValues.length % 2 === 0 
            ? (sortedValues[mid - 1] + sortedValues[mid]) / 2 
            : sortedValues[mid];

        aiInsightsContainer.innerHTML = `
            <div><strong>Column:</strong> ${yAxisColumn}</div>
            <div><strong>Total Records:</strong> ${rawData.length}</div>
            <div><strong>Numeric Values Count:</strong> ${numericValues.length}</div>
            <div><strong>Sum:</strong> ${sum.toFixed(2)}</div>
            <div><strong>Mean:</strong> ${mean.toFixed(2)}</div>
            <div><strong>Median:</strong> ${median.toFixed(2)}</div>
            <div><strong>Max:</strong> ${max.toFixed(2)}</div>
            <div><strong>Min:</strong> ${min.toFixed(2)}</div>
        `;
    }

    // --- Event Listeners for Controls ---
    xAxisSelect.addEventListener('change', () => {
        drawChart();
        // Insights are primarily for the Y-axis value column, so no need to re-run on X-axis change
    });
    yAxisSelect.addEventListener('change', () => {
        drawChart();
        displayAIInsights();
    });
    chartTypeSelect.addEventListener('change', drawChart); // Only 'bar' supported for now

    // Initial state setup (clears placeholders if no data loaded)
    populateColumnSelectors();
    // No initial data, so dataTableContainer and aiInsightsContainer will show default messages.
    // drawChart() will show 'Upload data to visualize.'
});
