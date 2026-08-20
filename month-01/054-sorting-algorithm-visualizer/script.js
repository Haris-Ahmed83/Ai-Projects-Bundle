// --- DOM Elements ---
const visualizerDiv = document.getElementById('visualizer');
const arraySizeSlider = document.getElementById('arraySize');
const arraySizeValueSpan = document.getElementById('arraySizeValue');
const speedSlider = document.getElementById('speed');
const speedValueSpan = document.getElementById('speedValue');
const algorithmSelect = document.getElementById('algorithmSelect');
const newArrayBtn = document.getElementById('newArrayBtn');
const sortBtn = document.getElementById('sortBtn');

// --- Global Variables ---
let array = [];
let arraySize = parseInt(arraySizeSlider.value);
let animationSpeedMs = parseInt(speedSlider.value);
let isSorting = false;

// --- Helper Functions ---

// Creates a promise that resolves after a given delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generates a random array
function generateRandomArray() {
    array = [];
    for (let i = 0; i < arraySize; i++) {
        array.push(Math.floor(Math.random() * 99) + 1); // Values between 1 and 99
    }
}

// Renders the bars in the visualizer div
function renderBars(arr) {
    visualizerDiv.innerHTML = ''; // Clear previous bars
    arr.forEach(value => {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = `${value * 3}px`; // Scale value to pixel height (max 99*3=297px for 300px visualizer height)
        visualizerDiv.appendChild(bar);
    });
}

// Resets all bars to default color (CornflowerBlue)
function resetBarColors() {
    const bars = document.querySelectorAll('.bar');
    bars.forEach(bar => {
        bar.style.backgroundColor = '#6495ED'; // Default color
    });
}

// Sets a specific bar's color
function setBarColor(index, color) {
    const bars = document.querySelectorAll('.bar');
    if (bars[index]) {
        bars[index].style.backgroundColor = color;
    }
}

// Swaps two elements in the array and updates their bar heights visually
async function swapElements(index1, index2) {
    const bars = document.querySelectorAll('.bar');

    // Swap values in the array
    [array[index1], array[index2]] = [array[index2], array[index1]];

    // Update bar heights visually
    bars[index1].style.height = `${array[index1] * 3}px`;
    bars[index2].style.height = `${array[index2] * 3}px`;
}

// --- Sorting Algorithms ---

async function bubbleSort() {
    isSorting = true;
    const n = array.length;

    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            // Highlight elements being compared
            setBarColor(j, 'yellow');
            setBarColor(j + 1, 'yellow');
            await delay(animationSpeedMs);

            if (array[j] > array[j + 1]) {
                await swapElements(j, j + 1); // Swaps array values and updates bar heights
            }

            // Reset colors after comparison/swap
            setBarColor(j, '#6495ED');
            setBarColor(j + 1, '#6495ED');
        }
        setBarColor(n - 1 - i, 'green'); // Mark element as sorted
    }
    setBarColor(0, 'green'); // Mark the last element as sorted
    isSorting = false;
    await delay(animationSpeedMs * 5); // A small delay to see the final sorted state
    resetBarColors();
}

async function mergeSortWrapper() {
    isSorting = true;
    await mergeSort(array, 0, array.length - 1);
    isSorting = false;
    await delay(animationSpeedMs * 5);
    resetBarColors();
}

async function mergeSort(arr, l, r) {
    if (l >= r) {
        if (l === r) { // Base case: single element is sorted
            setBarColor(l, 'green');
            await delay(animationSpeedMs);
            setBarColor(l, '#6495ED'); // Revert for parent merge
        }
        return;
    }
    const m = Math.floor((l + r) / 2);

    // Highlight sub-arrays before recursive calls
    for(let i = l; i <= r; i++) {
        setBarColor(i, '#FFD700'); // Gold for sub-array being processed
    }
    await delay(animationSpeedMs);

    await mergeSort(arr, l, m);
    await mergeSort(arr, m + 1, r);
    await merge(arr, l, m, r);
}

