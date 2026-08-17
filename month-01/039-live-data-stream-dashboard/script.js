document.addEventListener('DOMContentLoaded', () => {
    const pausePlayBtn = document.getElementById('pausePlayBtn');
    const resetBtn = document.getElementById('resetBtn');

    let simulationInterval;
    let isPaused = false;

    // --- Data Streams Configuration ---
    const dashboardData = [
        {
            id: 'cpu',
            name: 'CPU Usage',
            value: 45.0,
            unit: '%',
            history: Array(20).fill(45.0),
            min: 0,
            max: 100,
            thresholds: { warn: 70, critical: 90 }
        },
        {
            id: 'memory',
            name: 'Memory Usage',
            value: 60.0,
            unit: '%',
            history: Array(20).fill(60.0),
            min: 0,
            max: 100,
            thresholds: { warn: 75, critical: 90 }
        },
        {
            id: 'network',
            name: 'Network Latency',
            value: 30,
            unit: 'ms',
            history: Array(20).fill(30),
            min: 10,
            max: 200,
            thresholds: { warn: 100, critical: 150 },
            decimalPlaces: 0
        },
        {
            id: 'diskio',
            name: 'Disk I/O',
            value: 15.0,
            unit: 'MB/s',
            history: Array(20).fill(15.0),
            min: 0,
            max: 100,
            thresholds: { warn: 60, critical: 80 }
        }
    ];

    // --- Helper Functions ---
    function getRandomFluctuation(currentValue, min, max, volatility = 0.05) {
        const change = (Math.random() - 0.5) * (max - min) * volatility;
        let newValue = currentValue + change;
        return Math.max(min, Math.min(max, newValue));
    }

    function getStatusClass(value, thresholds) {
        if (value >= thresholds.critical) return 'status-critical';
        if (value >= thresholds.warn) return 'status-warn';
        return 'status-normal';
    }

    // --- UI Update Logic ---
    function renderStream(stream) {
        const card = document.querySelector(`.card[data-stream-id="${stream.id}"]`);
        if (!card) return;

        const valueEl = card.querySelector('.value');
        const valueDisplayEl = card.querySelector('.value-display');
        const trendSparklineEl = card.querySelector('.trend-sparkline');

        // Update current value
        const formattedValue = stream.decimalPlaces !== undefined
            ? stream.value.toFixed(stream.decimalPlaces)
            : stream.value.toFixed(1);
        valueEl.textContent = formattedValue;

        // Update status class for color coding
        const statusClass = getStatusClass(stream.value, stream.thresholds);
        valueDisplayEl.className = `value-display ${statusClass}`;

        // Update sparkline
        if (trendSparklineEl) {
            trendSparklineEl.innerHTML = ''; // Clear previous bars
            stream.history.forEach(val => {
                const bar = document.createElement('div');
                bar.className = 'spark-bar';
                // Scale height relative to stream's min/max
                const normalizedHeight = ((val - stream.min) / (stream.max - stream.min)) * 100;
                bar.style.height = `${normalizedHeight}%`;
                bar.classList.add(getStatusClass(val, stream.thresholds)); // Color bars based on their own value
                trendSparklineEl.appendChild(bar);
            });
        }
    }

    function updateAllStreams() {
        dashboardData.forEach(stream => {
            // Simulate new value
            stream.value = getRandomFluctuation(stream.value, stream.min, stream.max);

            // Update history
            stream.history.push(stream.value);
            if (stream.history.length > 20) {
                stream.history.shift(); // Keep history size limited
            }
            renderStream(stream);
        });
    }

    // --- Simulation Controls ---
    function startSimulation() {
        if (simulationInterval) clearInterval(simulationInterval);
        simulationInterval = setInterval(updateAllStreams, 1000); // Update every 1 second
        isPaused = false;
        pausePlayBtn.textContent = 'Pause';
    }

    function pauseSimulation() {
        clearInterval(simulationInterval);
        isPaused = true;
        pausePlayBtn.textContent = 'Play';
    }

    function resetSimulation() {
        dashboardData.forEach(stream => {
            // Reset to initial values (or a sensible default)
            if (stream.id === 'cpu') stream.value = 45.0;
            if (stream.id === 'memory') stream.value = 60.0;
            if (stream.id === 'network') stream.value = 30;
            if (stream.id === 'diskio') stream.value = 15.0;
            stream.history = Array(20).fill(stream.value);
            renderStream(stream);
        });
        // Ensure simulation restarts after reset if it was playing
        if (!isPaused) {
            startSimulation();
        }
    }

    // --- Event Listeners ---
    pausePlayBtn.addEventListener('click', () => {
        if (isPaused) {
            startSimulation();
        } else {
            pauseSimulation();
        }
    });

    resetBtn.addEventListener('click', resetSimulation);

    // --- Initial Setup ---
    // Render initial state of all streams
    dashboardData.forEach(renderStream);
    // Start the simulation
    startSimulation();
});
