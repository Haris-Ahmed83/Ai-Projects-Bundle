document.addEventListener('DOMContentLoaded', () => {
    const ageInput = document.getElementById('age');
    const incomeInput = document.getElementById('income');
    const educationInput = document.getElementById('education');
    const explainBtn = document.getElementById('explainBtn');
    const predictionOutput = document.getElementById('predictionOutput');
    const explanationChartSVG = document.getElementById('explanationChart');
    const explanationTextElem = document.getElementById('explanationText');

    // --- Simulated ML Model ---
    // This function mimics a simple linear regression model and its explanation.
    // In a real application, this would be an API call to a backend ML model,
    // sending 'features' and receiving 'prediction' and 'explanation' data.
    function simulateMLModel(features) {
        const { age, income, education } = features;

        // Model coefficients (arbitrary for simulation)
        const coeffAge = 0.8; // e.g., older age increases predicted value
        const coeffIncome = 0.5; // e.g., higher income increases predicted value
        const coeffEducation = -0.3; // e.g., more education decreases predicted value (for some hypothetical model)
        const bias = 10; // Baseline prediction value

        // Calculate individual contributions to the prediction
        const contributionAge = coeffAge * age;
        const contributionIncome = coeffIncome * income;
        const contributionEducation = coeffEducation * education;

        // Simulated prediction (sum of contributions + bias)
        const prediction = contributionAge + contributionIncome + contributionEducation + bias;

        // Explanation data (feature contributions)
        // This structure allows for easy visualization of individual impacts.
        const explanation = [
            { feature: 'Age', contribution: contributionAge },
            { feature: 'Income', contribution: contributionIncome },
            { feature: 'Education Years', contribution: contributionEducation },
            { feature: 'Baseline/Bias', contribution: bias } // Represents the model's intercept/default output
        ];

        return { prediction: prediction, explanation: explanation };
    }

    // --- Visualization Function ---
    function renderExplanationChart(explanationData) {
        // Clear previous chart and text
        explanationChartSVG.innerHTML = '';
        explanationTextElem.textContent = '';

        const svgWidth = explanationChartSVG.clientWidth; // Get actual width of the SVG container
        const margin = { top: 20, right: 30, bottom: 20, left: 100 }; // Margins for chart content
        const chartWidth = svgWidth - margin.left - margin.right;

        // Find max absolute contribution to set the scale range symmetrically around zero
        const maxContribution = Math.max(...explanationData.map(d => Math.abs(d.contribution)));
        const scaleRange = maxContribution * 1.2; // Add a buffer for better visual spacing

        // X-axis scale function: maps contribution values to pixel positions on the x-axis
        // Maps [-scaleRange, scaleRange] to [0, chartWidth]
        const xScale = (value) => {
            return (value + scaleRange) / (2 * scaleRange) * chartWidth;
        };

        const barHeight = 25;
        const barPadding = 10;
        const totalBarSpace = barHeight + barPadding;
        const numBars = explanationData.length;

        // Dynamically adjust SVG height based on number of bars and margins
        const requiredSvgHeight = numBars * totalBarSpace + margin.top + margin.bottom;
        explanationChartSVG.setAttribute('height', requiredSvgHeight);
        const actualChartHeight = numBars * totalBarSpace; // Total height occupied by bars

        // Create a group element for the chart content, translated by margins
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
        explanationChartSVG.appendChild(g);

        // Render bars for each feature contribution
        explanationData.forEach((d, i) => {
            const barY = i * totalBarSpace;
            let barX, barWidth;

            if (d.contribution >= 0) {
                // Positive contribution: bar starts at zero line, extends right
                barX = xScale(0);
                barWidth = xScale(d.contribution) - xScale(0);
            } else {
                // Negative contribution: bar starts at its value, extends to zero line (left)
                barX = xScale(d.contribution);
                barWidth = xScale(0) - xScale(d.contribution);
            }

            // Bar rectangle
            const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bar.setAttribute('x', barX);
            bar.setAttribute('y', barY);
            bar.setAttribute('width', barWidth);
            bar.setAttribute('height', barHeight);
            bar.setAttribute('class', `bar ${d.contribution >= 0 ? 'positive' : 'negative'}`);
            g.appendChild(bar);

            // Feature label (to the left of the chart area)
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', -5); // Position to the left of the chart area's start
            label.setAttribute('y', barY + barHeight / 2);
            label.setAttribute('class', 'bar-label');
            label.setAttribute('text-anchor', 'end'); // Align text to the end (right) to hug the chart
            label.textContent = d.feature;
            g.appendChild(label);

            // Contribution value label (near the end of the bar)
            const valueLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            const valueX = d.contribution >= 0 ? xScale(d.contribution) + 5 : xScale(d.contribution) - 5;
            valueLabel.setAttribute('x', valueX);
            valueLabel.setAttribute('y', barY + barHeight / 2);
            valueLabel.setAttribute('class', 'bar-value');
            valueLabel.setAttribute('text-anchor', d.contribution >= 0 ? 'start' : 'end'); // Align based on direction
            valueLabel.textContent = d.contribution.toFixed(2);
            g.appendChild(valueLabel);
        });

        // Zero line (vertical line at x=0 contribution)
        const zeroLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        zeroLine.setAttribute('x1', xScale(0));
        zeroLine.setAttribute('y1', 0);
        zeroLine.setAttribute('x2', xScale(0));
        zeroLine.setAttribute('y2', actualChartHeight); // Extends across all bars
        zeroLine.setAttribute('class', 'zero-line');
        g.appendChild(zeroLine);

        // --- Textual Summary --- 
        // Provides a prose explanation for accessibility and additional detail.
        let summaryText = `The model's prediction is influenced by these factors: `;
        explanationData.forEach((d, i) => {
            summaryText += `${d.feature} contributes ${d.contribution.toFixed(2)} ${d.contribution >= 0 ? '(positively)' : '(negatively)'}`;
            if (i < explanationData.length - 1) summaryText += ', ';
            else summaryText += '.';
        });
        explanationTextElem.textContent = summaryText;
    }

    // --- Event Listener for the 'Predict & Explain' button ---
    explainBtn.addEventListener('click', () => {
        // Get input values and parse them to numbers
        const age = parseFloat(ageInput.value);
        const income = parseFloat(incomeInput.value);
        const education = parseFloat(educationInput.value);

        // Basic input validation
        if (isNaN(age) || isNaN(income) || isNaN(education) || age < 1 || income < 0 || education < 0) {
            predictionOutput.textContent = 'Please enter valid numerical inputs for all fields.';
            explanationChartSVG.innerHTML = ''; // Clear chart
            explanationTextElem.textContent = ''; // Clear text explanation
            return;
        }

        const features = { age, income, education };
        const result = simulateMLModel(features);

        // Display the prediction and render the explanation chart
        predictionOutput.textContent = result.prediction.toFixed(2);
        renderExplanationChart(result.explanation);
    });

    // Initial call to populate the chart on page load with default values
    explainBtn.click();
});
