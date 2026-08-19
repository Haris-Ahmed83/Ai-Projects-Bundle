// Node class to represent each cell in the grid
class Node {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.isStart = false;
        this.isEnd = false;
        this.isWall = false;
        this.distance = Infinity; // For Dijkstra's algorithm
        this.isVisited = false;
        this.previousNode = null; // To reconstruct the shortest path
    }
}

// Global variables
const GRID_ROWS = 20;
const GRID_COLS = 50;
let grid = []; // 2D array of Node objects
let startNode = null;
let endNode = null;
let drawingMode = 'setStart'; // 'setStart', 'setEnd', 'drawWall'
let isMousePressed = false; // Tracks if mouse button is down for drawing walls
let isVisualizing = false; // Prevents interaction during visualization

// DOM Elements
const gridContainer = document.getElementById('gridContainer');
const clearGridBtn = document.getElementById('clearGridBtn');
const setStartBtn = document.getElementById('setStartBtn');
const setEndBtn = document.getElementById('setEndBtn');
const setWallBtn = document.getElementById('setWallBtn');
const algorithmSelect = document.getElementById('algorithmSelect');
const visualizeBtn = document.getElementById('visualizeBtn');
const controlButtons = [clearGridBtn, setStartBtn, setEndBtn, setWallBtn, algorithmSelect, visualizeBtn];

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', setup);
clearGridBtn.addEventListener('click', clearGrid);
setStartBtn.addEventListener('click', () => setDrawingMode('setStart'));
setEndBtn.addEventListener('click', () => setDrawingMode('setEnd'));
setWallBtn.addEventListener('click', () => setDrawingMode('drawWall'));
visualizeBtn.addEventListener('click', handleVisualize);

// --- Setup Function ---
function setup() {
    createGrid();
    setDrawingMode('setStart'); // Default mode on load
}

// --- Grid Creation & Manipulation ---
function createGrid() {
    gridContainer.innerHTML = ''; // Clear any existing grid
    gridContainer.style.gridTemplateColumns = `repeat(${GRID_COLS}, 1fr)`;

    for (let r = 0; r < GRID_ROWS; r++) {
        const currentRow = [];
        for (let c = 0; c < GRID_COLS; c++) {
            const node = new Node(r, c);
            currentRow.push(node);

            const nodeElement = document.createElement('div');
            nodeElement.id = `node-${r}-${c}`;
            nodeElement.classList.add('node');
            nodeElement.addEventListener('mousedown', () => handleMouseDown(r, c));
            nodeElement.addEventListener('mouseenter', () => handleMouseEnter(r, c));
            gridContainer.appendChild(nodeElement);
        }
        grid.push(currentRow);
    }
    document.addEventListener('mouseup', handleMouseUp);
}

function getHtmlNode(row, col) {
    return document.getElementById(`node-${row}-${col}`);
}

// Resets algorithm-specific properties of nodes (distance, visited, previousNode)
// and clears visited/path classes, keeping walls, start, end.
function resetGridStateForAlgorithm() {
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            const node = grid[r][c];
            const htmlNode = getHtmlNode(r, c);

            node.distance = Infinity;
            node.isVisited = false;
            node.previousNode = null;

            // Remove visited/path classes, but keep start/end/wall
            if (!node.isStart && !node.isEnd && !node.isWall) {
                htmlNode.className = 'node'; // Reset to default
            } else if (node.isStart) {
                htmlNode.className = 'node node-start';
            } else if (node.isEnd) {
                htmlNode.className = 'node node-end';
            } else if (node.isWall) {
                htmlNode.className = 'node node-wall';
            }
        }
    }
}

// Clears the entire grid, removing walls, start, and end nodes.
function clearGrid() {
    if (isVisualizing) return;

    startNode = null;
    endNode = null;
    grid = []; // Reset the grid array to rebuild it
    createGrid(); // Recreate a fresh grid
    setDrawingMode('setStart'); // Reset drawing mode
}

// --- Drawing Modes & Interactions ---
function setDrawingMode(mode) {
    if (isVisualizing) return;

    drawingMode = mode;
    clearActiveModeClasses();
    // Add active class to the selected button
    if (mode === 'setStart') setStartBtn.classList.add('active-mode');
    else if (mode === 'setEnd') setEndBtn.classList.add('active-mode');
    else if (mode === 'drawWall') setWallBtn.classList.add('active-mode');
}

function clearActiveModeClasses() {
    setStartBtn.classList.remove('active-mode');
    setEndBtn.classList.remove('active-mode');
    setWallBtn.classList.remove('active-mode');
}

function handleMouseDown(row, col) {
    if (isVisualizing) return;

    isMousePressed = true;
    const node = grid[row][col];
    const htmlNode = getHtmlNode(row, col);

    if (drawingMode === 'setStart') {
        if (node.isWall) return; // Cannot set start on a wall
        if (startNode) { // Clear previous start node
            startNode.isStart = false;
            getHtmlNode(startNode.row, startNode.col).classList.remove('node-start');
        }
        node.isStart = true;
        startNode = node;
        htmlNode.classList.add('node-start');
    } else if (drawingMode === 'setEnd') {
        if (node.isWall) return; // Cannot set end on a wall
        if (endNode) { // Clear previous end node
            endNode.isEnd = false;
            getHtmlNode(endNode.row, endNode.col).classList.remove('node-end');
        }
        node.isEnd = true;
        endNode = node;
        htmlNode.classList.add('node-end');
    } else if (drawingMode === 'drawWall') {
        // Toggle wall status, cannot make start/end a wall
        if (node.isStart || node.isEnd) return;
        node.isWall = !node.isWall;
        htmlNode.classList.toggle('node-wall', node.isWall);
    }
}

