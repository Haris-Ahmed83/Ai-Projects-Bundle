const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');

// Get UI elements
const numShapesInput = document.getElementById('numShapes');
const numShapesValueSpan = document.getElementById('numShapesValue');
const speedInput = document.getElementById('speed');
const speedValueSpan = document.getElementById('speedValue');
const colorShiftInput = document.getElementById('colorShift');
const colorShiftValueSpan = document.getElementById('colorShiftValue');

// Global parameters
const params = {
    numShapes: parseInt(numShapesInput.value),
    animationSpeed: parseFloat(speedInput.value),
    colorShiftSpeed: parseFloat(colorShiftInput.value),
    globalHue: 0,
    time: 0
};

// Update canvas size on window resize
function resizeCanvas() {
    const container = canvas.parentElement;
    // Set canvas dimensions to be square, relative to container, max 600px
    const size = Math.min(container.clientWidth * 0.9, 600);
    canvas.width = size;
    canvas.height = size;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial call to set canvas size

// Drawing function
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas each frame

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const minDim = Math.min(centerX, centerY); // Use the smaller half-dimension for scaling

    // Update global animation parameters
    params.globalHue = (params.globalHue + params.colorShiftSpeed) % 360;
    params.time += params.animationSpeed;

    for (let i = 0; i < params.numShapes; i++) {
        const progress = i / params.numShapes; // Normalized progress (0 to <1) for each shape

        // Calculate dynamic properties for each shape
        // Base radius: shapes get larger the further out they are (controlled by progress)
        const radiusBase = minDim * 0.1 + minDim * 0.7 * progress;
        // Oscillating offset: adds a wave-like motion to the radius
        const radiusOffset = minDim * 0.05 * Math.sin(params.time * 2 + progress * Math.PI * 4);
        const currentRadius = radiusBase + radiusOffset;

        // Calculate color (HSL values)
        const hue = (params.globalHue + progress * 180) % 360; // Spread hues across shapes
        const saturation = 80 + Math.sin(params.time * 0.5 + progress * 2) * 15; // Oscillating saturation
        const lightness = 60 + Math.cos(params.time * 0.3 + progress * 3) * 10; // Oscillating lightness
        const alpha = 0.8 - progress * 0.5; // Fade out shapes that are further out

        // Draw the circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2); // Draw a full circle
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
        ctx.fill();
    }
}

// Animation loop
function animate() {
    draw();
    requestAnimationFrame(animate);
}

// Event listeners for UI controls to update parameters
numShapesInput.addEventListener('input', (e) => {
    params.numShapes = parseInt(e.target.value);
    numShapesValueSpan.textContent = e.target.value;
});

speedInput.addEventListener('input', (e) => {
    params.animationSpeed = parseFloat(e.target.value);
    speedValueSpan.textContent = e.target.value;
});

colorShiftInput.addEventListener('input', (e) => {
    params.colorShiftSpeed = parseFloat(e.target.value);
    colorShiftValueSpan.textContent = e.target.value;
});

// Set initial values for spans
numShapesValueSpan.textContent = numShapesInput.value;
speedValueSpan.textContent = speedInput.value;
colorShiftValueSpan.textContent = colorShiftInput.value;

// Start the animation
animate();
