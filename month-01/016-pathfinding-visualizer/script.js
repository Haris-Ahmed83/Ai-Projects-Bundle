document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('pathfindingCanvas');
    const ctx = canvas.getContext('2d');

    const GRID_ROWS = 25;
    const GRID_COLS = 25;
    const CELL_SIZE = 20;
    canvas.width = GRID_COLS * CELL_SIZE;
    canvas.height = GRID_ROWS * CELL_SIZE;

    let grid = [];
    let startNode = null;
    let endNode = null;
    let isMouseDown = false;
    let currentInteractionMode = 'obstacle'; // 'obstacle', 'start', 'end'
    let isVisualizing = false;

    // DOM Elements
    const algorithmSelect = document.getElementById('algorithm');
    const visualizeBtn = document.getElementById('visualizeBtn');
    const clearGridBtn = document.getElementById('clearGridBtn');
    const drawObstaclesBtn = document.getElementById('drawObstaclesBtn');
    const setStartBtn = document.getElementById('setStartBtn');
    const setEndBtn = document.getElementById('setEndBtn');

    const COLORS = {
        EMPTY: '#ffffff',
        START: '#28a745',
        END: '#dc3545',
        OBSTACLE: '#343a40',
        VISITED: '#a2d2ff', // Light blue
        PATH: '#ffc107'    // Yellow
    };

    // Node class to store grid cell properties
    class Node {
        constructor(row, col, type = 'empty') {
            this.row = row;
            this.col = col;
            this.type = type;
            this.distance = Infinity; // gScore for A*, distance for Dijkstra
            this.heuristic = Infinity; // hScore for A*
            this.fScore = Infinity; // f = g + h for A*
            this.previousNode = null;
        }
    }

    // --- Grid Initialization and Drawing ---
    function createGrid() {
        grid = [];
        for (let r = 0; r < GRID_ROWS; r++) {
            const row = [];
            for (let c = 0; c < GRID_COLS; c++) {
                row.push(new Node(r, c));
            }
            grid.push(row);
        }

        // Set default start and end nodes
        startNode = grid[Math.floor(GRID_ROWS / 2)][Math.floor(GRID_COLS / 4)];
        startNode.type = 'start';
        endNode = grid[Math.floor(GRID_ROWS / 2)][Math.floor(GRID_COLS * 3 / 4)];
        endNode.type = 'end';
    }

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let r = 0; r < GRID_ROWS; r++) {
            for (let c = 0; c < GRID_COLS; c++) {
                drawNode(grid[r][c]);
            }
        }
    }

    function drawNode(node, typeOverride = null) {
        const type = typeOverride || node.type;
        let color;
        switch (type) {
            case 'start': color = COLORS.START; break;
            case 'end': color = COLORS.END; break;
            case 'obstacle': color = COLORS.OBSTACLE; break;
            case 'visited': color = COLORS.VISITED; break;
            case 'path': color = COLORS.PATH; break;
            case 'empty':
            default: color = COLORS.EMPTY; break;
        }

        ctx.fillStyle = color;
        ctx.fillRect(node.col * CELL_SIZE, node.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = '#e0e0e0'; // Grid lines
        ctx.strokeRect(node.col * CELL_SIZE, node.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }

    // Resets pathfinding-specific properties and visuals, but keeps obstacles, start, end
    function resetPathAndVisitedNodes() {
        for (let r = 0; r < GRID_ROWS; r++) {
            for (let c = 0; c < GRID_COLS; c++) {
                const node = grid[r][c];
                if (node.type === 'visited' || node.type === 'path') {
                    node.type = 'empty';
                }
                // Reset algorithm specific properties
                node.distance = Infinity;
                node.heuristic = Infinity;
                node.fScore = Infinity;
                node.previousNode = null;
            }
        }
        // Ensure start and end nodes are correctly typed after reset
        if (startNode) startNode.type = 'start';
        if (endNode) endNode.type = 'end';
        drawGrid();
    }

    // --- Event Handlers ---
    function getClickedNode(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const col = Math.floor(x / CELL_SIZE);
        const row = Math.floor(y / CELL_SIZE);
        if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
            return grid[row][col];
        }
        return null;
    }

    function handleCanvasInteraction(event) {
        if (isVisualizing) return;

        const node = getClickedNode(event);
        if (!node) return;

        // Prevent interaction with start/end nodes if placing the other
        if (currentInteractionMode === 'start' && node === endNode) return;
        if (currentInteractionMode === 'end' && node === startNode) return;

        // Clear any existing path/visited nodes when interaction occurs
        resetPathAndVisitedNodes();

        if (currentInteractionMode === 'obstacle') {
            if (node !== startNode && node !== endNode) {
                node.type = node.type === 'obstacle' ? 'empty' : 'obstacle';
                drawNode(node);
            }
        } else if (currentInteractionMode === 'start') {
            if (startNode) startNode.type = 'empty'; // Clear old start node
            startNode = node;
            startNode.type = 'start';
            drawGrid(); // Redraw grid to update colors
        } else if (currentInteractionMode === 'end') {
            if (endNode) endNode.type = 'empty'; // Clear old end node
            endNode = node;
            endNode.type = 'end';
            drawGrid(); // Redraw grid to update colors
        }
    }

    canvas.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        handleCanvasInteraction(e);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isMouseDown && currentInteractionMode === 'obstacle') {
            handleCanvasInteraction(e);
        }
    });

    canvas.addEventListener('mouseup', () => {
        isMouseDown = false;
    });

    canvas.addEventListener('mouseleave', () => {
        isMouseDown = false;
    });

    // Mode button event listeners
    drawObstaclesBtn.addEventListener('click', () => setMode('obstacle'));
    setStartBtn.addEventListener('click', () => setMode('start'));
    setEndBtn.addEventListener('click', () => setMode('end'));

    function setMode(mode) {
        currentInteractionMode = mode;
        // Update active button styling
        document.querySelectorAll('.mode-buttons button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${mode}Btn`).classList.add('active');
    }

    clearGridBtn.addEventListener('click', () => {
        if (isVisualizing) return;
        createGrid(); // Re-initialize grid with default start/end/empty nodes
        drawGrid();
        setMode('obstacle'); // Reset mode to obstacle drawing
    });

    visualizeBtn.addEventListener('click', visualizeAlgorithm);

    // --- Pathfinding Algorithms ---

    function getNeighbors(node) {
        const neighbors = [];
        const { row, col } = node;

        const potentialNeighbors = [
            [row - 1, col], // Up
            [row + 1, col], // Down
            [row, col - 1], // Left
            [row, col + 1]  // Right
        ];

        for (const [r, c] of potentialNeighbors) {
            if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS && grid[r][c].type !== 'obstacle') {
                neighbors.push(grid[r][c]);
            }
        }
        return neighbors;
    }

    function reconstructPath(endNode) {
        const path = [];
        let currentNode = endNode;
        // Backtrack from endNode to startNode using previousNode pointers
        while (currentNode !== null && currentNode.previousNode !== null) {
            path.unshift(currentNode); // Add to the beginning to get path in order
            currentNode = currentNode.previousNode;
        }
        // The start node itself is not typically included in the 'path' array
        // as it's the origin. Path starts from the node adjacent to the start.
        return path;
    }

    // Dijkstra's Algorithm implementation
    async function dijkstra() {
        if (!startNode || !endNode) {
            alert('Please set both start and end nodes!');
            return { visitedNodesInOrder: [], path: [] };
        }

        resetPathAndVisitedNodes();
        startNode.distance = 0;

        const unvisitedNodes = getAllNodes(grid);
        const visitedNodesInOrder = [];

        while (unvisitedNodes.length > 0) {
            // Sort by distance to simulate a priority queue (less efficient but concise for small grids)
            unvisitedNodes.sort((a, b) => a.distance - b.distance);
            const closestNode = unvisitedNodes.shift(); // Get node with smallest distance

            // If we hit an obstacle or an unreachable node, stop.
            if (closestNode.type === 'obstacle' || closestNode.distance === Infinity) {
                return { visitedNodesInOrder, path: [] };
            }

            // Mark as visited (unless it's start or end)
            if (closestNode.type !== 'start' && closestNode.type !== 'end') {
                closestNode.type = 'visited';
            }
            visitedNodesInOrder.push(closestNode);

            if (closestNode === endNode) {
                return { visitedNodesInOrder, path: reconstructPath(endNode) };
            }

            const neighbors = getNeighbors(closestNode);
            for (const neighbor of neighbors) {
                // Assuming uniform edge weight of 1
                const newDistance = closestNode.distance + 1;
                if (newDistance < neighbor.distance) {
                    neighbor.distance = newDistance;
                    neighbor.previousNode = closestNode;
                }
            }
        }
        return { visitedNodesInOrder, path: [] }; // No path found
    }

    // Heuristic function (Manhattan distance for A*)
    function manhattanDistance(nodeA, nodeB) {
        return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
    }

    // Helper to get all nodes in the grid
    function getAllNodes(grid) {
        const nodes = [];
        for (let r = 0; r < GRID_ROWS; r++) {
            for (let c = 0; c < GRID_COLS; c++) {
                nodes.push(grid[r][c]);
            }
        }
        return nodes;
    }

    // A* Search Algorithm implementation
    async function aStar() {
        if (!startNode || !endNode) {
            alert('Please set both start and end nodes!');
            return { visitedNodesInOrder: [], path: [] };
        }

        resetPathAndVisitedNodes();

        startNode.distance = 0; // gScore: cost from start to current node
        startNode.heuristic = manhattanDistance(startNode, endNode); // hScore: estimated cost from current node to end
        startNode.fScore = startNode.distance + startNode.heuristic; // fScore = gScore + hScore

        const openSet = [startNode]; // Nodes to be evaluated
        const visitedNodesInOrder = [];

        while (openSet.length > 0) {
            // Sort by fScore to simulate a priority queue
            openSet.sort((a, b) => a.fScore - b.fScore);
            const currentNode = openSet.shift(); // Get node with lowest fScore

            if (currentNode === endNode) {
                return { visitedNodesInOrder, path: reconstructPath(endNode) };
            }

            if (currentNode.type !== 'start' && currentNode.type !== 'end') {
                currentNode.type = 'visited';
                visitedNodesInOrder.push(currentNode);
            }

            const neighbors = getNeighbors(currentNode);
            for (const neighbor of neighbors) {
                // d(current, neighbor) is 1 for adjacent nodes
                const tentativeGScore = currentNode.distance + 1;

                if (tentativeGScore < neighbor.distance) { // If this path to neighbor is better
                    neighbor.previousNode = currentNode;
                    neighbor.distance = tentativeGScore;
                    neighbor.heuristic = manhattanDistance(neighbor, endNode);
                    neighbor.fScore = neighbor.distance + neighbor.heuristic;

                    if (!openSet.includes(neighbor)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }
        return { visitedNodesInOrder, path: [] }; // No path found
    }

    // --- Visualization ---
    async function animateAlgorithm(visitedNodesInOrder, path) {
        isVisualizing = true;
        // Disable controls during visualization
        visualizeBtn.disabled = true;
        clearGridBtn.disabled = true;
        drawObstaclesBtn.disabled = true;
        setStartBtn.disabled = true;
        setEndBtn.disabled = true;
        algorithmSelect.disabled = true;

        // Animate visited nodes
        for (let i = 0; i < visitedNodesInOrder.length; i++) {
            const node = visitedNodesInOrder[i];
            if (node.type !== 'start' && node.type !== 'end') {
                drawNode(node, 'visited');
            }
            await new Promise(resolve => setTimeout(resolve, 10)); // Animation speed for visited nodes
        }

        // Animate shortest path
        for (let i = 0; i < path.length; i++) {
            const node = path[i];
            if (node.type !== 'start' && node.type !== 'end') {
                drawNode(node, 'path');
            }
            await new Promise(resolve => setTimeout(resolve, 30)); // Animation speed for path
        }

        isVisualizing = false;
        // Re-enable controls after visualization
        visualizeBtn.disabled = false;
        clearGridBtn.disabled = false;
        drawObstaclesBtn.disabled = false;
        setStartBtn.disabled = false;
        setEndBtn.disabled = false;
        algorithmSelect.disabled = false;
    }

    async function visualizeAlgorithm() {
        if (isVisualizing) return;
        resetPathAndVisitedNodes(); // Clear previous visualization

        const selectedAlgorithm = algorithmSelect.value;
        let result;

        if (selectedAlgorithm === 'dijkstra') {
            result = await dijkstra();
        } else if (selectedAlgorithm === 'astar') {
            result = await aStar();
        }

        if (result && result.visitedNodesInOrder) {
            await animateAlgorithm(result.visitedNodesInOrder, result.path);
        } else {
            alert('Algorithm failed or returned no result. Check if start/end nodes are set.');
        }
    }

    // Initial setup when the page loads
    createGrid();
    drawGrid();
    setMode('obstacle'); // Default interaction mode
});
