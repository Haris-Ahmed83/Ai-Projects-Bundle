// Sample Data: [feature1, feature2, label]
// Features: Age, Income (simplified numerical values)
// Labels: 'Buy', 'No Buy'
const sampleData = [
    [25, 30000, 'No Buy'],
    [35, 70000, 'Buy'],
    [45, 50000, 'Buy'],
    [20, 20000, 'No Buy'],
    [60, 80000, 'Buy'],
    [30, 40000, 'No Buy'],
    [50, 60000, 'Buy'],
    [22, 25000, 'No Buy'],
    [40, 75000, 'Buy'],
    [55, 45000, 'Buy'],
    [28, 35000, 'No Buy'],
    [48, 65000, 'Buy']
];

const featureNames = ['Age', 'Income'];
const maxDepth = 3; // Limit tree depth for visualization

// Helper to get unique values for a specific feature index
function getUniqueValues(data, featureIndex) {
    return Array.from(new Set(data.map(row => row[featureIndex]))).sort((a, b) => a - b);
}

// Calculate Gini impurity for a set of data
function giniImpurity(data) {
    if (data.length === 0) return 0;
    const labels = data.map(row => row[data[0].length - 1]);
    const labelCounts = {};
    labels.forEach(label => {
        labelCounts[label] = (labelCounts[label] || 0) + 1;
    });

    let impurity = 1;
    for (const label in labelCounts) {
        const prob = labelCounts[label] / labels.length;
        impurity -= prob * prob;
    }
    return impurity;
}

// Split data based on a feature and a split value
function splitData(data, featureIndex, splitValue) {
    const left = data.filter(row => row[featureIndex] <= splitValue);
    const right = data.filter(row => row[featureIndex] > splitValue);
    return { left, right };
}

// Find the best split (feature and value) for the given data
function findBestSplit(data) {
    let bestGini = Infinity;
    let bestSplit = null;

    if (data.length === 0) return null;

    const numFeatures = data[0].length - 1; // Last column is label

    for (let featureIndex = 0; featureIndex < numFeatures; featureIndex++) {
        const uniqueValues = getUniqueValues(data, featureIndex);
        
        // Consider split points between unique values
        for (let i = 0; i < uniqueValues.length - 1; i++) {
            const splitValue = (uniqueValues[i] + uniqueValues[i + 1]) / 2;
            const { left, right } = splitData(data, featureIndex, splitValue);

            if (left.length === 0 || right.length === 0) continue; // Avoid empty splits

            const gini = (left.length / data.length) * giniImpurity(left) +
                         (right.length / data.length) * giniImpurity(right);

            if (gini < bestGini) {
                bestGini = gini;
                bestSplit = { featureIndex, splitValue, gini };
            }
        }
    }
    return bestSplit;
}

// Determine the most frequent label in a dataset (for leaf nodes)
function classify(data) {
    if (data.length === 0) return null;
    const labels = data.map(row => row[data[0].length - 1]);
    const labelCounts = {};
    labels.forEach(label => {
        labelCounts[label] = (labelCounts[label] || 0) + 1;
    });

    let maxCount = -1;
    let prediction = null;
    for (const label in labelCounts) {
        if (labelCounts[label] > maxCount) {
            maxCount = labelCounts[label];
            prediction = label;
        }
    }
    return prediction;
}

// Recursive function to build the decision tree
function buildTree(data, currentDepth) {
    // Base cases:
    // 1. All data points have the same label (pure node)
    const uniqueLabels = new Set(data.map(row => row[data[0].length - 1]));
    if (uniqueLabels.size === 1) {
        return { type: 'leaf', prediction: uniqueLabels.values().next().value, dataCount: data.length };
    }
    // 2. Max depth reached
    if (currentDepth >= maxDepth) {
        return { type: 'leaf', prediction: classify(data), dataCount: data.length };
    }
    
    const split = findBestSplit(data);
    // 3. No good split found (e.g., data is already pure, or no features left to split on effectively)
    if (!split || split.gini === 0) { // If no good split found or data is already pure
        return { type: 'leaf', prediction: classify(data), dataCount: data.length };
    }

    const { left, right } = splitData(data, split.featureIndex, split.splitValue);

    // If a split results in an empty child, it's not a useful split, make current node a leaf
    if (left.length === 0 || right.length === 0) {
        return { type: 'leaf', prediction: classify(data), dataCount: data.length };
    }

    const node = {
        type: 'node',
        featureIndex: split.featureIndex,
        splitValue: split.splitValue,
        dataCount: data.length,
        left: buildTree(left, currentDepth + 1),
        right: buildTree(right, currentDepth + 1)
    };
    return node;
}

// --- Visualization Logic ---

const canvas = document.getElementById('decisionTreeCanvas');
const ctx = canvas.getContext('2d');
const regenerateButton = document.getElementById('regenerateTree');

let treeData = null; // Stores the built tree structure

const NODE_WIDTH = 100;
const NODE_HEIGHT = 60;
const H_GAP = 60; // Horizontal gap between sibling subtrees
const V_GAP = 100; // Vertical gap between levels

let currentXPosition = 0; // Global X-counter for assigning leaf positions during layout

