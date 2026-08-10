document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('regressionCanvas');
    const ctx = canvas.getContext('2d');
    const clearDataBtn = document.getElementById('clearDataBtn');
    const equationOutput = document.getElementById('equationOutput');
    const rSquaredOutput = document.getElementById('rSquaredOutput');

    let dataPoints = []; // Stores {x, y} objects

    // Canvas dimensions
    const CANVAS_WIDTH = canvas.width;
    const CANVAS_HEIGHT = canvas.height;
    const PADDING = 30; // Padding for axes

    // Plot area dimensions (subtracting padding for axes)
    const PLOT_WIDTH = CANVAS_WIDTH - 2 * PADDING;
    const PLOT_HEIGHT = CANVAS_HEIGHT - 2 * PADDING;

    // Max values for scaling on the plot (0 to 100 for a consistent demo range)
    const MAX_X_VAL = 100;
    const MAX_Y_VAL = 100;

    // Function to convert real coordinates (0-MAX_VAL) to canvas coordinates
    function toCanvasX(x) {
        return PADDING + (x / MAX_X_VAL) * PLOT_WIDTH;
    }

    function toCanvasY(y) {
        // Canvas Y-axis is inverted (0,0 is top-left), so we subtract from plot height
        return PADDING + PLOT_HEIGHT - (y / MAX_Y_VAL) * PLOT_HEIGHT;
    }

    // Function to convert canvas coordinates to real coordinates
    function toRealX(cx) {
        return ((cx - PADDING) / PLOT_WIDTH) * MAX_X_VAL;
    }

    function toRealY(cy) {
        return ((PADDING + PLOT_HEIGHT - cy) / PLOT_HEIGHT) * MAX_Y_VAL;
    }

    function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw axes
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Y-axis
        ctx.moveTo(PADDING, PADDING);
        ctx.lineTo(PADDING, CANVAS_HEIGHT - PADDING);
        // X-axis
        ctx.moveTo(PADDING, CANVAS_HEIGHT - PADDING);
        ctx.lineTo(CANVAS_WIDTH - PADDING, CANVAS_HEIGHT - PADDING);
        ctx.stroke();

        // Draw axis labels (simple ticks and values)
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';

        // X-axis labels
        ctx.fillText('0', PADDING - 10, CANVAS_HEIGHT - PADDING + 15);
        ctx.fillText(MAX_X_VAL, CANVAS_WIDTH - PADDING - 10, CANVAS_HEIGHT - PADDING + 15);

        // Y-axis labels
        ctx.fillText('0', PADDING - 25, CANVAS_HEIGHT - PADDING + 5);
        ctx.fillText(MAX_Y_VAL, PADDING - 25, PADDING + 5);

        // Draw data points
        ctx.fillStyle = '#3498db';
        dataPoints.forEach(point => {
            const cx = toCanvasX(point.x);
            const cy = toCanvasY(point.y);
            ctx.beginPath();
            ctx.arc(cx, cy, 4, 0, Math.PI * 2); // Draw a circle for each point
            ctx.fill();
        });

        // Calculate and draw regression line if enough data
        if (dataPoints.length >= 2) {
            const { m, b, rSquared } = calculateLinearRegression(dataPoints);

            // Draw regression line spanning the full X range of the plot
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 2;
            ctx.beginPath();
            const startX = 0; // Plot starts at X=0
            const endX = MAX_X_VAL; // Plot ends at X=MAX_X_VAL
            const startY = m * startX + b;
            const endY = m * endX + b;

            ctx.moveTo(toCanvasX(startX), toCanvasY(startY));
            ctx.lineTo(toCanvasX(endX), toCanvasY(endY));
            ctx.stroke();

            // Update UI with equation and R-squared
            equationOutput.textContent = `y = ${m.toFixed(2)}x + ${b.toFixed(2)}`;
            rSquaredOutput.textContent = rSquared.toFixed(4);
        } else {
            // Reset UI if not enough points for regression
            equationOutput.textContent = 'y = mx + b';
            rSquaredOutput.textContent = 'N/A';
        }
    }

    /**
     * Calculates the slope (m), y-intercept (b), and R-squared value
     * for a set of data points using the least squares method.
     */
    function calculateLinearRegression(points) {
        const n = points.length;
        if (n < 2) {
            return { m: 0, b: 0, rSquared: 0 }; // Not enough points for regression
        }

        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumXX = 0;

        points.forEach(p => {
            sumX += p.x;
            sumY += p.y;
            sumXY += p.x * p.y;
            sumXX += p.x * p.x;
        });

        const denominator = (n * sumXX - sumX * sumX);
        let m = 0; // slope
        let b = 0; // y-intercept

        if (denominator !== 0) {
            m = (n * sumXY - sumX * sumY) / denominator;
            b = (sumY - m * sumX) / n;
        } else { 
            // Denominator is zero if all X values are the same.
            // This means a vertical line, which y = mx + b cannot represent.
            // For simplicity, we'll model it as a horizontal line at the average Y.
            b = sumY / n; // Average Y is the intercept for m=0
            m = 0;
        }

        // Calculate R-squared
        let totalSumSquares = 0; // SST (Total Sum of Squares)
        let residualSumSquares = 0; // SSE (Sum of Squares Residual)
        const meanY = sumY / n;

        points.forEach(p => {
            const predictedY = m * p.x + b;
            totalSumSquares += Math.pow(p.y - meanY, 2);
            residualSumSquares += Math.pow(p.y - predictedY, 2);
        });

        let rSquared = 0;
        if (totalSumSquares !== 0) {
            rSquared = 1 - (residualSumSquares / totalSumSquares);
        } else if (residualSumSquares === 0) {
            // If totalSumSquares is 0, all Y values are the same. If residualSumSquares is also 0,
            // then the line perfectly fits, so R-squared is 1.
            rSquared = 1;
        }

        return { m, b, rSquared };
    }

    // Event Listener for adding data points on canvas click
    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = event.clientX - rect.left; // X position relative to canvas
        const clientY = event.clientY - rect.top;   // Y position relative to canvas

        // Ensure click is within the plot area (excluding padding)
        if (clientX >= PADDING && clientX <= CANVAS_WIDTH - PADDING &&
            clientY >= PADDING && clientY <= CANVAS_HEIGHT - PADDING) {
            const realX = toRealX(clientX);
            const realY = toRealY(clientY);
            dataPoints.push({ x: realX, y: realY });
            draw(); // Redraw with new point
        }
    });

    // Event Listener for clearing data
    clearDataBtn.addEventListener('click', () => {
        dataPoints = [];
        draw(); // Redraw empty canvas
    });

    // Initial draw when the page loads
    draw();
});