async function merge(arr, l, m, r) {
    const n1 = m - l + 1;
    const n2 = r - m;

    let L = new Array(n1);
    let R = new Array(n2);

    const bars = document.querySelectorAll('.bar');

    for (let i = 0; i < n1; i++) {
        L[i] = arr[l + i];
        setBarColor(l + i, 'orange'); // Highlight left sub-array
    }
    for (let j = 0; j < n2; j++) {
        R[j] = arr[m + 1 + j];
        setBarColor(m + 1 + j, 'purple'); // Highlight right sub-array
    }
    await delay(animationSpeedMs);

    let i = 0;
    let j = 0;
    let k = l;

    while (i < n1 && j < n2) {
        setBarColor(k, 'red'); // Highlight current merge position
        if (L[i] <= R[j]) {
            arr[k] = L[i];
            i++;
        } else {
            arr[k] = R[j];
            j++;
        }
        bars[k].style.height = `${arr[k] * 3}px`; // Update bar height
        await delay(animationSpeedMs);
        setBarColor(k, '#6495ED'); // Reset current merge position color
        k++;
    }

    while (i < n1) {
        setBarColor(k, 'red');
        arr[k] = L[i];
        bars[k].style.height = `${arr[k] * 3}px`;
        await delay(animationSpeedMs);
        setBarColor(k, '#6495ED');
        i++;
        k++;
    }

    while (j < n2) {
        setBarColor(k, 'red');
        arr[k] = R[j];
        bars[k].style.height = `${arr[k] * 3}px`;
        await delay(animationSpeedMs);
        setBarColor(k, '#6495ED');
        j++;
        k++;
    }

    // After merge, for the final pass, mark the entire array as sorted
    if (l === 0 && r === array.length - 1) {
        for (let x = l; x <= r; x++) {
            setBarColor(x, 'green');
        }
    } else {
        // Reset colors for the merged segment
        for (let x = l; x <= r; x++) {
            setBarColor(x, '#6495ED');
        }
    }
}


async function quickSortWrapper() {
    isSorting = true;
    await quickSort(array, 0, array.length - 1);
    isSorting = false;
    await delay(animationSpeedMs * 5);
    resetBarColors();
}

async function quickSort(arr, low, high) {
    if (low < high) {
        let pi = await partition(arr, low, high);
        setBarColor(pi, 'green'); // Mark pivot's final position as sorted
        await quickSort(arr, low, pi - 1);
        await quickSort(arr, pi + 1, high);
    } else if (low === high) { // Base case: single element is sorted
        setBarColor(low, 'green');
        await delay(animationSpeedMs);
    }
}

async function partition(arr, low, high) {
    const bars = document.querySelectorAll('.bar');
    let pivotValue = arr[high];
    setBarColor(high, 'red'); // Highlight pivot
    await delay(animationSpeedMs);

    let i = (low - 1); // Index of smaller element

    for (let j = low; j <= high - 1; j++) {
        setBarColor(j, 'yellow'); // Highlight current element being compared
        await delay(animationSpeedMs);

        if (arr[j] < pivotValue) {
            i++;
            setBarColor(i, 'orange'); // Highlight element to be swapped
            await delay(animationSpeedMs / 2);
            await swapElements(i, j); // Swaps array values and updates bar heights
            await delay(animationSpeedMs / 2);
            setBarColor(i, '#6495ED'); // Reset color
        }
        setBarColor(j, '#6495ED'); // Reset compared element color
    }

    // Swap arr[i+1] and arr[high] (pivot)
    setBarColor(i + 1, 'orange'); // Highlight element before swap
    setBarColor(high, 'orange'); // Highlight pivot before swap
    await delay(animationSpeedMs);
    await swapElements(i + 1, high);
    await delay(animationSpeedMs);

    setBarColor(high, '#6495ED'); // Reset original pivot position color
    // setBarColor(i + 1, 'green'); // This is done by the quickSort caller
    return i + 1;
}


// --- Event Listeners ---

arraySizeSlider.addEventListener('input', (e) => {
    arraySize = parseInt(e.target.value);
    arraySizeValueSpan.textContent = arraySize;
    if (!isSorting) {
        generateRandomArray();
        renderBars(array);
    }
});

speedSlider.addEventListener('input', (e) => {
    animationSpeedMs = parseInt(e.target.value);
    speedValueSpan.textContent = animationSpeedMs;
});

newArrayBtn.addEventListener('click', () => {
    if (isSorting) return;
    generateRandomArray();
    renderBars(array);
    resetBarColors();
});

sortBtn.addEventListener('click', async () => {
    if (isSorting) return;

    resetBarColors(); // Ensure all bars are default before starting
    const selectedAlgorithm = algorithmSelect.value;
    
    // Disable controls during sorting
    sortBtn.disabled = true;
    newArrayBtn.disabled = true;
    arraySizeSlider.disabled = true;
    algorithmSelect.disabled = true;

    switch (selectedAlgorithm) {
        case 'bubble':
            await bubbleSort();
            break;
        case 'merge':
            await mergeSortWrapper();
            break;
        case 'quick':
            await quickSortWrapper();
            break;
        default:
            console.error('Unknown algorithm selected');
    }

    // Re-enable controls after sorting
    sortBtn.disabled = false;
    newArrayBtn.disabled = false;
    arraySizeSlider.disabled = false;
    algorithmSelect.disabled = false;
});


// --- Initial Setup ---
generateRandomArray();
renderBars(array);
