// script.js

// --- DOM Elements ---
const datasetInput = document.getElementById('dataset-input');
const targetColumnInput = document.getElementById('target-column');
const maxDepthInput = document.getElementById('max-depth');
const buildTreeBtn = document.getElementById('build-tree-btn');
const treeSvg = document.getElementById('tree-svg');
const treeContainer = document.getElementById('tree-container');

// --- Constants for SVG Layout ---
const NODE_WIDTH = 180;
const NODE_HEIGHT = 80;
const HORIZONTAL_SPACING = 50; // Spacing between sibling nodes
const VERTICAL_SPACING = 100; // Spacing between parent and child levels

let allData = [];
let featureNames = [];
let targetColumn = '';
let featureTypes = {}; // To store if a feature is numerical or categorical

// --- Event Listeners ---
buildTreeBtn.addEventListener('click', buildAndVisualizeTree);

// --- Core Functions ---

function buildAndVisualizeTree() {
    const csvString = datasetInput.value.trim();
    targetColumn = targetColumnInput.value.trim();
    const maxDepth = parseInt(maxDepthInput.value) || 0; // 0 means no limit

    if (!csvString || !targetColumn) {
        alert('Please provide dataset and target column.');
        return;
    }

    try {
        allData = parseCSV(csvString);
        if (allData.length === 0) {
            alert('Parsed dataset is empty.');
            return;
        }
        if (!allData[0].hasOwnProperty(targetColumn)) {
            alert(`Target column "${targetColumn}" not found in dataset.`);
            return;
        }

        featureNames = Object.keys(allData[0]).filter(f => f !== targetColumn);
        featureTypes = detectFeatureTypes(allData, featureNames);

        // Build the tree
        const tree = buildTree(allData, featureNames, targetColumn, maxDepth, 0);

        // Visualize the tree
        drawTree(tree);

    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred: ' + error.message);
    }
}

// --- Data Parsing and Preprocessing ---

function parseCSV(csvString) {
    const lines = csvString.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length !== headers.length) {
            console.warn(`Skipping line ${i + 1} due to column count mismatch.`);
            continue;
        }
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index];
        });
        data.push(row);
    }
    return data;
}

function detectFeatureTypes(data, features) {
    const types = {};
    if (data.length === 0) return types;

    features.forEach(feature => {
        // Take a sample of values to decide type
        const sampleValues = data.slice(0, Math.min(data.length, 10)).map(row => row[feature]);
        // Consider a feature numerical if all sample values can be parsed as numbers
        const areAllNumbers = sampleValues.every(val => !isNaN(Number(val)) && val !== '');
        types[feature] = areAllNumbers ? 'numerical' : 'categorical';
    });
    return types;
}

// --- Decision Tree Algorithm ---

