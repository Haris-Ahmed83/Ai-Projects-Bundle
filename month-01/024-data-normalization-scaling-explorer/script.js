document.addEventListener('DOMContentLoaded', () => {
    const dataInput = document.getElementById('dataInput');
    const generateRandomBtn = document.getElementById('generateRandomData');
    const processDataBtn = document.getElementById('processData');

    const originalChartCanvas = document.getElementById('originalChart');
    const minMaxChartCanvas = document.getElementById('minMaxChart');
    const zScoreChartCanvas = document.getElementById('zScoreChart');

    const CHART_BAR_COLOR = '#3498db';
    const CHART_TEXT_COLOR = '#333';
    const CHART_BORDER_COLOR = '#ccc';

    // --- Helper Functions for Data Transformation ---

    function parseInputData(inputString) {
        const numbers = inputString.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
        if (numbers.length < 2) {
            alert('Please enter at least two valid numbers separated by commas.');
            return [];
        }
        return numbers;
    }

    function calculateMean(data) {
        if (data.length === 0) return 0;
        const sum = data.reduce((acc, val) => acc + val, 0);
        return sum / data.length;
    }

    function calculateStdDev(data, mean) {
        if (data.length < 2) return 0; // Standard deviation requires at least two data points
        const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (data.length - 1);
        return Math.sqrt(variance);
    }

    function minMaxScale(data) {
        if (data.length === 0) return [];
        const minVal = Math.min(...data);
        const maxVal = Math.max(...data);

        if (minVal === maxVal) return data.map(() => 0.5); // Avoid division by zero, scale to 0.5 if all values are identical

        return data.map(val => (val - minVal) / (maxVal - minVal));
    }

    function zScoreNormalize(data) {
        if (data.length === 0) return [];
        const mean = calculateMean(data);
        const stdDev = calculateStdDev(data, mean);

        if (stdDev === 0) return data.map(() => 0); // Avoid division by zero, normalize to 0 if stdDev is 0

        return data.map(val => (val - mean) / stdDev);
    }

    function generateRandomData(count = 20, min = 0, max = 100) {
        const data = [];
        for (let i = 0; i < count; i++) {
            data.push(Math.round(Math.random() * (max - min) + min));
        }
        return data.join(', ');
    }

    // --- Chart Drawing Function ---

    function drawHistogram(canvas, data, title, numBins = 10) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);
        ctx.font = `12px ${CHART_TEXT_COLOR}`;
        ctx.fillStyle = CHART_TEXT_COLOR;

        if (data.length === 0) {
            ctx.fillText('No data to display', width / 2 - 50, height / 2);
            return;
        }

        const minVal = Math.min(...data);
        const maxVal = Math.max(...data);

        // Handle case where all values are identical
        if (minVal === maxVal) {
            ctx.fillText(`All values are ${minVal}`, width / 2 - 60, height / 2 - 20);
            ctx.fillText('Distribution is a single point.', width / 2 - 80, height / 2);
            return;
        }

        const range = maxVal - minVal;
        const binWidth = range / numBins;

        const bins = Array(numBins).fill(0);
        for (const val of data) {
            let binIndex = Math.floor((val - minVal) / binWidth);
            if (binIndex >= numBins) binIndex = numBins - 1; // Ensure max value goes into the last bin
            bins[binIndex]++;
        }

        const maxFrequency = Math.max(...bins);

        const padding = 30; // Padding for axes and labels
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;

        // Draw title
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(title, width / 2, padding / 2 + 5);

        // Draw y-axis label (frequency)
        ctx.save();
        ctx.translate(padding / 2, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.font = '12px Arial';
        ctx.fillText('Frequency', 0, 0);
        ctx.restore();

        // Draw x-axis label (value range)
        ctx.textAlign = 'center';
        ctx.fillText('Value Range', width / 2, height - padding / 2 + 10);

        // Draw axes
        ctx.beginPath();
        ctx.strokeStyle = CHART_BORDER_COLOR;
        // Y-axis
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        // X-axis
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Draw histogram bars
        const barWidth = chartWidth / numBins;
        ctx.fillStyle = CHART_BAR_COLOR;
        for (let i = 0; i < numBins; i++) {
            const barHeight = (bins[i] / maxFrequency) * chartHeight;
            const x = padding + i * barWidth;
            const y = height - padding - barHeight;
            ctx.fillRect(x, y, barWidth - 1, barHeight); // -1 for a small gap between bars
        }

        // Draw x-axis ticks and labels
        ctx.fillStyle = CHART_TEXT_COLOR;
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        const numTicks = 5;
        for (let i = 0; i <= numTicks; i++) {
            const tickVal = minVal + (range / numTicks) * i;
            const x = padding + (chartWidth / numTicks) * i;
            ctx.fillText(tickVal.toFixed(2), x, height - padding + 15);
            ctx.beginPath();
            ctx.moveTo(x, height - padding);
            ctx.lineTo(x, height - padding + 5);
            ctx.stroke();
        }

        // Draw y-axis ticks and labels
        ctx.textAlign = 'right';
        for (let i = 0; i <= numTicks; i++) {
            const tickVal = Math.round((maxFrequency / numTicks) * i);
            const y = height - padding - (chartHeight / numTicks) * i;
            ctx.fillText(tickVal, padding - 5, y + 4); // +4 to center text vertically
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding - 5, y);
            ctx.stroke();
        }
    }

    // --- Main Application Logic ---

    function updateVisualizations() {
        const inputString = dataInput.value;
        const originalData = parseInputData(inputString);

        let minMaxData = [];
        let zScoreData = [];

        if (originalData.length > 0) {
            minMaxData = minMaxScale(originalData);
            zScoreData = zScoreNormalize(originalData);
        }

        drawHistogram(originalChartCanvas, originalData, 'Original Data');
        drawHistogram(minMaxChartCanvas, minMaxData, 'Min-Max Scaled (0-1)');
        drawHistogram(zScoreChartCanvas, zScoreData, 'Z-score Normalized (μ=0, σ=1)');
    }

    // --- Event Listeners ---

    generateRandomBtn.addEventListener('click', () => {
        dataInput.value = generateRandomData();
        updateVisualizations();
    });

    processDataBtn.addEventListener('click', updateVisualizations);

    // Optional: Auto-update on input change
    dataInput.addEventListener('input', () => {
        // Debounce or only update on blur for large inputs
        // For this small project, direct update is fine.
        updateVisualizations();
    });

    // Initial load with some default data
    dataInput.value = generateRandomData(25, 10, 200);
    updateVisualizations();
});
