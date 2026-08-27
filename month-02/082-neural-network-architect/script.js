document.addEventListener('DOMContentLoaded', () => {
    const layerTypeSelect = document.getElementById('layerType');
    const unitsInput = document.getElementById('units');
    const activationSelect = document.getElementById('activation');
    const addLayerBtn = document.getElementById('addLayerBtn');
    const networkDisplay = document.getElementById('networkDisplay');
    const epochsInput = document.getElementById('epochs');
    const learningRateInput = document.getElementById('learningRate');
    const trainBtn = document.getElementById('trainBtn');
    const trainingOutput = document.getElementById('trainingOutput');
    const networkVizCanvas = document.getElementById('networkVizCanvas');
    const ctx = networkVizCanvas.getContext('2d');

    let layersConfig = [];
    let model = null;
    let inputShape = [2]; // For a simple XOR-like or linear regression problem (2 features)

    // --- UI Update Functions ---
    const updateNetworkDisplay = () => {
        networkDisplay.innerHTML = '';
        if (layersConfig.length === 0) {
            networkDisplay.innerHTML = 'No layers added yet. Add a Dense layer to start.';
            trainBtn.disabled = true;
            return;
        }

        trainBtn.disabled = false;

        // Input Layer placeholder
        const inputLayerDiv = document.createElement('div');
        inputLayerDiv.className = 'network-layer';
        inputLayerDiv.textContent = `Input Layer (shape: ${inputShape.join('x')})`;
        networkDisplay.appendChild(inputLayerDiv);

        layersConfig.forEach((layer, index) => {
            const layerDiv = document.createElement('div');
            layerDiv.className = 'network-layer';
            layerDiv.textContent = `Layer ${index + 1}: ${layer.type} (Units: ${layer.units}, Activation: ${layer.activation})`;
            networkDisplay.appendChild(layerDiv);
        });
        drawNetworkVisualization();
    };

    const appendTrainingOutput = (message) => {
        trainingOutput.textContent += message + '\n';
        trainingOutput.scrollTop = trainingOutput.scrollHeight;
    };

    // --- Network Visualization --- (Conceptual drawing)
    const drawNetworkVisualization = () => {
        ctx.clearRect(0, 0, networkVizCanvas.width, networkVizCanvas.height);
        if (layersConfig.length === 0) return;

        const layerCount = layersConfig.length + 1; // +1 for input layer
        const nodeRadius = 10;
        const horizontalPadding = 40;
        const verticalPadding = 30;
        const layerSpacing = (networkVizCanvas.width - 2 * horizontalPadding) / (layerCount - 1 || 1);

        const layerNodes = [];

        // Draw Input Layer
        const inputLayerNodes = Math.min(inputShape[0], 5); // Max 5 nodes for visualization clarity
        layerNodes.push([]);
        for (let i = 0; i < inputLayerNodes; i++) {
            const x = horizontalPadding;
            const y = networkVizCanvas.height / 2 + (i - (inputLayerNodes - 1) / 2) * (nodeRadius * 3);
            ctx.beginPath();
            ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#2ecc71';
            ctx.fill();
            ctx.strokeStyle = '#27ae60';
            ctx.stroke();
            layerNodes[0].push({ x, y });
        }
        if (inputShape[0] > 5) {
            ctx.font = '10px Arial';
            ctx.fillStyle = '#333';
            ctx.fillText(`... ${inputShape[0] - 5} more`, horizontalPadding - 20, networkVizCanvas.height / 2 + (inputLayerNodes - 1) / 2 * (nodeRadius * 3) + nodeRadius * 2);
        }

        // Draw Hidden/Output Layers
        layersConfig.forEach((layer, layerIndex) => {
            const numNodes = Math.min(layer.units, 7); // Max 7 nodes for visualization clarity
            const x = horizontalPadding + (layerIndex + 1) * layerSpacing;
            layerNodes.push([]);
            for (let i = 0; i < numNodes; i++) {
                const y = networkVizCanvas.height / 2 + (i - (numNodes - 1) / 2) * (nodeRadius * 2.5);
                ctx.beginPath();
                ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
                ctx.fillStyle = layerIndex === layersConfig.length - 1 ? '#e74c3c' : '#3498db'; // Output is red, hidden is blue
                ctx.fill();
                ctx.strokeStyle = layerIndex === layersConfig.length - 1 ? '#c0392b' : '#2980b9';
                ctx.stroke();
                layerNodes[layerIndex + 1].push({ x, y });
            }
            if (layer.units > 7) {
                ctx.font = '10px Arial';
                ctx.fillStyle = '#333';
                ctx.fillText(`... ${layer.units - 7} more`, x - 20, networkVizCanvas.height / 2 + (numNodes - 1) / 2 * (nodeRadius * 2.5) + nodeRadius * 2);
            }
        });

        // Draw Connections
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < layerNodes.length - 1; i++) {
            const currentLayer = layerNodes[i];
            const nextLayer = layerNodes[i + 1];
            currentLayer.forEach(node1 => {
                nextLayer.forEach(node2 => {
                    ctx.beginPath();
                    ctx.moveTo(node1.x + nodeRadius, node1.y);
                    ctx.lineTo(node2.x - nodeRadius, node2.y);
                    ctx.stroke();
                });
            });
        }
    };

    // --- Event Listeners ---
    addLayerBtn.addEventListener('click', () => {
        const type = layerTypeSelect.value;
        const units = parseInt(unitsInput.value);
        const activation = activationSelect.value;

        if (isNaN(units) || units <= 0) {
            alert('Please enter a valid number of units (greater than 0).');
            return;
        }

        layersConfig.push({ type, units, activation });
        updateNetworkDisplay();
        unitsInput.value = 10; // Reset for next input
    });

    trainBtn.addEventListener('click', async () => {
        if (layersConfig.length === 0) {
            alert('Please add at least one layer before training.');
            return;
        }

        trainingOutput.textContent = 'Starting training...\n';
        trainBtn.disabled = true;

        const epochs = parseInt(epochsInput.value);
        const learningRate = parseFloat(learningRateInput.value);

        if (isNaN(epochs) || epochs <= 0 || isNaN(learningRate) || learningRate <= 0) {
            alert('Please enter valid positive numbers for epochs and learning rate.');
            trainBtn.disabled = false;
            return;
        }

        // --- 1. Generate Sample Data (Simple Linear Regression: y = 2x + 1 + noise) ---
        appendTrainingOutput('Generating sample data...');
        const numSamples = 100;
        const xs = tf.randomUniform([numSamples, inputShape[0]], -1, 1); // 2 features, values from -1 to 1
        const trueWeights = tf.tensor2d([[2], [0.5]]); // Example weights for y = 2x1 + 0.5x2 + 1
        const trueBias = tf.tensor1d([1]);
        const ys = xs.matMul(trueWeights).add(trueBias).add(tf.randomNormal([numSamples, 1], 0, 0.1)); // Add some noise
        appendTrainingOutput(`Generated ${numSamples} samples with ${inputShape[0]} features.`);

        // --- 2. Build the Model ---
        appendTrainingOutput('Building model...');
        model = tf.sequential();

        layersConfig.forEach((layer, index) => {
            if (layer.type === 'dense') {
                if (index === 0) {
                    model.add(tf.layers.dense({ units: layer.units, activation: layer.activation, inputShape: inputShape }));
                } else {
                    model.add(tf.layers.dense({ units: layer.units, activation: layer.activation }));
                }
            }
        });

        // --- 3. Compile the Model ---
        model.compile({
            optimizer: tf.train.adam(learningRate),
            loss: 'meanSquaredError' // Suitable for linear regression
        });
        appendTrainingOutput('Model compiled with Adam optimizer and Mean Squared Error loss.');
        // model.summary(); // For debugging

        // --- 4. Train the Model ---
        appendTrainingOutput(`Training model for ${epochs} epochs...`);
        await model.fit(xs, ys, {
            epochs: epochs,
            callbacks: {
                onEpochEnd: async (epoch, logs) => {
                    appendTrainingOutput(`Epoch ${epoch + 1}/${epochs} - Loss: ${logs.loss.toFixed(4)}`);
                },
                onTrainEnd: () => {
                    appendTrainingOutput('Training complete!');
                }
            }
        });

        // --- 5. Evaluate and Predict ---
        appendTrainingOutput('Evaluating model...');
        const evalResult = model.evaluate(xs, ys);
        appendTrainingOutput(`Final Test Loss: ${evalResult.dataSync()[0].toFixed(4)}`);

        // Make a prediction example
        const sampleInput = tf.tensor2d([[0.5, -0.2]]); // Example new input
        const prediction = model.predict(sampleInput);
        appendTrainingOutput(`Prediction for [0.5, -0.2]: ${prediction.dataSync()[0].toFixed(4)}`);

        xs.dispose();
        ys.dispose();
        sampleInput.dispose();
        prediction.dispose();
        trueWeights.dispose();
        trueBias.dispose();
        
        appendTrainingOutput('TensorFlow.js tensors disposed.');

        trainBtn.disabled = false;
    });

    // Initial setup
    updateNetworkDisplay();
});
