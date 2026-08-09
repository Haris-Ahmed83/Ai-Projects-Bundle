document.addEventListener('DOMContentLoaded', () => {
    const dataInput = document.getElementById('dataInput');
    const labelsInput = document.getElementById('labelsInput');
    const barColorInput = document.getElementById('barColor');
    const chartTitleInput = document.getElementById('chartTitle');
    const generateChartBtn = document.getElementById('generateChartBtn');
    const chartContainer = document.getElementById('chartContainer');

    // Function to generate the chart
    function generateChart() {
        // Clear previous chart content
        chartContainer.innerHTML = '';

        const chartTitleText = chartTitleInput.value.trim();
        const rawData = dataInput.value.trim();
        const rawLabels = labelsInput.value.trim();
        const barColor = barColorInput.value;

        // --- Data Parsing and Validation ---
        const data = rawData.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
        const labels = rawLabels.split(',').map(s => s.trim()).filter(s => s !== '');

        if (data.length === 0) {
            chartContainer.innerHTML = '<p class="placeholder">Please enter some numerical data.</p>';
            return;
        }

        if (data.length !== labels.length) {
            chartContainer.innerHTML = '<p class="placeholder error">Error: Number of data points and labels must match.</p>';
            return;
        }

        // --- Create Chart Title ---
        if (chartTitleText) {
            const titleElement = document.createElement('h2');
            titleElement.className = 'chart-title';
            titleElement.textContent = chartTitleText;
            chartContainer.appendChild(titleElement);
        }

        // --- Create Bar Chart Container ---
        const barChartDiv = document.createElement('div');
        barChartDiv.className = 'bar-chart';
        chartContainer.appendChild(barChartDiv);

        // --- Determine Max Value for Scaling ---
        // Ensure maxValue is at least 1 to avoid division by zero if all values are 0
        const maxValue = Math.max(...data, 1);
        const chartHeight = 250; // Max height for bars in pixels

        // --- Create and Append Bars ---
        data.forEach((value, index) => {
            const barWrapper = document.createElement('div');
            barWrapper.className = 'bar-wrapper';

            const bar = document.createElement('div');
            bar.className = 'bar';
            
            // Calculate height, ensuring non-negative height for negative values (if any)
            // For simplicity in a basic bar chart, we'll treat negative values as 0 height
            const effectiveValue = Math.max(0, value);
            const barHeight = (effectiveValue / maxValue) * chartHeight;
            bar.style.height = `${barHeight}px`;
            bar.style.backgroundColor = barColor;
            bar.setAttribute('title', `Value: ${value}`); // Tooltip always shows actual value

            const barValue = document.createElement('span');
            barValue.className = 'bar-value';
            barValue.textContent = value;

            const barLabel = document.createElement('span');
            barLabel.className = 'bar-label';
            barLabel.textContent = labels[index];

            barWrapper.appendChild(barValue); // Value above bar
            barWrapper.appendChild(bar);
            barWrapper.appendChild(barLabel);

            barChartDiv.appendChild(barWrapper);
        });
    }

    // Event Listener for the button
    generateChartBtn.addEventListener('click', generateChart);

    // Initial chart generation on page load with default values
    generateChart();
});
