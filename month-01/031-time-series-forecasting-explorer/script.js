document.addEventListener('DOMContentLoaded', () => {
    const dataInput = document.getElementById('dataInput');
    const loadDataBtn = document.getElementById('loadDataBtn');
    const loadExampleBtn = document.getElementById('loadExampleBtn');
    const methodSelect = document.getElementById('methodSelect');
    const maParams = document.getElementById('maParams');
    const esParams = document.getElementById('esParams');
    const maWindowInput = document.getElementById('maWindow');
    const esAlphaInput = document.getElementById('esAlpha');
    const applyForecastBtn = document.getElementById('applyForecastBtn');
    const clearForecastBtn = document.getElementById('clearForecastBtn');
    const chartCanvas = document.getElementById('timeSeriesChart');
    const ctx = chartCanvas.getContext('2d');

    let rawData = [];
    let forecastData = [];

    // Charting Constants & Variables
    const CHART_PADDING = 40;
    const DATA_COLOR = '#3498db'; // Blue
    const FORECAST_COLOR = '#e74c3c'; // Red
    let CHART_WIDTH; // Will be set by updateChartDimensions
    let CHART_HEIGHT; // Will be set by updateChartDimensions

    // --- Utility Functions ---
    function parseData(text) {
        return text.split('\n')
                   .map(line => parseFloat(line.trim()))
                   .filter(value => !isNaN(value));
    }

    function updateChartDimensions() {
        const dpi = window.devicePixelRatio || 1;
        // Get actual computed style width/height for logical dimensions
        const computedStyle = getComputedStyle(chartCanvas);
        CHART_WIDTH = parseFloat(computedStyle.width);
        CHART_HEIGHT = parseFloat(computedStyle.height);

        // Set canvas physical dimensions for high-DPI rendering
        chartCanvas.width = CHART_WIDTH * dpi;
        chartCanvas.height = CHART_HEIGHT * dpi;

        // Reset transformation matrix and then scale for high-DPI
        ctx.setTransform(dpi, 0, 0, dpi, 0, 0); 
    }

    function drawChart() {
        ctx.clearRect(0, 0, CHART_WIDTH, CHART_HEIGHT);

        if (rawData.length === 0) {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#666';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('No data loaded. Please enter or load example data.', CHART_WIDTH / 2, CHART_HEIGHT / 2);
            return;
        }

        const allDataPoints = rawData.concat(forecastData.filter(d => d !== null));
        const minY = allDataPoints.length > 0 ? Math.min(...allDataPoints) : 0;
        const maxY = allDataPoints.length > 0 ? Math.max(...allDataPoints) : 1;

        const rangeY = maxY - minY;
        const effectiveRangeY = rangeY === 0 ? 1 : rangeY; // Avoid division by zero
        const scaleY = (CHART_HEIGHT - 2 * CHART_PADDING) / effectiveRangeY;
        const scaleX = (CHART_WIDTH - 2 * CHART_PADDING) / (rawData.length - 1 || 1); // Avoid division by zero

        ctx.lineWidth = 1;
        ctx.strokeStyle = '#ccc';
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';

        // Draw Y-axis
        ctx.beginPath();
        ctx.moveTo(CHART_PADDING, CHART_PADDING);
        ctx.lineTo(CHART_PADDING, CHART_HEIGHT - CHART_PADDING);
        ctx.stroke();

        // Draw X-axis
        ctx.beginPath();
        ctx.moveTo(CHART_PADDING, CHART_HEIGHT - CHART_PADDING);
        ctx.lineTo(CHART_WIDTH - CHART_PADDING, CHART_HEIGHT - CHART_PADDING);
        ctx.stroke();

        // Y-axis labels
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        const numYLabels = 5;
        for (let i = 0; i <= numYLabels; i++) {
            const value = minY + (effectiveRangeY / numYLabels) * i;
            const y = CHART_HEIGHT - CHART_PADDING - (value - minY) * scaleY;
            ctx.fillText(value.toFixed(1), CHART_PADDING - 5, y);
            ctx.beginPath();
            ctx.moveTo(CHART_PADDING, y);
            ctx.lineTo(CHART_PADDING + 5, y);
            ctx.stroke();
        }

        // X-axis labels (simplified for time series index)
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const maxLabels = 10;
        const labelInterval = Math.max(1, Math.ceil(rawData.length / maxLabels));
        for (let i = 0; i < rawData.length; i++) {
            if (i % labelInterval === 0) {
                const x = CHART_PADDING + i * scaleX;
                ctx.fillText(i + 1, x, CHART_HEIGHT - CHART_PADDING + 5);
                ctx.beginPath();
                ctx.moveTo(x, CHART_HEIGHT - CHART_PADDING);
                ctx.lineTo(x, CHART_HEIGHT - CHART_PADDING - 5);
                ctx.stroke();
            }
        }

        // Draw Raw Data
        ctx.strokeStyle = DATA_COLOR;
        ctx.lineWidth = 2;
        ctx.setLineDash([]); // Ensure solid line
        ctx.beginPath();
        rawData.forEach((value, i) => {
            const x = CHART_PADDING + i * scaleX;
            const y = CHART_HEIGHT - CHART_PADDING - (value - minY) * scaleY;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw Forecast Data
        if (forecastData.some(d => d !== null)) {
            ctx.strokeStyle = FORECAST_COLOR;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]); // Dashed line for forecast
            ctx.beginPath();
            let firstPointDrawn = false;
            forecastData.forEach((value, i) => {
                if (value !== null) {
                    const x = CHART_PADDING + i * scaleX;
                    const y = CHART_HEIGHT - CHART_PADDING - (value - minY) * scaleY;
                    if (!firstPointDrawn) {
                        ctx.moveTo(x, y);
                        firstPointDrawn = true;
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
            });
            ctx.stroke();
            ctx.setLineDash([]); // Reset line dash
        }
    }

    // --- Forecasting Algorithms ---
    function calculateMovingAverage(data, windowSize) {
        const forecast = new Array(data.length).fill(null);
        if (data.length < windowSize) return forecast;

        for (let i = windowSize; i < data.length; i++) {
            const slice = data.slice(i - windowSize, i);
            const sum = slice.reduce((acc, val) => acc + val, 0);
            forecast[i] = sum / windowSize;
        }
        return forecast;
    }

    function calculateExponentialSmoothing(data, alpha) {
        const forecast = new Array(data.length).fill(null);
        if (data.length === 0) return forecast;

        // Initialize the first forecast value (F_1 = Y_0)
        forecast[0] = data[0];

        for (let i = 1; i < data.length; i++) {
            // F_t = alpha * Y_{t-1} + (1 - alpha) * F_{t-1}
            forecast[i] = alpha * data[i - 1] + (1 - alpha) * forecast[i - 1];
        }
        return forecast;
    }

    // --- Event Handlers ---
    loadDataBtn.addEventListener('click', () => {
        rawData = parseData(dataInput.value);
        forecastData = []; // Clear old forecast
        drawChart();
    });

    loadExampleBtn.addEventListener('click', () => {
        dataInput.value = `20
22
25
23
28
30
32
31
35
38
36
40
42
45
43
48
50
52
51
55`;
        rawData = parseData(dataInput.value);
        forecastData = [];
        drawChart();
    });

    methodSelect.addEventListener('change', () => {
        maParams.style.display = 'none';
        esParams.style.display = 'none';
        if (methodSelect.value === 'movingAverage') {
            maParams.style.display = 'block';
        } else if (methodSelect.value === 'exponentialSmoothing') {
            esParams.style.display = 'block';
        }
    });

    applyForecastBtn.addEventListener('click', () => {
        if (rawData.length === 0) {
            alert('Please load data first.');
            return;
        }

        const method = methodSelect.value;
        if (method === 'movingAverage') {
            const windowSize = parseInt(maWindowInput.value);
            if (isNaN(windowSize) || windowSize < 1 || windowSize >= rawData.length) {
                alert('Moving Average Window Size must be a positive integer less than the number of data points.');
                return;
            }
            forecastData = calculateMovingAverage(rawData, windowSize);
        } else if (method === 'exponentialSmoothing') {
            const alpha = parseFloat(esAlphaInput.value);
            if (isNaN(alpha) || alpha < 0 || alpha > 1) {
                alert('Exponential Smoothing Alpha must be between 0 and 1.');
                return;
            }
            forecastData = calculateExponentialSmoothing(rawData, alpha);
        } else {
            forecastData = []; // No method selected or 'None'
        }
        drawChart();
    });

    clearForecastBtn.addEventListener('click', () => {
        forecastData = [];
        drawChart();
    });

    // Initial setup
    updateChartDimensions(); // Set canvas dimensions correctly on load
    window.addEventListener('resize', () => {
        updateChartDimensions();
        drawChart(); // Redraw chart on resize
    });
    methodSelect.dispatchEvent(new Event('change')); // Trigger initial display for method params
    loadExampleBtn.click(); // Load example data on page load
});