function buildTree(samples, features, targetCol, maxDepth, currentDepth) {
    // Base Case 1: All samples have the same target value (pure node)
    const uniqueTargets = [...new Set(samples.map(s => s[targetCol]))];
    if (uniqueTargets.length === 1) {
        return {
            type: 'leaf',
            prediction: uniqueTargets[0],
            samplesCount: samples.length,
            impurity: 0,
            distribution: getDistribution(samples, targetCol)
        };
    }

    // Base Case 2: No more features to split on OR max depth reached
    if (features.length === 0 || (maxDepth !== 0 && currentDepth >= maxDepth)) {
        return {
            type: 'leaf',
            prediction: getMajorityClass(samples, targetCol),
            samplesCount: samples.length,
            impurity: calculateGiniImpurity(samples, targetCol),
            distribution: getDistribution(samples, targetCol)
        };
    }

    // Find the best split
    let bestGiniGain = -1;
    let bestSplit = null;
    let bestSubsets = null;

    const currentGini = calculateGiniImpurity(samples, targetCol);

    for (const feature of features) {
        const uniqueValues = [...new Set(samples.map(s => s[feature]))];

        if (featureTypes[feature] === 'numerical') {
            // For numerical, sort unique values and consider midpoints as split points
            const sortedValues = uniqueValues.map(Number).sort((a, b) => a - b);
            for (let i = 0; i < sortedValues.length - 1; i++) {
                const splitValue = (sortedValues[i] + sortedValues[i + 1]) / 2;
                const left = samples.filter(s => Number(s[feature]) <= splitValue);
                const right = samples.filter(s => Number(s[feature]) > splitValue);

                if (left.length === 0 || right.length === 0) continue; // Invalid split

                const giniGain = currentGini - calculateWeightedGini(left, right, targetCol);

                if (giniGain > bestGiniGain) {
                    bestGiniGain = giniGain;
                    bestSplit = { feature, value: splitValue, type: 'numerical' };
                    bestSubsets = { left, right };
                }
            }
        } else { // Categorical
            for (const splitValue of uniqueValues) {
                // Create a binary split: is it this value, or not?
                const left = samples.filter(s => s[feature] === splitValue);
                const right = samples.filter(s => s[feature] !== splitValue);

                if (left.length === 0 || right.length === 0) continue; // Invalid split

                const giniGain = currentGini - calculateWeightedGini(left, right, targetCol);

                if (giniGain > bestGiniGain) {
                    bestGiniGain = giniGain;
                    bestSplit = { feature, value: splitValue, type: 'categorical' };
                    bestSubsets = { left, right };
                }
            }
        }
    }

    // Base Case 3: No good split found (e.g., all splits result in 0 or negative gain)
    if (bestGiniGain <= 0 || !bestSplit) {
        return {
            type: 'leaf',
            prediction: getMajorityClass(samples, targetCol),
            samplesCount: samples.length,
            impurity: currentGini,
            distribution: getDistribution(samples, targetCol)
        };
    }

    // Create a new internal node and recursively build children
    // All features are kept available for child nodes (CART-like behavior)
    const children = [
        buildTree(bestSubsets.left, features, targetCol, maxDepth, currentDepth + 1),
        buildTree(bestSubsets.right, features, targetCol, maxDepth, currentDepth + 1)
    ];

    return {
        type: 'node',
        feature: bestSplit.feature,
        splitValue: bestSplit.value,
        splitType: bestSplit.type,
        impurity: currentGini,
        giniGain: bestGiniGain,
        samplesCount: samples.length,
        distribution: getDistribution(samples, targetCol),
        children: children
    };
}

// --- Gini Impurity and Helper Calculations ---

function calculateGiniImpurity(samples, targetCol) {
    if (samples.length === 0) return 0;

    const classCounts = {};
    samples.forEach(s => {
        const target = s[targetCol];
        classCounts[target] = (classCounts[target] || 0) + 1;
    });

    let impurity = 1;
    for (const className in classCounts) {
        const prob = classCounts[className] / samples.length;
        impurity -= prob * prob;
    }
    return impurity;
}

function calculateWeightedGini(leftSamples, rightSamples, targetCol) {
    const totalSamples = leftSamples.length + rightSamples.length;
    if (totalSamples === 0) return 0;

    const giniLeft = calculateGiniImpurity(leftSamples, targetCol);
    const giniRight = calculateGiniImpurity(rightSamples, targetCol);

    return (leftSamples.length / totalSamples) * giniLeft +
           (rightSamples.length / totalSamples) * giniRight;
}

function getMajorityClass(samples, targetCol) {
    if (samples.length === 0) return 'N/A';
    const classCounts = {};
    samples.forEach(s => {
        const target = s[targetCol];
        classCounts[target] = (classCounts[target] || 0) + 1;
    });

    let majorityClass = '';
    let maxCount = -1;
    for (const className in classCounts) {
        if (classCounts[className] > maxCount) {
            maxCount = classCounts[className];
            majorityClass = className;
        }
    }
    return majorityClass;
}

function getDistribution(samples, targetCol) {
    if (samples.length === 0) return {};
    const classCounts = {};
    samples.forEach(s => {
        const target = s[targetCol];
        classCounts[target] = (classCounts[target] || 0) + 1;
    });
    return classCounts;
}

