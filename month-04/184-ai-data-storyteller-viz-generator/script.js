document.addEventListener('DOMContentLoaded', () => {
    const csvFileInput = document.getElementById('csvFileInput');
    const generateBtn = document.getElementById('generateBtn');
    const uploadMessage = document.getElementById('uploadMessage');
    const dataStoryOutput = document.getElementById('dataStoryOutput');
    const dataVizOutput = document.getElementById('dataVizOutput');
    const chartSvg = document.getElementById('chartSvg');

    let uploadedData = null; // To store parsed CSV data

    // --- Utility Functions ---

    // Basic CSV parser
    function parseCSV(text) {
        const lines = text.trim().split('\n');
        if (lines.length === 0) return null;

        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index];
                });
                data.push(row);
            }
        }
        return { headers, data };
    }

    // Simple "AI" analysis simulation
    function analyzeData(parsedData) {
        if (!parsedData || parsedData.data.length === 0) {
            return {
                summary: "No data available for analysis.",
                vizData: []
            };
        }

        const { headers, data } = parsedData;
        const numRows = data.length;
        const numCols = headers.length;

        let numericColumns = [];
        let categoricalColumns = [];

        // Identify column types and gather basic stats
        headers.forEach(header => {
            // Check if the first non-empty value in the column is numeric
            const firstNumericCandidate = data.find(row => row[header] !== '' && !isNaN(parseFloat(row[header])));
            if (firstNumericCandidate && isFinite(parseFloat(firstNumericCandidate[header]))) {
                numericColumns.push(header);
            } else {
                categoricalColumns.push(header);
            }
        });

        let mainNumericCol = numericColumns[0];
        let mainCategoricalCol = categoricalColumns[0];

        let totalValue = 0;
        let categoryCounts = {};
        if (mainNumericCol) {
            data.forEach(row => {
                totalValue += parseFloat(row[mainNumericCol] || 0);
            });
        }
        if (mainCategoricalCol) {
            data.forEach(row => {
                const category = row[mainCategoricalCol];
                if (category) {
                    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
                }
            });
        }

        // Prepare data for a simple bar chart (e.g., category counts or first few numeric values)
        let vizData = [];
        if (Object.keys(categoryCounts).length > 0) {
            vizData = Object.entries(categoryCounts).map(([label, value]) => ({
                label: label.length > 15 ? label.substring(0, 12) + '...' : label, // Truncate long labels
                value
            }));
        } else if (mainNumericCol) {
            // If no categorical, just plot first few numeric values (up to 10 for simplicity)
            vizData = data.slice(0, Math.min(data.length, 10)).map((row, index) => ({
                label: `Entry ${index + 1}`,
                value: parseFloat(row[mainNumericCol] || 0)
            }));
        }

        return {
            summary: {
                numRows,
                numCols,
                headers,
                firstFewRows: data.slice(0, 3),
                mainNumericCol,
                mainCategoricalCol,
                totalValue: mainNumericCol ? totalValue.toFixed(2) : 'N/A',
                categoryCounts: mainCategoricalCol ? categoryCounts : null
            },
            vizData: vizData
        };
    }

    // "NLG" simulation
    function generateStory(analysisResult) {
        const { summary } = analysisResult;
        if (summary === "No data available for analysis.") {
            return "<p>Please upload a valid CSV file to generate a story.</p>";
        }

        let story = `
            <p><strong>Dataset Overview:</strong></p>
            <p>You've uploaded a dataset containing <strong>${summary.numRows} rows</strong> and <strong>${summary.numCols} columns</strong>.</p>
            <p>The dataset includes headers such as: <em>${summary.headers.join(', ')}</em>.</p>
        `;

        if (summary.mainNumericCol) {
            story += `<p>One prominent numeric column identified is "<strong>${summary.mainNumericCol}</strong>". The sum of values in this column is approximately <strong>${summary.totalValue}</strong>.</p>`;
        }
        if (summary.mainCategoricalCol) {
            story += `<p>A key categorical column is "<strong>${summary.mainCategoricalCol}</strong>". Here's a breakdown of its categories:</p><ul>`;
            // Sort categories for consistent output
            Object.entries(summary.categoryCounts).sort(([a,],[b,]]) => a.localeCompare(b)).forEach(([category, count]) => {
                story += `<li><strong>${category}</strong>: ${count} occurrences</li>`;
            });
            story += `</ul>`;
        }

        story += `<p><strong>Initial Insights:</strong></p>`;
        if (summary.numRows > 0) {
            const sampleValues = Object.values(summary.firstFewRows[0]).filter(v => v !== '').slice(0, 3).join(', ');
            story += `<p>The first few entries suggest data related to <em>${sampleValues || 'various unspecified items'}...</em></p>`;
            story += `<p>Based on this preliminary analysis, we can infer patterns related to ${summary.mainCategoricalCol || 'various categories'} and their corresponding ${summary.mainNumericCol || 'quantities'}. Further deep dive could reveal trends and correlations.</p>`;
        } else {
            story += `<p>The dataset is empty, so no specific insights can be generated.</p>`;
        }

        return story;
    }

    // Basic SVG Bar Chart Visualization
    function generateVisualization(vizData) {
        if (!vizData || vizData.length === 0) {
            dataVizOutput.innerHTML = "<p>No suitable data found to generate a visualization.</p>";
            chartSvg.style.display = 'none';
            return;
        }

        // Clear previous SVG content
        chartSvg.innerHTML = '';
        chartSvg.style.display = 'block'; // Make sure SVG is visible

        const svgWidth = chartSvg.clientWidth || 400; // Fallback width
        const svgHeight = chartSvg.clientHeight || 300; // Fallback height
        const margin = { top: 20, right: 20, bottom: 60, left: 40 }; // Increased bottom for labels
        const chartWidth = svgWidth - margin.left - margin.right;
        const chartHeight = svgHeight - margin.top - margin.bottom;

        const maxVal = Math.max(...vizData.map(d => d.value));
        const barSpacing = 10; // Space between bars
        const barWidth = (chartWidth / vizData.length) - barSpacing;

        // Create a group for the chart content, shifted by margins
        const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
        chartSvg.appendChild(chartGroup);

        vizData.forEach((d, i) => {
            const barHeight = (d.value / maxVal) * chartHeight;
            const x = i * (barWidth + barSpacing);
            const y = chartHeight - barHeight;

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', barWidth);
            rect.setAttribute('height', barHeight);
            rect.setAttribute('fill', '#3498db');
            rect.setAttribute('rx', '3'); // Rounded corners
            rect.setAttribute('ry', '3');
            chartGroup.appendChild(rect);

            // Add value label
            const textValue = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textValue.setAttribute('x', x + barWidth / 2);
            textValue.setAttribute('y', y - 5);
            textValue.setAttribute('text-anchor', 'middle');
            textValue.setAttribute('font-size', '10px');
            textValue.setAttribute('fill', '#333');
            textValue.textContent = d.value;
            chartGroup.appendChild(textValue);

            // Add category label
            const textLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textLabel.setAttribute('x', x + barWidth / 2);
            textLabel.setAttribute('y', chartHeight + 15); // Position below the bar
            textLabel.setAttribute('text-anchor', 'middle');
            textLabel.setAttribute('font-size', '10px');
            textLabel.setAttribute('fill', '#555');
            textLabel.textContent = d.label;
            // Basic rotation for labels if many bars
            if (vizData.length > 5) {
                textLabel.setAttribute('transform', `rotate(45, ${x + barWidth / 2}, ${chartHeight + 15})`);
                textLabel.setAttribute('text-anchor', 'start');
            }
            chartGroup.appendChild(textLabel);
        });

        // Add X-axis line
        const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxis.setAttribute('x1', 0);
        xAxis.setAttribute('y1', chartHeight);
        xAxis.setAttribute('x2', chartWidth);
        xAxis.setAttribute('y2', chartHeight);
        xAxis.setAttribute('stroke', '#333');
        xAxis.setAttribute('stroke-width', '1');
        chartGroup.appendChild(xAxis);

        // Add Y-axis line
        const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        yAxis.setAttribute('x1', 0);
        yAxis.setAttribute('y1', 0);
        yAxis.setAttribute('x2', 0);
        yAxis.setAttribute('y2', chartHeight);
        yAxis.setAttribute('stroke', '#333');
        yAxis.setAttribute('stroke-width', '1');
        chartGroup.appendChild(yAxis);

        // Add Y-axis max label
        const yMaxLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yMaxLabel.setAttribute('x', -5);
        yMaxLabel.setAttribute('y', 10);
        yMaxLabel.setAttribute('text-anchor', 'end');
        yMaxLabel.setAttribute('font-size', '10px');
        yMaxLabel.setAttribute('fill', '#333');
        yMaxLabel.textContent = maxVal;
        chartGroup.appendChild(yMaxLabel);

        dataVizOutput.innerHTML = ''; // Clear initial placeholder
        dataVizOutput.appendChild(chartSvg);
    }

    // --- Event Handlers ---

    csvFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type === 'text/csv' || file.name.endsWith('.csv')) { // Also check file extension for broader compatibility
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        uploadedData = parseCSV(e.target.result);
                        if (uploadedData && uploadedData.data.length > 0) {
                            uploadMessage.textContent = `File "${file.name}" loaded successfully. Ready to generate.`;
                            uploadMessage.style.color = 'green';
                            generateBtn.disabled = false;
                        } else {
                            uploadedData = null;
                            uploadMessage.textContent = `File "${file.name}" is empty or invalid.`;
                            uploadMessage.style.color = 'orange';
                            generateBtn.disabled = true;
                        }
                    } catch (error) {
                        uploadedData = null;
                        uploadMessage.textContent = `Error parsing file: ${error.message}`;
                        uploadMessage.style.color = 'red';
                        generateBtn.disabled = true;
                    }
                };
                reader.onerror = () => {
                    uploadedData = null;
                    uploadMessage.textContent = 'Error reading file.';
                    uploadMessage.style.color = 'red';
                    generateBtn.disabled = true;
                };
                reader.readAsText(file);
            } else {
                uploadedData = null;
                uploadMessage.textContent = 'Please upload a CSV file.';
                uploadMessage.style.color = 'red';
                generateBtn.disabled = true;
            }
        } else {
            uploadedData = null;
            uploadMessage.textContent = 'No file selected.';
            uploadMessage.style.color = '#777';
            generateBtn.disabled = true;
        }
    });

    generateBtn.addEventListener('click', () => {
        if (!uploadedData) {
            dataStoryOutput.innerHTML = '<p style="color: red;">No data uploaded. Please upload a CSV file first.</p>';
            dataVizOutput.innerHTML = '<p style="color: red;">No data uploaded.</p>';
            chartSvg.style.display = 'none';
            return;
        }

        dataStoryOutput.innerHTML = '<p>Generating story and visualization... (This is a mock AI process)</p>';
        dataVizOutput.innerHTML = '<p>Generating visualization...</p>';
        chartSvg.style.display = 'none';

        // Simulate API call or complex processing delay
        setTimeout(() => {
            const analysisResult = analyzeData(uploadedData);
            const story = generateStory(analysisResult);
            dataStoryOutput.innerHTML = story;

            if (analysisResult.vizData.length > 0) {
                generateVisualization(analysisResult.vizData);
            } else {
                dataVizOutput.innerHTML = '<p>Could not generate a visualization for this data. Ensure it contains numeric or categorical columns.</p>';
                chartSvg.style.display = 'none';
            }
            uploadMessage.textContent = 'Generation complete!';
            uploadMessage.style.color = 'green';
        }, 1500); // Simulate 1.5 second processing time
    });
});
