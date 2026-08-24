let uploadedData = null;
let dataHeaders = [];

const csvFile = document.getElementById('csvFile');
const targetVariableSelect = document.getElementById('targetVariable');
const visualizeBtn = document.getElementById('visualizeBtn');
const chartContainer = document.getElementById('chartContainer');

// --- Event Listeners ---
csvFile.addEventListener('change', handleFileUpload);
targetVariableSelect.addEventListener('change', () => {
    visualizeBtn.disabled = targetVariableSelect.value === '';
});
visualizeBtn.addEventListener('click', visualizeImportance);

// --- CSV Parsing Function ---
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) return { headers: [], data: [] };

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length === headers.length) { // Ensure row has correct number of columns
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index];
            });
            data.push(row);
        }
    }
    return { headers, data };
}

// --- File Upload Handler ---
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) {
        chartContainer.innerHTML = '<p>Upload a CSV file and select a target variable to see feature importances.</p>';
        targetVariableSelect.innerHTML = '<option value="">Upload data first</option>';
        targetVariableSelect.disabled = true;
        visualizeBtn.disabled = true;
        uploadedData = null;
        dataHeaders = [];
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const csvText = e.target.result;
        const parsed = parseCSV(csvText);
        uploadedData = parsed.data;
        dataHeaders = parsed.headers;

        populateTargetVariableSelect(dataHeaders);
        targetVariableSelect.disabled = false;
        visualizeBtn.disabled = true; // Disable until a target is selected
        chartContainer.innerHTML = '<p>Select a target variable and click "Visualize Importance".</p>';
    };
    reader.readAsText(file);
}

// --- Populate Target Variable Dropdown ---
function populateTargetVariableSelect(headers) {
    targetVariableSelect.innerHTML = '<option value="">-- Select Target --</option>';
    headers.forEach(header => {
        const option = document.createElement('option');
        option.value = header;
        option.textContent = header;
        targetVariableSelect.appendChild(option);
    });
}

// --- Simulate Feature Importance (Placeholder) ---
function calculateFeatureImportance(data, headers, targetVariable) {
    const importances = [];
    const minImportance = 10; // Minimum importance score for visualization
    const maxImportance = 100; // Maximum importance score

    headers.forEach(header => {
        if (header !== targetVariable) {
            // Simulate importance: A simple random value for demonstration.
            // In a real scenario, this would involve ML models (e.g., Random Forest, XGBoost)
            // or statistical methods (e.g., correlation, ANOVA, Chi-squared) applied server-side
            // or via a WASM module for client-side ML.
            const importance = Math.random() * (maxImportance - minImportance) + minImportance;
            importances.push({ feature: header, importance: importance });
        }
    });

    // Sort by importance in descending order
    importances.sort((a, b) => b.importance - a.importance);
    return importances;
}

// --- Visualization Logic ---
function visualizeImportance() {
    const selectedTarget = targetVariableSelect.value;

    if (!uploadedData || uploadedData.length === 0) {
        alert('Please upload a dataset first.');
        return;
    }
    if (!selectedTarget) {
        alert('Please select a target variable.');
        return;
    }

    // Clear previous chart or message
    chartContainer.innerHTML = '';

    const featureImportances = calculateFeatureImportance(uploadedData, dataHeaders, selectedTarget);

    if (featureImportances.length === 0) {
        chartContainer.innerHTML = `<p>No features found for importance calculation (only target variable remaining or empty data).</p>`;
        return;
    }

    drawBarChart(featureImportances);
}

// --- Draw Bar Chart (SVG) ---
function drawBarChart(featureImportances) {
    // Dynamic dimensions based on container width and number of features
    const containerWidth = chartContainer.clientWidth;
    // Adjust height based on number of bars, ensuring a minimum height
    const barSpacing = 35; // Height per bar including padding
    const minChartHeight = 300;
    const calculatedHeight = featureImportances.length * barSpacing + 80; // Additional space for margins/labels

    const margin = { top: 20, right: 30, bottom: 40, left: 150 }; // Increased left margin for feature labels
    const width = containerWidth - margin.left - margin.right;
    const height = Math.max(minChartHeight, calculatedHeight) - margin.top - margin.bottom;

    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', containerWidth);
    svg.setAttribute('height', Math.max(minChartHeight, calculatedHeight));
    svg.setAttribute('class', 'chart-svg');

    // Create a group element for chart contents, translated by margins
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
    svg.appendChild(g);

    // Scales
    const importanceMax = Math.max(...featureImportances.map(d => d.importance));
    // Simple linear scale for importance (x-axis)
    const xScale = (value) => (value / importanceMax) * width;
    
    const innerBarHeight = barSpacing * 0.7; // 70% of barSpacing for the actual bar
    const barYOffset = (barSpacing - innerBarHeight) / 2; // Vertical offset for centering bar

    // Tooltip element (appended to body to avoid clipping issues)
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);

    // Draw bars, labels, and add interactivity
    featureImportances.forEach((d, i) => {
        // Bar element
        const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bar.setAttribute('class', 'bar');
        bar.setAttribute('x', 0);
        bar.setAttribute('y', i * barSpacing + barYOffset);
        bar.setAttribute('width', xScale(d.importance));
        bar.setAttribute('height', innerBarHeight);
        g.appendChild(bar);

        // Feature label (on the left of the chart area)
        const textLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textLabel.setAttribute('class', 'label-text');
        textLabel.setAttribute('x', -5); // Position to the left of the y-axis
        textLabel.setAttribute('y', i * barSpacing + barSpacing / 2 + 5); // Center vertically
        textLabel.setAttribute('text-anchor', 'end'); // Align text to the end (right-justified)
        textLabel.textContent = d.feature;
        g.appendChild(textLabel);

        // Importance value label (inside or next to the bar)
        const importanceLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        importanceLabel.setAttribute('class', 'axis-label'); 
        importanceLabel.setAttribute('x', xScale(d.importance) + 5); // Position to the right of the bar
        importanceLabel.setAttribute('y', i * barSpacing + barSpacing / 2 + 5);
        importanceLabel.textContent = d.importance.toFixed(1);
        g.appendChild(importanceLabel);

        // Tooltip events for each bar
        bar.addEventListener('mouseover', (event) => {
            tooltip.style.opacity = 1;
            tooltip.innerHTML = `<strong>${d.feature}</strong>: ${d.importance.toFixed(2)}`;
            tooltip.style.left = `${event.pageX + 10}px`;
            tooltip.style.top = `${event.pageY - 20}px`;
        });
        bar.addEventListener('mousemove', (event) => {
            tooltip.style.left = `${event.pageX + 10}px`;
            tooltip.style.top = `${event.pageY - 20}px`;
        });
        bar.addEventListener('mouseout', () => {
            tooltip.style.opacity = 0;
        });
    });

    // Add X-axis line
    const xAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxisLine.setAttribute('x1', 0);
    xAxisLine.setAttribute('y1', height);
    xAxisLine.setAttribute('x2', width);
    xAxisLine.setAttribute('y2', height);
    xAxisLine.setAttribute('stroke', '#ccc');
    g.appendChild(xAxisLine);

    // Add X-axis label
    const xAxisText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xAxisText.setAttribute('class', 'axis-label');
    xAxisText.setAttribute('x', width / 2);
    xAxisText.setAttribute('y', height + margin.bottom / 2 + 10);
    xAxisText.setAttribute('text-anchor', 'middle');
    xAxisText.textContent = 'Importance Score';
    g.appendChild(xAxisText);

    chartContainer.appendChild(svg);
}
