document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM Elements
    const baseDistSelect = document.getElementById('baseDist');
    const sampleSizeInput = document.getElementById('sampleSize');
    const numSamplesInput = document.getElementById('numSamples');
    const runButton = document.getElementById('runSimulation');
    const resetButton = document.getElementById('resetSimulation');

    const baseDistCanvas = document.getElementById('baseDistCanvas');
    const sampleMeansCanvas = document.getElementById('sampleMeansCanvas');
    const baseCtx = baseDistCanvas.getContext('2d');
    const meansCtx = sampleMeansCanvas.getContext('2d');

    // 2. Helper Functions for Distributions
    function getRandomUniform(min, max) {
        return Math.random() * (max - min) + min;
    }

    function getRandomExponential(lambda) {
        // Using inverse transform sampling for exponential distribution
        // lambda is the rate parameter (e.g., 0.5 for mean of 2)
        return -Math.log(1 - Math.random()) / lambda;
    }

    // 3. drawHistogram function
    function drawHistogram(ctx, data, color, numBins = 30) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (data.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No data to display', ctx.canvas.width / 2, ctx.canvas.height / 2);
            return;
        }

        const minVal = Math.min(...data);
        const maxVal = Math.max(...data);

        // Handle case where all data points are identical
        if (minVal === maxVal) {
            const centerX = ctx.canvas.width / 2;
            const barWidth = ctx.canvas.width / 5; // Arbitrary width for a single bar
            const barHeight = ctx.canvas.height * 0.8; // Make it tall
            ctx.fillStyle = color;
            ctx.fillRect(centerX - barWidth / 2, ctx.canvas.height - barHeight, barWidth, barHeight);
            ctx.strokeStyle = '#333';
            ctx.strokeRect(centerX - barWidth / 2, ctx.canvas.height - barHeight, barWidth, barHeight);
            
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(minVal.toFixed(2), centerX, ctx.canvas.height - barHeight - 5);
            return;
        }

        const binWidth = (maxVal - minVal) / numBins;
        const bins = new Array(numBins).fill(0);

        data.forEach(value => {
            let binIndex = Math.floor((value - minVal) / binWidth);
            if (binIndex >= numBins) { // Handle max value falling into the last bin
                binIndex = numBins - 1;
            }
            bins[binIndex]++;
        });

        const maxFrequency = Math.max(...bins);
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        const barCanvasWidth = canvasWidth / numBins;

        ctx.strokeStyle = '#333'; // Border color for bars
        ctx.lineWidth = 0.5;

        for (let i = 0; i < numBins; i++) {
            const barHeight = (bins[i] / maxFrequency) * canvasHeight;
            const x = i * barCanvasWidth;
            const y = canvasHeight - barHeight; // Draw from bottom up

            ctx.fillStyle = color;
            ctx.fillRect(x, y, barCanvasWidth - 1, barHeight); // -1 for a small gap
            ctx.strokeRect(x, y, barCanvasWidth - 1, barHeight);
        }

        // Add X-axis labels for min/max
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(minVal.toFixed(1), 0, canvasHeight - 5);
        ctx.textAlign = 'right';
        ctx.fillText(maxVal.toFixed(1), canvasWidth, canvasHeight - 5);
    }

    // 4. runSimulation function
    async function runSimulation() {
        runButton.disabled = true;
        runButton.textContent = 'Simulating...';

        const baseDistType = baseDistSelect.value;
        const sampleSize = parseInt(sampleSizeInput.value, 10);
        const numSamples = parseInt(numSamplesInput.value, 10);

        if (isNaN(sampleSize) || sampleSize < 2 || sampleSize > 1000) {
            alert('Sample Size (n) must be a number between 2 and 1000.');
            runButton.disabled = false;
            runButton.textContent = 'Run Simulation';
            return;
        }
        if (isNaN(numSamples) || numSamples < 10 || numSamples > 10000) {
            alert('Number of Samples (N) must be a number between 10 and 10000.');
            runButton.disabled = false;
            runButton.textContent = 'Run Simulation';
            return;
        }

        let allBaseSamples = [];
        let sampleMeans = [];
        const exponentialLambda = 0.5; // Fixed lambda for exponential distribution (mean = 1/lambda = 2)

        // Generate a large set of samples to represent the base distribution (population)
        const basePopulationSize = 50000; // Max number of points for base distribution histogram
        for (let i = 0; i < basePopulationSize; i++) {
            let value;
            if (baseDistType === 'uniform') {
                value = getRandomUniform(0, 1); // Uniform between 0 and 1
            } else if (baseDistType === 'exponential') {
                value = getRandomExponential(exponentialLambda); // Exponential
            }
            allBaseSamples.push(value);
        }

        // Simulate drawing samples and calculating means
        const chunkSize = 100; // Process 100 samples at a time to prevent UI freeze
        for (let i = 0; i < numSamples; i += chunkSize) {
            await new Promise(resolve => setTimeout(resolve, 0)); // Yield to UI
            
            for (let j = 0; j < chunkSize && (i + j) < numSamples; j++) {
                let currentSample = [];
                for (let k = 0; k < sampleSize; k++) {
                    let value;
                    if (baseDistType === 'uniform') {
                        value = getRandomUniform(0, 1);
                    } else if (baseDistType === 'exponential') {
                        value = getRandomExponential(exponentialLambda);
                    }
                    currentSample.push(value);
                }
                const mean = currentSample.reduce((a, b) => a + b, 0) / sampleSize;
                sampleMeans.push(mean);
            }
        }
        
        drawHistogram(baseCtx, allBaseSamples, '#ADD8E6');
        drawHistogram(meansCtx, sampleMeans, '#87CEEB');

        runButton.disabled = false;
        runButton.textContent = 'Run Simulation';
    }

    // 5. resetSimulation function
    function resetSimulation() {
        // Clear canvas content and redraw empty state with text
        drawHistogram(baseCtx, [], '#ADD8E6'); 
        drawHistogram(meansCtx, [], '#87CEEB'); 

        // Reset input values to defaults
        baseDistSelect.value = 'uniform';
        sampleSizeInput.value = '30';
        numSamplesInput.value = '1000';
    }

    // 6. Event Listeners & Initial Call
    runButton.addEventListener('click', runSimulation);
    resetButton.addEventListener('click', resetSimulation);

    // Run initial simulation on load
    runSimulation();
});
