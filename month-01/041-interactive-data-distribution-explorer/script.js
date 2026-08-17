document.addEventListener('DOMContentLoaded', () => {
    const distributionSelect = document.getElementById('distribution-select');
    const normalParams = document.getElementById('normal-params');
    const uniformParams = document.getElementById('uniform-params');
    const exponentialParams = document.getElementById('exponential-params');

    const normalMeanInput = document.getElementById('normal-mean');
    const normalStdDevInput = document.getElementById('normal-stddev');
    const uniformMinInput = document.getElementById('uniform-min');
    const uniformMaxInput = document.getElementById('uniform-max');
    const exponentialLambdaInput = document.getElementById('exponential-lambda');
    const sampleCountInput = document.getElementById('sample-count');
    const generateButton = document.getElementById('generate-button');

    const canvas = document.getElementById('distribution-canvas');
    const ctx = canvas.getContext('2d');

    let currentSampleData = [];

    // --- Distribution Functions ---

    // Box-Muller transform for generating standard normal (mean 0, std dev 1)
    function normalRandom() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    function generateNormalSamples(mean, stdDev, count) {
        const samples = [];
        for (let i = 0; i < count; i++) {
            samples.push(normalRandom() * stdDev + mean);
        }
        return samples;
    }

    function generateUniformSamples(min, max, count) {
        const samples = [];
        for (let i = 0; i < count; i++) {
            samples.push(min + Math.random() * (max - min));
        }
        return samples;
    }

    function generateExponentialSamples(lambda, count) {
        const samples = [];
        // The inverse CDF of the exponential distribution is F^-1(p; λ) = -ln(1 - p) / λ
        for (let i = 0; i < count; i++) {
            samples.push(-Math.log(1 - Math.random()) / lambda);
        }
        return samples;
    }

    // --- Visualization Function ---
    function drawHistogram(data, bins = 50) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (data.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No data to display. Generate samples!', canvas.width / 2, canvas.height / 2);
            return;
        }

        const minVal = Math.min(...data);
        const maxVal = Math.max(...data);

        // Handle edge case where all values are the same
        if (minVal === maxVal) {
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`All samples are ${minVal.toFixed(2)}`, canvas.width / 2, canvas.height / 2 - 20);
            ctx.fillText('Cannot create a histogram for a single value.', canvas.width / 2, canvas.height / 2 + 10);
            return;
        }

        const range = maxVal - minVal;
        const binWidth = range / bins;

        const frequencies = new Array(bins).fill(0);
        for (const value of data) {
            let binIndex = Math.floor((value - minVal) / binWidth);
            // Ensure the max value falls into the last bin, not an out-of-bounds bin
            if (binIndex >= bins) {
                binIndex = bins - 1;
            }
            frequencies[binIndex]++;
        }

        const maxFrequency = Math.max(...frequencies);

        const padding = 30; // Padding for axes and labels
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;

        // Draw Axes
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding); // Y-axis top
        ctx.lineTo(padding, padding + chartHeight); // Y-axis bottom
        ctx.lineTo(padding + chartWidth, padding + chartHeight); // X-axis right
        ctx.stroke();

        // Draw Bars
        ctx.fillStyle = '#3498db'; // Bar color
        const barCanvasWidth = chartWidth / bins;

        for (let i = 0; i < bins; i++) {
            const barHeight = (frequencies[i] / maxFrequency) * chartHeight;
            const x = padding + i * barCanvasWidth;
            const y = padding + chartHeight - barHeight;
            ctx.fillRect(x, y, barCanvasWidth - 1, barHeight); // -1 for a small gap between bars
        }

        // Draw Labels (simplified)
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';

        // X-axis labels
        ctx.fillText(minVal.toFixed(2), padding, canvas.height - padding / 2);
        ctx.fillText(maxVal.toFixed(2), padding + chartWidth, canvas.height - padding / 2);

        // Y-axis label (max frequency)
        ctx.textAlign = 'right';
        ctx.fillText(maxFrequency.toString(), padding - 5, padding + 5);
        ctx.textAlign = 'left';
        ctx.fillText('0', padding - 5, padding + chartHeight + 5);

        ctx.textAlign = 'center';
        ctx.fillText('Value', canvas.width / 2, canvas.height - 5);
        ctx.save();
        ctx.translate(15, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Frequency', 0, 0);
        ctx.restore();
    }

    // --- UI Logic ---
    function updateParameterInputs() {
        // Hide all parameter groups
        normalParams.classList.add('hidden');
        uniformParams.classList.add('hidden');
        exponentialParams.classList.add('hidden');

        // Show the relevant parameter group
        const selectedDistribution = distributionSelect.value;
        switch (selectedDistribution) {
            case 'normal':
                normalParams.classList.remove('hidden');
                break;
            case 'uniform':
                uniformParams.classList.remove('hidden');
                break;
            case 'exponential':
                exponentialParams.classList.remove('hidden');
                break;
        }
    }

    function generateAndVisualize() {
        const selectedDistribution = distributionSelect.value;
        const sampleCount = parseInt(sampleCountInput.value);

        if (isNaN(sampleCount) || sampleCount < 100 || sampleCount > 100000) {
            alert('Please enter a valid sample count between 100 and 100,000.');
            return;
        }

        switch (selectedDistribution) {
            case 'normal':
                const mean = parseFloat(normalMeanInput.value);
                const stdDev = parseFloat(normalStdDevInput.value);
                if (isNaN(mean) || isNaN(stdDev) || stdDev <= 0) {
                    alert('Please enter valid numbers for Mean and a positive Standard Deviation.');
                    return;
                }
                currentSampleData = generateNormalSamples(mean, stdDev, sampleCount);
                break;
            case 'uniform':
                const min = parseFloat(uniformMinInput.value);
                const max = parseFloat(uniformMaxInput.value);
                if (isNaN(min) || isNaN(max) || min >= max) {
                    alert('Please enter valid numbers for Min and Max, where Max is greater than Min.');
                    return;
                }
                currentSampleData = generateUniformSamples(min, max, sampleCount);
                break;
            case 'exponential':
                const lambda = parseFloat(exponentialLambdaInput.value);
                if (isNaN(lambda) || lambda <= 0) {
                    alert('Please enter a valid positive number for Lambda.');
                    return;
                }
                currentSampleData = generateExponentialSamples(lambda, sampleCount);
                break;
        }
        drawHistogram(currentSampleData);
    }

    // --- Event Listeners ---
    distributionSelect.addEventListener('change', updateParameterInputs);
    generateButton.addEventListener('click', generateAndVisualize);

    // Initial setup
    updateParameterInputs(); // Show correct params on load
    generateAndVisualize(); // Generate initial samples
});
