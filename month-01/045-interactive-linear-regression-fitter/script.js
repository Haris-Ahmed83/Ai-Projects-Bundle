document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('regressionCanvas');
    const ctx = canvas.getContext('2d');
    const clearBtn = document.getElementById('clearBtn');
    const slopeOutput = document.getElementById('slopeOutput');
    const interceptOutput = document.getElementById('interceptOutput');
    const rSquaredOutput = document.getElementById('rSquaredOutput');

    let dataPoints = [];
    const pointRadius = 4;

    // --- Drawing Functions ---
    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function drawPoints() {
        ctx.fillStyle = '#e74c3c'; // Red color for points
        dataPoints.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, pointRadius, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function drawLine(m, b) {
        ctx.strokeStyle = '#3498db'; // Blue color for line
        ctx.lineWidth = 2;
        ctx.beginPath();

        // The line should extend across the entire canvas width
        // Calculate y for the left edge (x=0)
        const y1 = m * 0 + b;
        // Calculate y for the right edge (x=canvas.width)
        const y2 = m * canvas.width + b;

        // Draw the line, clipping to canvas boundaries
        ctx.moveTo(0, y1);
        ctx.lineTo(canvas.width, y2);
        ctx.stroke();
    }

    // --- Linear Regression Calculation ---
    function calculateLinearRegression() {
        if (dataPoints.length < 2) {
            return { m: NaN, b: NaN, rSquared: NaN };
        }

        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumXX = 0;

        dataPoints.forEach(p => {
            sumX += p.x;
            sumY += p.y;
            sumXY += p.x * p.y;
            sumXX += p.x * p.x;
        });

        const n = dataPoints.length;

        // Calculate slope (m)
        const mNumerator = n * sumXY - sumX * sumY;
        const mDenominator = n * sumXX - sumX * sumX;

        let m, b;
        if (mDenominator === 0) { // All x values are the same (vertical line)
            m = Infinity; // Mathematically, slope is undefined/infinite
            b = NaN;      // Y-intercept is also undefined
        } else {
            m = mNumerator / mDenominator;
            // Calculate y-intercept (b)
            b = (sumY - m * sumX) / n;
        }

        // Calculate R-squared
        let ssTotal = 0; // Total sum of squares
        let ssResidual = 0; // Residual sum of squares
        const meanY = sumY / n;

        dataPoints.forEach(p => {
            const predictedY = m * p.x + b;
            ssTotal += Math.pow(p.y - meanY, 2);
            ssResidual += Math.pow(p.y - predictedY, 2);
        });

        let rSquared;
        if (ssTotal === 0) { // All y-values are the same
            rSquared = 1; // Perfect fit if all y are same and line is flat
        } else {
            rSquared = 1 - (ssResidual / ssTotal);
        }

        return { m, b, rSquared };
    }

    function updateRegression() {
        const { m, b, rSquared } = calculateLinearRegression();

        // Update UI outputs
        if (isNaN(m) || dataPoints.length < 2) {
            slopeOutput.textContent = 'N/A';
            interceptOutput.textContent = 'N/A';
            rSquaredOutput.textContent = 'N/A';
        } else {
            slopeOutput.textContent = m.toFixed(4);
            interceptOutput.textContent = b.toFixed(4);
            rSquaredOutput.textContent = rSquared.toFixed(4);
        }

        // Redraw canvas
        clearCanvas();
        drawPoints();
        if (!isNaN(m) && dataPoints.length >= 2) {
            drawLine(m, b);
        }
    }

    // --- Event Listeners ---
    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left; // Get X relative to canvas
        const y = event.clientY - rect.top;  // Get Y relative to canvas
        dataPoints.push({ x, y });
        updateRegression();
    });

    clearBtn.addEventListener('click', () => {
        dataPoints = [];
        updateRegression(); // This will clear outputs and redraw empty canvas
    });

    // Initial draw when page loads
    updateRegression();
});
