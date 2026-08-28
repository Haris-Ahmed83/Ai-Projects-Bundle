document.addEventListener('DOMContentLoaded', () => {
    const ganImage = document.getElementById('ganImage');
    const sliderContainer = document.getElementById('sliderContainer');
    const randomizeBtn = document.getElementById('randomizeBtn');
    const resetBtn = document.getElementById('resetBtn');

    // Define 'latent dimensions' (sliders) and their properties.
    // In this frontend-only simulation, these dimensions map directly
    // to CSS filter properties to visually alter the base image.
    const latentDimensions = [
        {
            id: 'dimension1',
            label: 'Creativity (Hue)',
            min: 0,
            max: 360,
            step: 1,
            initial: 0,
            cssProperty: 'hue-rotate',
            unit: 'deg'
        },
        {
            id: 'dimension2',
            label: 'Intensity (Saturation)',
            min: 0,
            max: 300,
            step: 1,
            initial: 100,
            cssProperty: 'saturate',
            unit: '%'
        },
        {
            id: 'dimension3',
            label: 'Brightness (Value)',
            min: 0,
            max: 200,
            step: 1,
            initial: 100,
            cssProperty: 'brightness',
            unit: '%'
        },
        {
            id: 'dimension4',
            label: 'Contrast (Style)',
            min: 0,
            max: 200,
            step: 1,
            initial: 100,
            cssProperty: 'contrast',
            unit: '%'
        },
        {
            id: 'dimension5',
            label: 'Sharpness (Blur)',
            min: 0,
            max: 10,
            step: 0.1,
            initial: 0,
            cssProperty: 'blur',
            unit: 'px'
        }
    ];

    // Store slider elements for easy access after creation
    const sliders = {};

    /**
     * Dynamically creates slider elements based on the latentDimensions array.
     * Each slider is associated with a CSS filter property.
     */
    function createSliders() {
        latentDimensions.forEach(dim => {
            const sliderGroup = document.createElement('div');
            sliderGroup.className = 'slider-group';

            const labelDiv = document.createElement('div');
            labelDiv.className = 'slider-label';

            const label = document.createElement('label');
            label.htmlFor = dim.id;
            label.textContent = dim.label;

            const valueSpan = document.createElement('span');
            valueSpan.id = `${dim.id}-value`;
            valueSpan.textContent = `${dim.initial}${dim.unit}`;

            labelDiv.appendChild(label);
            labelDiv.appendChild(valueSpan);

            const input = document.createElement('input');
            input.type = 'range';
            input.id = dim.id;
            input.min = dim.min;
            input.max = dim.max;
            input.step = dim.step;
            input.value = dim.initial;

            // Add event listener to update image and value display on slider input
            input.addEventListener('input', () => {
                updateImage();
                valueSpan.textContent = `${input.value}${dim.unit}`;
            });

            sliderGroup.appendChild(labelDiv);
            sliderGroup.appendChild(input);
            sliderContainer.appendChild(sliderGroup);

            sliders[dim.id] = input; // Store reference to the input element
        });
    }

    /**
     * Updates the CSS filter property of the GAN image based on current slider values.
     */
    function updateImage() {
        let filterString = '';
        latentDimensions.forEach(dim => {
            const slider = sliders[dim.id];
            if (slider) {
                // Only apply blur if its value is > 0, otherwise it's redundant
                if (dim.cssProperty === 'blur' && parseFloat(slider.value) === 0) {
                    // Skip adding blur(0px) to the filter string
                } else {
                    filterString += `${dim.cssProperty}(${slider.value}${dim.unit}) `;
                }
            }
        });
        ganImage.style.filter = filterString.trim();
    }

    /**
     * Randomizes the values of all sliders and updates the image.
     */
    function randomizeSliders() {
        latentDimensions.forEach(dim => {
            const slider = sliders[dim.id];
            if (slider) {
                const randomValue = parseFloat(dim.min) + (Math.random() * (parseFloat(dim.max) - parseFloat(dim.min)));
                // Round to nearest step for consistency
                slider.value = Math.round(randomValue / dim.step) * dim.step;
                document.getElementById(`${dim.id}-value`).textContent = `${slider.value}${dim.unit}`;
            }
        });
        updateImage();
    }

    /**
     * Resets all sliders to their initial defined values and updates the image.
     */
    function resetSliders() {
        latentDimensions.forEach(dim => {
            const slider = sliders[dim.id];
            if (slider) {
                slider.value = dim.initial;
                document.getElementById(`${dim.id}-value`).textContent = `${slider.initial}${dim.unit}`;
            }
        });
        updateImage();
    }

    // Initialize the sliders and set the initial image state
    createSliders();
    updateImage(); // Apply initial filter based on default slider values

    // Add event listeners for the control buttons
    randomizeBtn.addEventListener('click', randomizeSliders);
    resetBtn.addEventListener('click', resetSliders);
});
