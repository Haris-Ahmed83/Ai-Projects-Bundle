document.addEventListener('DOMContentLoaded', () => {
    const dataInput = document.getElementById('dataInput');
    const minMaxBtn = document.getElementById('minMaxBtn');
    const zScoreBtn = document.getElementById('zScoreBtn');
    const originalDataDisplay = document.getElementById('originalDataDisplay');
    const normalizedDataDisplay = document.getElementById('normalizedDataDisplay');
    const originalChart = document.getElementById('originalChart');
    const normalizedChart = document.getElementById('normalizedChart');
    const normalizationType = document.getElementById('normalizationType');

    function parseInput(inputString) {
        return inputString.split(',')
                          .map(s => parseFloat(s.trim()))
                          .filter(n => !isNaN(n));
    }

    function calculateMinMax(data) {
        if (data.length === 0) return { min: 0, max: 0 };
        return {
            min: Math.min(...data),
            max: Math.max(...data)
        };
    }

    function calculateMean(data) {
        if (data.length === 0) return 0;
        return data.reduce((sum, val) => sum + val, 0) / data.length;
    }

    function calculateStdDev(data, mean) {
        if (data.length < 2) return 0; // Standard deviation needs at least 2 points for sample std dev
        const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (data.length - 1); // Sample std dev
        return Math.sqrt(variance);
    }

    function minMaxNormalize(data) {
        const { min, max } = calculateMinMax(data);
        if (max === min) return data.map(() => 0.5); // Avoid division by zero, return mid-point (0.5 for 0-1 range)
        return data.map(x => (x - min) / (max - min));
    }

    function zScoreNormalize(data) {
        const mean = calculateMean(data);
        const stdDev = calculateStdDev(data, mean);
        if (stdDev === 0) return data.map(() => 0); // Avoid division by zero, all values become 0
        return data.map(x => (x - mean) / stdDev);
    }

    function renderChart(data, targetElement, type = '') {
        targetElement.innerHTML = ''; // Clear previous bars

        if (data.length === 0) {
            targetElement.innerHTML = '<p style="text-align: center; color: #777;">No data to display.</p>';
            return;
        }

        const { min: dataMin, max: dataMax } = calculateMinMax(data);
        const range = dataMax - dataMin;
        const chartHeightPx = 100; // Matches CSS .chart height

        data.forEach(value => {
            const bar = document.createElement('div');
            bar.className = 'bar';

            let barHeight = 0;
            if (range === 0) {
                // All values are the same, display a fixed height bar
                barHeight = chartHeightPx * 0.5; // Half height
            } else {
                // Scale value within the data's min-max range to 0-100% of chart height
                barHeight = ((value - dataMin) / range) * chartHeightPx; 
            }

            bar.style.height = `${barHeight}px`;

            // Apply negative class for Z-score visualization of negative values
            if (type === 'z-score' && value < 0) {
                bar.classList.add('negative');
            }

            const valueSpan = document.createElement('span');
            valueSpan.textContent = value.toFixed(2); // Display value on top of bar
            bar.appendChild(valueSpan);

            targetElement.appendChild(bar);
        });
    }

    function updateVisualization(original, normalized, type) {
        originalDataDisplay.textContent = original.map(n => n.toFixed(2)).join(', ');
        normalizedDataDisplay.textContent = normalized.map(n => n.toFixed(2)).join(', ');
        normalizationType.textContent = type ? `Normalization Type: ${type}` : '';

        // Render charts, passing a type to distinguish Z-score for styling
        renderChart(original, originalChart, 'original');
        renderChart(normalized, normalizedChart, type === 'Z-score Normalization' ? 'z-score' : 'min-max');
    }

    // Initial load with example data
    dataInput.value = '10, 20, 30, 40, 50, 100, 5, 150';
    minMaxBtn.click(); // Trigger initial normalization
});
