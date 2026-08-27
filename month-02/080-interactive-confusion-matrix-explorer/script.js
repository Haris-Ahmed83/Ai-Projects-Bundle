document.addEventListener('DOMContentLoaded', () => {
    const trueLabelsTextarea = document.getElementById('trueLabels');
    const predictedLabelsTextarea = document.getElementById('predictedLabels');
    const generateBtn = document.getElementById('generateBtn');
    const errorMessagesDiv = document.getElementById('errorMessages');
    const confusionMatrixTableDiv = document.getElementById('confusionMatrixTable');
    const metricsResultsDiv = document.getElementById('metricsResults');
    const confusionMatrixTitle = document.getElementById('confusionMatrixTitle');
    const metricsTitle = document.getElementById('metricsTitle');

    // Helper function to parse raw comma-separated labels
    const parseLabels = (rawText) => {
        return rawText.split(',').map(label => label.trim()).filter(label => label !== '');
    };

    // Helper function to display error messages
    const displayError = (message) => {
        errorMessagesDiv.textContent = message;
        errorMessagesDiv.style.display = message ? 'block' : 'none';
        confusionMatrixTableDiv.innerHTML = '';
        metricsResultsDiv.innerHTML = '';
        confusionMatrixTitle.style.display = 'none';
        metricsTitle.style.display = 'none';
    };

    // Function to calculate the confusion matrix
    const calculateConfusionMatrix = (trueLabels, predictedLabels, uniqueClasses) => {
        const matrix = {};
        uniqueClasses.forEach(rClass => {
            matrix[rClass] = {};
            uniqueClasses.forEach(pClass => {
                matrix[rClass][pClass] = 0;
            });
        });

        for (let i = 0; i < trueLabels.length; i++) {
            const trueL = trueLabels[i];
            const predL = predictedLabels[i];
            if (matrix[trueL] && matrix[trueL][predL] !== undefined) {
                matrix[trueL][predL]++;
            } else {
                // This case should ideally be caught by input validation if labels are not in uniqueClasses
                console.warn(`Label pair (${trueL}, ${predL}) not found in unique classes. Skipping.`);
            }
        }
        return matrix;
    };

    // Function to calculate per-class metrics
    const calculateMetrics = (matrix, uniqueClasses) => {
        const metrics = {};
        uniqueClasses.forEach(targetClass => {
            let TP = matrix[targetClass][targetClass] || 0;
            let FP = 0; // Sum of cells in targetClass's column (predicted targetClass) but not targetClass row (true was not targetClass)
            let FN = 0; // Sum of cells in targetClass's row (true targetClass) but not targetClass column (predicted was not targetClass)

            uniqueClasses.forEach(otherClass => {
                if (otherClass !== targetClass) {
                    FP += (matrix[otherClass][targetClass] || 0); // Predicted targetClass, but true was otherClass
                    FN += (matrix[targetClass][otherClass] || 0); // True targetClass, but predicted otherClass
                }
            });

            const precision = (TP + FP === 0) ? 0 : TP / (TP + FP);
            const recall = (TP + FN === 0) ? 0 : TP / (TP + FN);
            const f1 = (precision + recall === 0) ? 0 : 2 * (precision * recall) / (precision + recall);

            metrics[targetClass] = {
                TP, FP, FN, precision, recall, f1
            };
        });
        return metrics;
    };

    // Function to render the confusion matrix table
    const renderConfusionMatrix = (matrix, uniqueClasses) => {
        let html = '<table class="confusion-matrix"><thead><tr><th class="empty-cell"></th>';
        uniqueClasses.forEach(label => { html += `<th>Pred: ${label}</th>`; });
        html += '</tr></thead><tbody>';

        uniqueClasses.forEach(rClass => {
            html += `<tr><th class="true-label-header">True: ${rClass}</th>`;
            uniqueClasses.forEach(pClass => {
                html += `<td>${matrix[rClass][pClass]}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        confusionMatrixTableDiv.innerHTML = html;
        confusionMatrixTitle.style.display = 'block';
    };

    // Function to render per-class metrics
    const renderMetrics = (metrics, uniqueClasses) => {
        let html = '';
        uniqueClasses.forEach(label => {
            const m = metrics[label];
            html += `
                <div class="metric-card">
                    <h3>Class: ${label}</h3>
                    <p><strong>True Positives (TP):</strong> ${m.TP}</p>
                    <p><strong>False Positives (FP):</strong> ${m.FP}</p>
                    <p><strong>False Negatives (FN):</strong> ${m.FN}</p>
                    <p><strong>Precision:</strong> ${m.precision.toFixed(2)}</p>
                    <p><strong>Recall:</strong> ${m.recall.toFixed(2)}</p>
                    <p><strong>F1-Score:</strong> ${m.f1.toFixed(2)}</p>
                </div>
            `;
        });
        metricsResultsDiv.innerHTML = html;
        metricsTitle.style.display = 'block';
    };

    // Event listener for the generate button
    generateBtn.addEventListener('click', () => {
        displayError(''); // Clear previous errors and results

        const trueLabelsRaw = trueLabelsTextarea.value;
        const predictedLabelsRaw = predictedLabelsTextarea.value;

        const trueLabels = parseLabels(trueLabelsRaw);
        const predictedLabels = parseLabels(predictedLabelsRaw);

        if (trueLabels.length === 0 || predictedLabels.length === 0) {
            displayError('Please enter both true and predicted labels.');
            return;
        }

        if (trueLabels.length !== predictedLabels.length) {
            displayError(`True labels (${trueLabels.length}) and predicted labels (${predictedLabels.length}) must have the same number of entries.`);
            return;
        }

        // Gather all unique classes from both true and predicted labels and sort them for consistent display
        const allLabels = [...new Set([...trueLabels, ...predictedLabels])].sort();

        if (allLabels.length === 0) {
            displayError('No valid classes found from input after parsing.');
            return;
        }

        const matrix = calculateConfusionMatrix(trueLabels, predictedLabels, allLabels);
        const metrics = calculateMetrics(matrix, allLabels);

        renderConfusionMatrix(matrix, allLabels);
        renderMetrics(metrics, allLabels);
    });
});
