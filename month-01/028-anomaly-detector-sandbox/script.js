document.addEventListener('DOMContentLoaded', () => {
    const dataInput = document.getElementById('dataInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const ruleTypeSelect = document.getElementById('ruleType');
    const thresholdInput = document.getElementById('threshold');
    const thresholdInfoSpan = document.getElementById('thresholdInfo');
    const dataCanvas = document.getElementById('dataCanvas');
    const anomalyList = document.getElementById('anomalyList');
    const ctx = dataCanvas.getContext('2d');

    let currentData = [];
    let anomalies = [];

    // Set canvas dimensions to match its CSS computed size for proper drawing resolution
    const setCanvasDimensions = () => {
        dataCanvas.width = dataCanvas.clientWidth;
        dataCanvas.height = dataCanvas.clientHeight;
    };
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions); // Adjust on resize

    // Helper functions for statistical calculations
    function calculateMean(data) {
        if (data.length === 0) return 0;
        return data.reduce((sum, val) => sum + val, 0) / data.length;
    }

    function calculateStandardDeviation(data, mean) {
        if (data.length < 2) return 0; // Need at least 2 points for sample std dev
        const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (data.length - 1);
        return Math.sqrt(variance);
    }

    function calculateQuartiles(data) {
        const sortedData = [...data].sort((a, b) => a - b);
        const mid = Math.floor(sortedData.length / 2);
        const q1 = median(sortedData.slice(0, mid));
        const q3 = median(sortedData.slice(sortedData.length % 2 === 0 ? mid : mid + 1));
        return { q1, q3 };
    }

    function median(arr) {
        if (arr.length === 0) return 0;
        const mid = Math.floor(arr.length / 2);
        return arr.length % 2 === 0 ? (arr[mid - 1] + arr[mid]) / 2 : arr[mid];
    }

    // Main analysis function
    function analyzeData() {
        const rawData = dataInput.value.trim();
        if (!rawData) {
            alert('Please enter some numerical data.');
            drawChart([]); // Clear chart
            updateAnomalyList([]);
            return;
        }

        currentData = rawData.split(/[,\s\n]+/) // Split by commas, spaces, or newlines
                             .map(Number)
                             .filter(n => !isNaN(n) && n !== ''); // Ensure valid numbers

        if (currentData.length === 0) {
            alert('No valid numbers found in the input.');
            drawChart([]);
            updateAnomalyList([]);
            return;
        }

        const ruleType = ruleTypeSelect.value;
        const threshold = parseFloat(thresholdInput.value);

        if (isNaN(threshold) || threshold < 0) {
            alert('Please enter a valid positive threshold.');
            return;
        }

        anomalies = [];

        if (ruleType === 'zscore') {
            if (currentData.length < 2) {
                alert('Z-score requires at least 2 data points for standard deviation calculation.');
                drawChart([]);
                updateAnomalyList([]);
                return;
            }
            const mean = calculateMean(currentData);
            const stdDev = calculateStandardDeviation(currentData, mean);

            if (stdDev === 0) {
                // If all values are the same, stdDev is 0. No relative anomalies by Z-score.
                // We could consider all points anomalies if threshold is 0, but that's not typical.
                // For practical purposes, if stdDev is 0, no Z-score anomalies for positive thresholds.
                drawChart(currentData, [], ruleType, threshold); // Draw data without anomalies
                updateAnomalyList([]);
                return;
            }

            currentData.forEach((val, index) => {
                const zScore = (val - mean) / stdDev;
                if (Math.abs(zScore) > threshold) {
                    anomalies.push({ value: val, index: index, type: 'zscore', score: zScore });
                }
            });

        } else if (ruleType === 'iqr') {
            if (currentData.length < 4) { // IQR method works best with a reasonable number of points for robust Q1/Q3
                alert('IQR method typically requires at least 4 data points for robust quartile calculation.');
                drawChart([]);
                updateAnomalyList([]);
                return;
            }
            const { q1, q3 } = calculateQuartiles(currentData);
            const iqr = q3 - q1;
            const lowerBound = q1 - threshold * iqr;
            const upperBound = q3 + threshold * iqr;

            currentData.forEach((val, index) => {
                if (val < lowerBound || val > upperBound) {
                    anomalies.push({ value: val, index: index, type: 'iqr', lower: lowerBound.toFixed(2), upper: upperBound.toFixed(2) });
                }
            });
        }

        drawChart(currentData, anomalies, ruleType, threshold);
        updateAnomalyList(anomalies);
    }

    // Canvas drawing function
    function drawChart(data, anomalies = [], ruleType, threshold) {
        ctx.clearRect(0, 0, dataCanvas.width, dataCanvas.height);

        if (data.length === 0) {
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#777';
            ctx.fillText('No data to display. Enter numbers and click Analyze.', dataCanvas.width / 2, dataCanvas.height / 2);
            return;
        }

        const padding = 30;
        const chartWidth = dataCanvas.width - 2 * padding;
        const chartHeight = dataCanvas.height - 2 * padding;

        const minValue = Math.min(...data);
        const maxValue = Math.max(...data);
        const range = maxValue - minValue;

        // Ensure a minimum range for visual clarity if all values are the same
        const effectiveRange = range === 0 ? 1 : range;
        const scaleY = chartHeight / effectiveRange;

        // Draw X axis (horizontal line for data points)
        ctx.beginPath();
        ctx.moveTo(padding, chartHeight + padding);
        ctx.lineTo(chartWidth + padding, chartHeight + padding);
        ctx.strokeStyle = '#333';
        ctx.stroke();

        // Draw Y axis labels (min/max on the left)
        ctx.font = '12px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'right';
        ctx.fillText(maxValue.toFixed(2), padding - 5, padding + 5);
        ctx.fillText(minValue.toFixed(2), padding - 5, chartHeight + padding + 5);


        // Draw data points
        data.forEach((val, i) => {
            // Distribute points evenly along X axis
            const x = padding + (data.length > 1 ? (i / (data.length - 1)) * chartWidth : chartWidth / 2);
            // Map value to Y coordinate
            const y = chartHeight + padding - ((val - minValue) * scaleY);

            const isAnomaly = anomalies.some(a => a.index === i);

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2); // Draw a circle
            ctx.fillStyle = isAnomaly ? 'var(--anomaly-color)' : 'var(--primary-color)';
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.stroke();
        });

        // Draw detection rule lines
        ctx.textAlign = 'left'; // Reset text alignment for labels
        if (ruleType === 'zscore' && data.length >= 2) {
            const mean = calculateMean(data);
            const stdDev = calculateStandardDeviation(data, mean);
            const lowerLimit = mean - threshold * stdDev;
            const upperLimit = mean + threshold * stdDev;

            // Convert to canvas Y coordinates
            const yMean = chartHeight + padding - ((mean - minValue) * scaleY);
            const yLower = chartHeight + padding - ((lowerLimit - minValue) * scaleY);
            const yUpper = chartHeight + padding - ((upperLimit - minValue) * scaleY);

            // Draw mean line
            ctx.beginPath();
            ctx.setLineDash([5, 5]); // Dashed line
            ctx.strokeStyle = '#007bff'; // Blue
            ctx.moveTo(padding, yMean);
            ctx.lineTo(chartWidth + padding, yMean);
            ctx.stroke();
            ctx.fillText(`Mean: ${mean.toFixed(2)}`, padding + chartWidth - 80, yMean - 5); // Label on right

            // Draw threshold lines
            ctx.strokeStyle = '#ff7f0e'; // Orange
            ctx.moveTo(padding, yLower);
            ctx.lineTo(chartWidth + padding, yLower);
            ctx.stroke();
            ctx.fillText(`Lower Bound: ${lowerLimit.toFixed(2)}`, padding + chartWidth - 110, yLower + 15);

            ctx.moveTo(padding, yUpper);
            ctx.lineTo(chartWidth + padding, yUpper);
            ctx.stroke();
            ctx.fillText(`Upper Bound: ${upperLimit.toFixed(2)}`, padding + chartWidth - 110, yUpper - 5);

            ctx.setLineDash([]); // Reset line dash
        } else if (ruleType === 'iqr' && data.length >= 4) {
            const { q1, q3 } = calculateQuartiles(data);
            const iqr = q3 - q1;
            const lowerBound = q1 - threshold * iqr;
            const upperBound = q3 + threshold * iqr;

            // Convert to canvas Y coordinates
            const yQ1 = chartHeight + padding - ((q1 - minValue) * scaleY);
            const yQ3 = chartHeight + padding - ((q3 - minValue) * scaleY);
            const yLower = chartHeight + padding - ((lowerBound - minValue) * scaleY);
            const yUpper = chartHeight + padding - ((upperBound - minValue) * scaleY);

            // Draw Q1 and Q3 lines
            ctx.beginPath();
            ctx.setLineDash([2, 2]); // Dotted line for quartiles
            ctx.strokeStyle = '#17a2b8'; // Teal
            ctx.moveTo(padding, yQ1);
            ctx.lineTo(chartWidth + padding, yQ1);
            ctx.stroke();
            ctx.fillText(`Q1: ${q1.toFixed(2)}`, padding + chartWidth - 60, yQ1 + 15);

            ctx.moveTo(padding, yQ3);
            ctx.lineTo(chartWidth + padding, yQ3);
            ctx.stroke();
            ctx.fillText(`Q3: ${q3.toFixed(2)}`, padding + chartWidth - 60, yQ3 - 5);

            // Draw threshold lines
            ctx.setLineDash([5, 2]); // Dashed line for bounds
            ctx.strokeStyle = '#ff7f0e'; // Orange
            ctx.moveTo(padding, yLower);
            ctx.lineTo(chartWidth + padding, yLower);
            ctx.stroke();
            ctx.fillText(`Lower Bound: ${lowerBound.toFixed(2)}`, padding + chartWidth - 110, yLower + 15);

            ctx.moveTo(padding, yUpper);
            ctx.lineTo(chartWidth + padding, yUpper);
            ctx.stroke();
            ctx.fillText(`Upper Bound: ${upperBound.toFixed(2)}`, padding + chartWidth - 110, yUpper - 5);

            ctx.setLineDash([]); // Reset line dash
        }
    }

    // Update anomaly list
    function updateAnomalyList(anomalies) {
        anomalyList.innerHTML = '';
        if (anomalies.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No anomalies detected.';
            anomalyList.appendChild(li);
        } else {
            anomalies.forEach(anomaly => {
                const li = document.createElement('li');
                li.classList.add('anomaly-item');
                let anomalyDetails = `Value: <span style="font-weight: bold; color: var(--anomaly-color);">${anomaly.value}</span> (Index: ${anomaly.index})`;
                if (anomaly.type === 'zscore') {
                    anomalyDetails += `, Z-score: ${anomaly.score.toFixed(2)}`;
                } else if (anomaly.type === 'iqr') {
                    anomalyDetails += `, Outside [${anomaly.lower}, ${anomaly.upper}]`;
                }
                li.innerHTML = anomalyDetails;
                anomalyList.appendChild(li);
            });
        }
    }

    // Event listeners
    analyzeBtn.addEventListener('click', analyzeData);
    ruleTypeSelect.addEventListener('change', () => {
        const type = ruleTypeSelect.value;
        if (type === 'zscore') {
            thresholdInput.value = 2;
            thresholdInfoSpan.textContent = ' (e.g., Z-score > 2)';
        } else if (type === 'iqr') {
            thresholdInput.value = 1.5;
            thresholdInfoSpan.textContent = ' (e.g., IQR multiplier of 1.5)';
        }
        if (currentData.length > 0) { // Re-analyze if data is already present
            analyzeData();
        }
    });
    thresholdInput.addEventListener('change', () => {
        if (currentData.length > 0) {
            analyzeData();
        }
    });

    // Initial load: Draw empty chart and prompt user
    drawChart([]);
});
