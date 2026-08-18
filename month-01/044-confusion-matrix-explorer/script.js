document.addEventListener('DOMContentLoaded', () => {
    const tpInput = document.getElementById('tp');
    const fpInput = document.getElementById('fp');
    const fnInput = document.getElementById('fn');
    const tnInput = document.getElementById('tn');
    const calculateBtn = document.getElementById('calculateBtn');

    const matrixTp = document.getElementById('matrix-tp');
    const matrixFp = document.getElementById('matrix-fp');
    const matrixFn = document.getElementById('matrix-fn');
    const matrixTn = document.getElementById('matrix-tn');

    const accuracySpan = document.getElementById('accuracy');
    const precisionSpan = document.getElementById('precision');
    const recallSpan = document.getElementById('recall');
    const f1scoreSpan = document.getElementById('f1score');

    function calculateMetrics() {
        const tp = parseInt(tpInput.value) || 0;
        const fp = parseInt(fpInput.value) || 0;
        const fn = parseInt(fnInput.value) || 0;
        const tn = parseInt(tnInput.value) || 0;

        // Update confusion matrix display
        matrixTp.textContent = tp;
        matrixFp.textContent = fp;
        matrixFn.textContent = fn;
        matrixTn.textContent = tn;

        const total = tp + fp + fn + tn;

        // Calculate metrics
        const accuracy = total === 0 ? 0 : (tp + tn) / total;
        const precision = (tp + fp) === 0 ? 0 : tp / (tp + fp);
        const recall = (tp + fn) === 0 ? 0 : tp / (tp + fn);
        const f1Numerator = 2 * precision * recall;
        const f1Denominator = precision + recall;
        const f1Score = f1Denominator === 0 ? 0 : f1Numerator / f1Denominator;

        // Display metrics (formatted to 2 decimal places)
        accuracySpan.textContent = (accuracy * 100).toFixed(2) + '%';
        precisionSpan.textContent = (precision * 100).toFixed(2) + '%';
        recallSpan.textContent = (recall * 100).toFixed(2) + '%';
        f1scoreSpan.textContent = (f1Score * 100).toFixed(2) + '%';
    }

    // Attach event listeners for button and live input changes
    calculateBtn.addEventListener('click', calculateMetrics);
    tpInput.addEventListener('input', calculateMetrics);
    fpInput.addEventListener('input', calculateMetrics);
    fnInput.addEventListener('input', calculateMetrics);
    tnInput.addEventListener('input', calculateMetrics);

    // Initial calculation on page load to display default values
    calculateMetrics();
});