function handleMouseEnter(row, col) {
    if (isVisualizing || !isMousePressed || drawingMode !== 'drawWall') return;

    const node = grid[row][col];
    const htmlNode = getHtmlNode(row, col);

    // Toggle wall status, cannot make start/end a wall
    if (node.isStart || node.isEnd) return;
    node.isWall = !node.isWall;
    htmlNode.classList.toggle('node-wall', node.isWall);
}

function handleMouseUp() {
    isMousePressed = false;
}

// --- Pathfinding Algorithm (Dijkstra's) ---
function dijkstra(grid, startNode, endNode) {
    const visitedNodesInOrder = [];
    startNode.distance = 0; // Distance from start to itself is 0
    const unvisitedNodes = getAllNodes(grid); // Get all nodes in the grid

    while (!!unvisitedNodes.length) {
        // Sort nodes by distance to efficiently get the closest node
        sortNodesByDistance(unvisitedNodes);
        const closestNode = unvisitedNodes.shift(); // Get node with smallest distance

        // If we encounter a wall, skip it
        if (closestNode.isWall) continue;

        // If the closest node is at an infinite distance, we can't reach the end node
        if (closestNode.distance === Infinity) return visitedNodesInOrder;

        closestNode.isVisited = true;
        visitedNodesInOrder.push(closestNode);

        if (closestNode === endNode) return visitedNodesInOrder; // Target found!

        updateUnvisitedNeighbors(closestNode, grid);
    }
    return visitedNodesInOrder; // Return all visited nodes if end not found
}

// Helper to flatten the 2D grid into a 1D array of nodes
function getAllNodes(grid) {
    const nodes = [];
    for (const row of grid) {
        for (const node of row) {
            nodes.push(node);
        }
    }
    return nodes;
}

// Sorts nodes in place by their distance property
function sortNodesByDistance(unvisitedNodes) {
    unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
}

// Updates the distance of unvisited neighbors of a given node
function updateUnvisitedNeighbors(node, grid) {
    const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
    for (const neighbor of unvisitedNeighbors) {
        neighbor.distance = node.distance + 1; // Assuming uniform cost of 1
        neighbor.previousNode = node; // Set previous node to reconstruct path
    }
}

// Gets valid (within bounds and not visited) neighbors of a node
function getUnvisitedNeighbors(node, grid) {
    const neighbors = [];
    const { col, row } = node;

    // Check top neighbor
    if (row > 0) neighbors.push(grid[row - 1][col]);
    // Check bottom neighbor
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    // Check left neighbor
    if (col > 0) neighbors.push(grid[row][col - 1]);
    // Check right neighbor
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);

    return neighbors.filter(neighbor => !neighbor.isVisited);
}

// Reconstructs the shortest path from the end node back to the start
function getNodesInShortestPathOrder(endNode) {
    const nodesInShortestPathOrder = [];
    let currentNode = endNode;
    while (currentNode !== null) {
        nodesInShortestPathOrder.unshift(currentNode); // Add to beginning
        currentNode = currentNode.previousNode;
    }
    return nodesInShortestPathOrder;
}

// --- Visualization ---
async function handleVisualize() {
    if (isVisualizing) return; // Prevent multiple visualizations simultaneously

    if (!startNode || !endNode) {
        alert('Please set both a start and an end node!');
        return;
    }

    isVisualizing = true;
    toggleControlButtons(true); // Disable buttons during visualization

    resetGridStateForAlgorithm(); // Clear previous path/visited states

    const visitedNodesInOrder = dijkstra(grid, startNode, endNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(endNode);

    await animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);

    isVisualizing = false;
    toggleControlButtons(false); // Re-enable buttons
}

function animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder) {
    return new Promise(resolve => {
        for (let i = 0; i <= visitedNodesInOrder.length; i++) {
            if (i === visitedNodesInOrder.length) {
                // Once all visited nodes are animated, animate the shortest path
                setTimeout(() => {
                    animateShortestPath(nodesInShortestPathOrder);
                    resolve();
                }, 10 * i);
                return;
            }
            const node = visitedNodesInOrder[i];
            // Don't animate start/end nodes as visited
            if (node.isStart || node.isEnd) continue;
            setTimeout(() => {
                getHtmlNode(node.row, node.col).classList.add('node-visited');
            }, 10 * i);
        }
    });
}

function animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
        const node = nodesInShortestPathOrder[i];
        // Don't animate start/end nodes as path
        if (node.isStart || node.isEnd) continue;
        setTimeout(() => {
            getHtmlNode(node.row, node.col).classList.add('node-path');
        }, 50 * i); // Slower animation for the final path
    }
}

function toggleControlButtons(disable) {
    controlButtons.forEach(button => {
        button.disabled = disable;
    });
}
