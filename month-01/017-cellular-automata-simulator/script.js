document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const playPauseBtn = document.getElementById('playPauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const randomizeBtn = document.getElementById('randomizeBtn');
    const clearBtn = document.getElementById('clearBtn');

    // Simulation parameters
    const CELL_SIZE = 10; // Pixels per cell
    const CANVAS_WIDTH = 600; // Total canvas width
    const CANVAS_HEIGHT = 400; // Total canvas height

    let cols;
    let rows;
    let grid;
    let isPlaying = false;
    let animationFrameId = null;

    // --- Core Simulation Logic ---
    function init() {
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        cols = Math.floor(CANVAS_WIDTH / CELL_SIZE);
        rows = Math.floor(CANVAS_HEIGHT / CELL_SIZE);
        createEmptyGrid();
        drawGrid();
    }

    function createEmptyGrid() {
        grid = new Array(cols).fill(null).map(() => new Array(rows).fill(0));
    }

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                if (grid[x][y] === 1) {
                    ctx.fillStyle = '#61dafb'; // Live cell color
                    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
                // Optionally draw grid lines for dead cells
                // else {
                //     ctx.strokeStyle = '#333';
                //     ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                // }
            }
        }
    }

    function getLiveNeighbors(x, y) {
        let liveNeighbors = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue; // Skip self

                const neighborX = x + i;
                const neighborY = y + j;

                // Check boundaries (no wrap-around). Cells outside are considered dead.
                if (neighborX >= 0 && neighborX < cols && neighborY >= 0 && neighborY < rows) {
                    liveNeighbors += grid[neighborX][neighborY];
                }
            }
        }
        return liveNeighbors;
    }

    // Conway's Game of Life rules
    function updateGrid() {
        const nextGrid = new Array(cols).fill(null).map(() => new Array(rows).fill(0));

        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                const cell = grid[x][y];
                const liveNeighbors = getLiveNeighbors(x, y);

                if (cell === 1) { // Live cell
                    if (liveNeighbors < 2 || liveNeighbors > 3) {
                        nextGrid[x][y] = 0; // Dies due to underpopulation or overpopulation
                    } else {
                        nextGrid[x][y] = 1; // Lives on
                    }
                } else { // Dead cell
                    if (liveNeighbors === 3) {
                        nextGrid[x][y] = 1; // Becomes live due to reproduction
                    }
                }
            }
        }
        grid = nextGrid;
    }

    function gameLoop() {
        updateGrid();
        drawGrid();

        if (isPlaying) {
            animationFrameId = requestAnimationFrame(gameLoop);
        }
    }

    // --- User Interaction Functions ---

    function togglePlayPause() {
        isPlaying = !isPlaying;
        if (isPlaying) {
            playPauseBtn.textContent = 'Pause';
            gameLoop();
        } else {
            playPauseBtn.textContent = 'Start';
            cancelAnimationFrame(animationFrameId);
        }
    }

    function resetSimulation() {
        cancelAnimationFrame(animationFrameId);
        isPlaying = false;
        playPauseBtn.textContent = 'Start';
        createEmptyGrid(); // Clear grid to all dead cells
        drawGrid();
    }

    function randomizeGrid() {
        // Stop simulation if running
        if (isPlaying) {
            togglePlayPause(); // This will stop it and change button text
        }

        createEmptyGrid(); // Ensure grid is correctly sized and cleared
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                grid[x][y] = Math.random() > 0.7 ? 1 : 0; // Approximately 30% live cells
            }
        }
        drawGrid();
    }

    // 'Clear Grid' essentially does the same as resetSimulation in this context
    // as stopping the simulation and clearing the board is the desired behavior.
    function clearGrid() {
        resetSimulation();
    }

    function handleCanvasClick(event) {
        if (isPlaying) return; // Don't allow manual changes during simulation

        const rect = canvas.getBoundingClientRect();
        // Calculate scale to handle CSS scaling if any
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        // Get mouse position relative to canvas, accounting for scaling
        const clientX = event.clientX - rect.left;
        const clientY = event.clientY - rect.top;

        const x = Math.floor((clientX * scaleX) / CELL_SIZE);
        const y = Math.floor((clientY * scaleY) / CELL_SIZE);

        if (x >= 0 && x < cols && y >= 0 && y < rows) {
            grid[x][y] = grid[x][y] === 1 ? 0 : 1; // Toggle cell state
            drawGrid();
        }
    }

    // --- Event Listeners ---
    playPauseBtn.addEventListener('click', togglePlayPause);
    resetBtn.addEventListener('click', resetSimulation);
    randomizeBtn.addEventListener('click', randomizeGrid);
    clearBtn.addEventListener('click', clearGrid);
    canvas.addEventListener('click', handleCanvasClick);

    // Initialize the simulation on page load
    init();
});
