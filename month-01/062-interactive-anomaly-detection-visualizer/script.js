document.addEventListener('DOMContentLoaded', () => {
    const dataInput = document.getElementById('dataInput');
    const thresholdInput = document.getElementById('thresholdInput');
    const detectButton = document.getElementById('detectButton');
    const anomalyResultsDiv = document.getElementById('anomalyResults');
    const dataChartCanvas = document.getElementById('dataChart');
    const ctx = dataChartCanvas.getContext('2d');

    // Initial data for demonstration
    dataInput.value = '10, 12, 11, 100, 13, 14, 15, 120, 16, 17, 18, 19, 20, 10.5, 18.2';

    detectButton.addEventListener('click', detectAnomalies);

    function detectAnomalies() {
        const rawData = dataInput.value;
        const threshold = parseFloat(thresholdInput.value);

        if (isNaN(threshold) || threshold <= 0) {
            alert('Please enter a valid positive threshold for standard deviations.');
            return;
        }

        const numbers = rawData.split(/[\s,]+/) // Split by spaces or commas
                               .map(Number)
                               .filter(n => !isNaN(n)); // Filter out any non-numeric results

        if (numbers.length === 0) {
            anomalyResultsDiv.textContent = 'No data entered. Please provide a list of numbers.';
            drawChart([], [], null, null, null, null); // Clear chart
            return;
        }

        if (numbers.length < 2) { // Need at least 2 points for meaningful std dev
            anomalyResultsDiv.textContent = 'Please enter at least two numbers to detect anomalies.';
            drawChart(numbers, [], null, null, null, null); // Plot single points
            return;
        }

        // Calculate Mean
        const mean = numbers.reduce((sum, val) => sum + val, 0) / numbers.length;

        // Calculate Standard Deviation
        // Note: Using population standard deviation for simplicity. For sample, it's `numbers.length - 1`.
        const variance = numbers.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numbers.length;
        const stdDev = Math.sqrt(variance);

        // Define anomaly bounds
        const lowerBound = mean - threshold * stdDev;
        const upperBound = mean + threshold * stdDev;

        const anomalies = [];
        numbers.forEach((num, index) => {
            if (num < lowerBound || num > upperBound) {
                anomalies.push({ value: num, index: index });
            }
        });

        displayResults(anomalies, mean, stdDev, lowerBound, upperBound);
        drawChart(numbers, anomalies, mean, lowerBound, upperBound);
    }

    function displayResults(anomalies, mean, stdDev, lowerBound, upperBound) {
        let resultHtml = `
            <strong>Mean:</strong> ${mean.toFixed(2)}<br>
            <strong>Standard Deviation:</strong> ${stdDev.toFixed(2)}<br>
            <strong>Lower Bound:</strong> ${lowerBound.toFixed(2)}<br>
            <strong>Upper Bound:</strong> ${upperBound.toFixed(2)}<br><br>
        `;

        if (anomalies.length > 0) {
            resultHtml += '<strong>Detected Anomalies:</strong><br>';
            anomalies.forEach(anomaly => {
                resultHtml += `- Value: ${anomaly.value} (at index ${anomaly.index})<br>`;
            });
        } else {
            resultHtml += 'No anomalies detected within the specified threshold.';
        }
        anomalyResultsDiv.innerHTML = resultHtml;
    }

    function drawChart(data, anomalies, mean, lowerBound, upperBound) {
        ctx.clearRect(0, 0, dataChartCanvas.width, dataChartCanvas.height);

        if (data.length === 0) {
            ctx.fillStyle = '#888';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Enter data to visualize', dataChartCanvas.width / 2, dataChartCanvas.height / 2);
            return;
        }

        const padding = 40;
        const chartWidth = dataChartCanvas.width - 2 * padding;
        const chartHeight = dataChartCanvas.height - 2 * padding;

        const minValue = Math.min(...data);
        const maxValue = Math.max(...data);
        const valueRange = maxValue - minValue;

        // Add some buffer to the y-axis range if all points are the same or range is very small
        const yAxisBuffer = (valueRange === 0 || isNaN(valueRange)) ? 1 : valueRange * 0.1;
        const displayMin = minValue - yAxisBuffer;
        const displayMax = maxValue + yAxisBuffer;
        const displayRange = displayMax - displayMin;

        // X-axis: Data point index
        // If only one data point, xScale should be effectively 0 or handle separately
        const xScale = chartWidth / (data.length > 1 ? data.length - 1 : 1);
        // Y-axis: Data value
        const yScale = chartHeight / (displayRange === 0 ? 1 : displayRange); // Avoid division by zero

        // Draw X-axis line (for indices)
        ctx.beginPath();
        ctx.moveTo(padding, dataChartCanvas.height - padding);
        ctx.lineTo(dataChartCanvas.width - padding, dataChartCanvas.height - padding);
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw Y-axis line (for values)
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, dataChartCanvas.height - padding);
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw Y-axis labels
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        const numYLabels = 5;
        for (let i = 0; i <= numYLabels; i++) {
            const yValue = displayMin + (displayRange / numYLabels) * i;
            const yPixel = dataChartCanvas.height - padding - (yValue - displayMin) * yScale;
            ctx.fillText(yValue.toFixed(1), padding - 10, yPixel);
            if (i > 0 && i < numYLabels) { // Draw horizontal grid lines
                ctx.beginPath();
                ctx.moveTo(padding, yPixel);
                ctx.lineTo(dataChartCanvas.width - padding, yPixel);
                ctx.strokeStyle = '#eee';
                ctx.stroke();
            }
        }

        // Draw X-axis labels (indices)
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const numXLabels = Math.min(data.length, 10); // Limit number of X labels
        for (let i = 0; i < data.length; i++) {
            if (data.length <= numXLabels || i % Math.ceil(data.length / numXLabels) === 0) {
                const xPixel = padding + i * xScale;
                ctx.fillText(i, xPixel, dataChartCanvas.height - padding + 10);
            }
        }

        // Draw data points
        data.forEach((value, index) => {
            const x = padding + index * xScale;
            const y = dataChartCanvas.height - padding - (value - displayMin) * yScale;

            const isAnomaly = anomalies.some(a => a.index === index);

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2); // Radius 4
            ctx.fillStyle = isAnomaly ? '#e74c3c' : '#3498db'; // Red for anomaly, Blue for normal
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Optional: Draw value next to anomaly
            if (isAnomaly) {
                ctx.fillStyle = '#e74c3c';
                ctx.font = '10px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(value.toFixed(1), x + 8, y + 4);
            }
        });

        // Draw Mean line
        if (mean !== null) {
            const meanY = dataChartCanvas.height - padding - (mean - displayMin) * yScale;
            ctx.beginPath();
            ctx.moveTo(padding, meanY);
            ctx.lineTo(dataChartCanvas.width - padding, meanY);
            ctx.strokeStyle = '#27ae60'; // Green
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]); // Dashed line
            ctx.stroke();
            ctx.textAlign = 'left';
            ctx.fillStyle = '#27ae60';
            ctx.fillText(`Mean: ${mean.toFixed(2)}`, dataChartCanvas.width - padding + 5, meanY - 5);
        }

        // Draw Anomaly Bounds
        if (lowerBound !== null && upperBound !== null) {
            const lowerY = dataChartCanvas.height - padding - (lowerBound - displayMin) * yScale;
            const upperY = dataChartCanvas.height - padding - (upperBound - displayMin) * yScale;

            ctx.beginPath();
            ctx.moveTo(padding, lowerY);
            ctx.lineTo(dataChartCanvas.width - padding, lowerY);
            ctx.strokeStyle = '#f39c12'; // Orange
            ctx.lineWidth = 1.5;
            ctx.setLineDash([2, 2]); // Dotted line
            ctx.stroke();
            ctx.textAlign = 'left';
            ctx.fillStyle = '#f39c12';
            ctx.fillText(`Lower: ${lowerBound.toFixed(2)}`, dataChartCanvas.width - padding + 5, lowerY - 5);

            ctx.beginPath();
            ctx.moveTo(padding, upperY);
            ctx.lineTo(dataChartCanvas.width - padding, upperY);
            ctx.strokeStyle = '#f39c12'; // Orange
            ctx.lineWidth = 1.5;
            ctx.setLineDash([2, 2]);
            ctx.stroke();
            ctx.textAlign = 'left';
            ctx.fillStyle = '#f39c12';
            ctx.fillText(`Upper: ${upperBound.toFixed(2)}`, dataChartCanvas.width - padding + 5, upperY + 15);
        }

        ctx.setLineDash([]); // Reset line dash to solid for subsequent drawings
    }

    // Call detectAnomalies on page load with default data
    detectAnomalies();
});