// Phase 1: Assign preliminary x-coordinates using a post-order traversal
// This ensures that child nodes are positioned before their parent, allowing the parent
// to be centered above its children.
function assignXCoordinates(node) {
    if (!node) return;

    if (node.type === 'leaf') {
        node.x = currentXPosition + NODE_WIDTH / 2;
        currentXPosition += NODE_WIDTH + H_GAP;
    } else {
        assignXCoordinates(node.left);
        
        // Special handling for nodes with only one child
        if (node.left && !node.right) {
             node.x = node.left.x; // Center over the single child
        } else {
            assignXCoordinates(node.right);
            // Center node's x between its children's x coordinates
            node.x = (node.left.x + node.right.x) / 2;
        }
    }
}

// Phase 2: Assign y-coordinates and set parent references using a pre-order traversal
// This allows passing down depth and parent information.
function assignYAndParent(node, depth, parentNode, parentSplitValue) {
    if (!node) return;

    node.y = depth * V_GAP + NODE_HEIGHT / 2 + 30; // Vertical position, +30 for top padding
    node.parent = parentNode;
    node.parentSplitValue = parentSplitValue;

    assignYAndParent(node.left, depth + 1, node, node.splitValue);
    assignYAndParent(node.right, depth + 1, node, node.splitValue);
}

// Draws a single node and its connection line to its parent
function drawNode(node) {
    if (!node) return;

    // Draw line from parent to current node
    if (node.parent) {
        ctx.beginPath();
        ctx.moveTo(node.parent.x, node.parent.y + NODE_HEIGHT / 2); // Start from bottom-center of parent
        ctx.lineTo(node.x, node.y - NODE_HEIGHT / 2);             // End at top-center of current node
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label for the split condition on the line
        const midX = (node.parent.x + node.x) / 2;
        const midY = (node.parent.y + NODE_HEIGHT / 2 + node.y - NODE_HEIGHT / 2) / 2;
        ctx.fillStyle = '#2c3e50';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let labelText = '';
        // Determine if this is a left (<=) or right (>) split path
        if (node.x > node.parent.x) { // Node is to the right of parent
             labelText = `> ${node.parentSplitValue}`;
        } else { // Node is to the left of parent
             labelText = `<= ${node.parentSplitValue}`;
        }
        ctx.fillText(labelText, midX, midY - 10); // Offset text slightly above the line
    }

    // Draw node rectangle (rounded corners)
    ctx.beginPath();
    const rectX = node.x - NODE_WIDTH / 2;
    const rectY = node.y - NODE_HEIGHT / 2;
    const borderRadius = 8;
    ctx.roundRect(rectX, rectY, NODE_WIDTH, NODE_HEIGHT, borderRadius);
    ctx.fillStyle = node.type === 'leaf' ? '#27ae60' : '#3498db'; // Green for leaves, blue for internal nodes
    ctx.fill();
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw text inside node
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (node.type === 'node') {
        const featureName = featureNames[node.featureIndex];
        const text1 = `${featureName}`;
        const text2 = `<= ${node.splitValue}?`;
        ctx.fillText(text1, node.x, node.y - 8);
        ctx.fillText(text2, node.x, node.y + 8);
    } else { // Leaf node
        const text1 = `Predict:`;
        const text2 = `${node.prediction}`;
        ctx.fillText(text1, node.x, node.y - 8);
        ctx.fillText(text2, node.x, node.y + 8);
    }
}

// Main function to draw the entire decision tree on the canvas
function drawTree(root) {
    if (!root) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawing

    // Reset global X counter for a fresh layout calculation
    currentXPosition = 0;

    // Phase 1: Calculate all x coordinates for nodes
    assignXCoordinates(root);

    // Phase 2: Calculate all y coordinates and set parent references
    assignYAndParent(root, 0, null, null); // Root has no parent

    // Determine the overall bounding box of the tree for canvas sizing
    let minX = Infinity, maxX = -Infinity, maxY = -Infinity;
    function findBounds(node) {
        if (!node) return;
        minX = Math.min(minX, node.x - NODE_WIDTH / 2);
        maxX = Math.max(maxX, node.x + NODE_WIDTH / 2);
        maxY = Math.max(maxY, node.y + NODE_HEIGHT / 2);
        findBounds(node.left);
        findBounds(node.right);
    }
    findBounds(root);

    // Calculate required canvas dimensions with padding
    const requiredWidth = maxX - minX + 50;
    const requiredHeight = maxY + 50;

    // Adjust canvas size to fit the tree, ensuring a minimum size
    canvas.width = Math.max(canvas.parentElement.clientWidth, requiredWidth);
    canvas.height = Math.max(600, requiredHeight);

    // Calculate global offset to center the tree horizontally on the canvas
    const offsetX = (canvas.width - requiredWidth) / 2 - minX;

    // Apply this offset to all node x-coordinates
    function applyGlobalOffset(node, offset) {
        if (!node) return;
        node.x += offset;
        applyGlobalOffset(node.left, offset);
        applyGlobalOffset(node.right, offset);
    }
    applyGlobalOffset(root, offsetX);

    // Finally, traverse the tree again to draw all nodes and connections
    function traverseAndDraw(node) {
        if (!node