// --- Tree Visualization (SVG) ---

function drawTree(tree) {
    treeSvg.innerHTML = ''; // Clear previous tree

    if (!tree) {
        return;
    }

    const margin = { top: 30, right: 20, bottom: 20, left: 20 };
    let maxDepth = 0;

    // First pass: Calculate depth and number of nodes per level
    const nodesPerLevel = {};
    function calculateTreeDimensions(node, depth) {
        if (!node) return;
        maxDepth = Math.max(maxDepth, depth);
        nodesPerLevel[depth] = (nodesPerLevel[depth] || 0) + 1;
        if (node.children) {
            node.children.forEach(child => calculateTreeDimensions(child, depth + 1));
        }
    }
    calculateTreeDimensions(tree, 0);

    // Calculate total width needed based on the widest level
    let maxNodesInOneLevel = 0;
    for (const depth in nodesPerLevel) {
        maxNodesInOneLevel = Math.max(maxNodesInOneLevel, nodesPerLevel[depth]);
    }
    // Ensure minimum width for the container, and expand if tree is wider
    const minSvgWidth = treeContainer.offsetWidth - margin.left - margin.right;
    // Calculate the actual width required by the nodes and their horizontal spacing
    const requiredTreeWidth = maxNodesInOneLevel * NODE_WIDTH + (maxNodesInOneLevel - 1) * HORIZONTAL_SPACING;
    const svgWidth = Math.max(minSvgWidth, requiredTreeWidth + margin.left + margin.right);

    const svgHeight = (maxDepth + 1) * (NODE_HEIGHT + VERTICAL_SPACING) + margin.top + margin.bottom;

    treeSvg.setAttribute('width', svgWidth);
    treeSvg.setAttribute('height', svgHeight);
    treeSvg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);

    // Recursive drawing function
    // currentX, currentY here are the center of the node
    function drawNode(node, currentX, currentY, parentX, parentY, depth, siblingIndex) {
        if (!node) return;

        // Draw line from parent
        if (parentX !== undefined && parentY !== undefined) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('class', 'link');
            line.setAttribute('x1', parentX);
            line.setAttribute('y1', parentY + NODE_HEIGHT / 2); // From bottom of parent
            line.setAttribute('x2', currentX);
            line.setAttribute('y2', currentY - NODE_HEIGHT / 2); // To top of child
            treeSvg.appendChild(line);
        }

        // Create group for node (rect + text)
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', `node ${node.type}`);
        g.setAttribute('transform', `translate(${currentX - NODE_WIDTH / 2}, ${currentY - NODE_HEIGHT / 2})`);

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', NODE_WIDTH);
        rect.setAttribute('height', NODE_HEIGHT);
        rect.setAttribute('rx', 5); // Rounded corners
        rect.setAttribute('ry', 5);
        g.appendChild(rect);

        // Add text content
        let textContent = [];
        if (node.type === 'node') {
            const splitOp = node.splitType === 'numerical' ? '<=' : '==';
            textContent.push(`${node.feature} ${splitOp} ${node.splitValue.toFixed(2)}`);
            textContent.push(`Gini: ${node.impurity.toFixed(2)} (Gain: ${node.giniGain.toFixed(2)})`);
        } else { // leaf node
            textContent.push(`Predict: ${node.prediction}`);
            textContent.push(`Gini: ${node.impurity.toFixed(2)}`);
        }
        textContent.push(`Samples: ${node.samplesCount}`);
        const distString = Object.entries(node.distribution).map(([key, value]) => `${key}:${value}`).join(', ');
        textContent.push(`[${distString}]`);

        textContent.forEach((line, i) => {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', NODE_WIDTH / 2);
            text.setAttribute('y', 20 + i * 15); // Adjust Y for each line
            text.textContent = line;
            g.appendChild(text);
        });

        treeSvg.appendChild(g);
