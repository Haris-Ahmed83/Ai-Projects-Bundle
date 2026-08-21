document.addEventListener('DOMContentLoaded', () => {
    const regexInput = document.getElementById('regexPattern');
    const stringInput = document.getElementById('testString');
    const visualizeBtn = document.getElementById('visualizeBtn');
    const visualizationArea = document.getElementById('visualizationArea');
    const prevBtn = document.getElementById('prevBtn');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const nextBtn = document.getElementById('nextBtn');
    const stepInfo = document.getElementById('stepInfo');
    const matchResultInfo = document.getElementById('matchResultInfo');
    const errorMessage = document.getElementById('error-message');

    let frames = [];
    let currentFrameIndex = 0;
    let animationInterval = null;
    const animationSpeed = 700; // milliseconds

    // --- Event Listeners ---
    visualizeBtn.addEventListener('click', visualizePattern);
    prevBtn.addEventListener('click', () => {
        pauseAnimation();
        showFrame(currentFrameIndex - 1);
    });
    nextBtn.addEventListener('click', () => {
        pauseAnimation();
        showFrame(currentFrameIndex + 1);
    });
    playPauseBtn.addEventListener('click', togglePlayPause);

    // --- Core Visualization Logic ---
    function visualizePattern() {
        const regexPattern = regexInput.value;
        const testString = stringInput.value;

        resetVisualization();
        errorMessage.textContent = '';

        if (!regexPattern || !testString) {
            errorMessage.textContent = 'Please enter both a regular expression and a test string.';
            return;
        }

        let regex;
        try {
            // Use a non-global regex for individual attempts at each starting position
            // The 'g' flag is problematic when you want to repeatedly test from different `lastIndex` values
            // or from substrings. A new RegExp instance for each 'exec' call is safer for this visualization.
            regex = new RegExp(regexPattern);
        } catch (e) {
            errorMessage.textContent = `Invalid Regex: ${e.message}`;
            return;
        }

        displayTestString(testString);
        generateFrames(regex, testString);
        
        if (frames.length > 0) {
            showFrame(0);
        } else {
            stepInfo.textContent = 'No steps to visualize (empty string or regex).';
            matchResultInfo.textContent = '';
            updateControls();
        }
    }

    function resetVisualization() {
        clearInterval(animationInterval);
        animationInterval = null;
        playPauseBtn.textContent = '▶ Play';
        playPauseBtn.classList.remove('playing');

        visualizationArea.innerHTML = '';
        frames = [];
        currentFrameIndex = 0;
        stepInfo.textContent = '';
        matchResultInfo.textContent = '';
        errorMessage.textContent = '';
        updateControls();
    }

    function displayTestString(testString) {
        visualizationArea.innerHTML = '';
        if (testString.length === 0) {
            visualizationArea.textContent = '(Empty String)';
            return;
        }
        for (let i = 0; i < testString.length; i++) {
            const span = document.createElement('span');
            span.classList.add('char-span');
            // Use non-breaking space for visibility of spaces, otherwise display char
            span.textContent = testString[i] === ' ' ? '\u00A0' : testString[i]; 
            span.dataset.index = i; // Store original index
            visualizationArea.appendChild(span);
        }
    }

    function generateFrames(regex, testString) {
        frames = [];

        if (testString.length === 0) {
            frames.push({
                currentFocus: -1, // No focus
                matches: [],
                message: 'Test string is empty.'
            });
            return;
        }

        // First, find all global matches to show in the final summary frame
        // This requires a separate regex instance with the 'g' flag.
        const globalRegex = new RegExp(regex.source, 'g');
        let globalMatch;
        const allGlobalMatches = [];
        while ((globalMatch = globalRegex.exec(testString)) !== null) {
            allGlobalMatches.push({
                start: globalMatch.index,
                end: globalMatch.index + globalMatch[0].length,
                text: globalMatch[0]
            });
            // If the regex is empty or matches empty string, avoid infinite loop for 'g' flag
            if (globalMatch.index === globalRegex.lastIndex) {
                globalRegex.lastIndex++;
            }
        }

        for (let i = 0; i < testString.length; i++) {
            const frame = {
                currentFocus: i,
                matches: [], // Matches found *from this specific starting point*
                message: ''
            };

            // Create a new regex instance without 'g' flag for each potential starting point
            // to simulate the engine trying to find *a* match starting at 'i'.
            let tempRegex = new RegExp(regex.source, regex.flags.replace('g', '')); // Ensure no 'g' flag
            let subString = testString.substring(i);
            let match = tempRegex.exec(subString);

            if (match) {
                // Adjust match indices relative to the original string
                const actualStart = i + match.index;
                const actualEnd = i + match.index + match[0].length;
                frame.matches.push({ start: actualStart, end: actualEnd, text: match[0] });
                frame.message = `Attempting to match from index ${i}. Found: '${match[0]}'`;
            } else {
                frame.message = `Attempting to match from index ${i}. No match found starting here.`;
            }
            frames.push(frame);
        }

        // Add a final frame showing all global matches clearly
        if (allGlobalMatches.length > 0) {
            frames.push({
                currentFocus: -1, // No specific focus for this summary frame
                matches: allGlobalMatches, // These are the global matches for the summary
                message: `Visualization complete. Found ${allGlobalMatches.length} global match(es).`
            });
        } else {
             frames.push({
                currentFocus: -1, // No specific focus
                matches: [],
                message: `Visualization complete. No matches found in the string.`
            });
        }
    }

    function showFrame(index) {
        if (index < 0 || index >= frames.length) return;

        currentFrameIndex = index;
        const frame = frames[currentFrameIndex];
        const charSpans = Array.from(visualizationArea.children);

        // Clear all previous highlights
        charSpans.forEach(span => {
            span.classList.remove('current-focus', 'matched', 'final-matched');
            // Reset inline styles that might have been applied by classes
            span.style.backgroundColor = ''; 
            span.style.color = '';
            span.style.fontWeight = '';
            span.style.border = '';
            span.style.transform = '';
            span.style.boxShadow = '';
        });

        // Apply highlights for the current frame
        if (frame.currentFocus !== -1 && charSpans[frame.currentFocus]) {
            charSpans[frame.currentFocus].classList.add('current-focus');
        }

        // Determine which class to use for matches: 'matched' for step-by-step, 'final-matched' for summary
        const isFinalSummaryFrame = (index === frames.length - 1 && frame.currentFocus === -1);
        const matchClass = isFinalSummaryFrame ? 'final-matched' : 'matched';

        frame.matches.forEach(match => {
            for (let i = match.start; i < match.end; i++) {
                if (charSpans[i]) {
                    charSpans[i].classList.add(matchClass);
                }
            }
        });

        stepInfo.textContent = `Step ${currentFrameIndex + 1}/${frames.length}: ${frame.message}`;

        if (isFinalSummaryFrame) { // For the final summary step
            if (frame.matches.length > 0) {
                const matchesText = frame.matches.map(m => `'${m.text}' at index ${m.start}`).join(', ');
                matchResultInfo.textContent = `All Matches: ${matchesText}.`;
                matchResultInfo.classList.remove('no-match-info');
                matchResultInfo.classList.add('match-found-summary');
            } else {
                matchResultInfo.textContent = 'No matches found in the string.';
                matchResultInfo.classList.add('no-match-info');
                matchResultInfo.classList.remove('match-found-summary');
            }
        } else { // For individual step-by-step frames
            if (frame.matches.length > 0) {
                matchResultInfo.textContent = `Match: '${frame.matches[0].text}' at index ${frame.matches[0].start}.`;
                matchResultInfo.classList.remove('no-match-info', 'match-found-summary');
            } else if (frame.message.includes('No match')) {
                matchResultInfo.textContent = 'No match found from this position.';
                matchResultInfo.classList.add('no-match-info');
                matchResultInfo.classList.remove('match-found-summary');
            } else {
                 matchResultInfo.textContent = ''; 
                 matchResultInfo.classList.remove('no-match-info', 'match-found-summary');
            }
        }
        updateControls();
    }

    function updateControls() {
        prevBtn.disabled = currentFrameIndex === 0;
        nextBtn.disabled = currentFrameIndex === frames.length - 1;
        playPauseBtn.disabled = frames.length <= 1; // Disable play/pause if only 0 or 1 frame

        if (animationInterval) {
            playPauseBtn.textContent = '❚❚ Pause';
            playPauseBtn.classList.add('playing');
        } else {
            playPauseBtn.textContent = '▶ Play';
            playPauseBtn.classList.remove('playing');
        }
    }

    function togglePlayPause() {
        if (animationInterval) {
            pauseAnimation();
        } else {
            playAnimation();
        }
    }

    function playAnimation() {
        if (frames.length === 0) return;
        if (currentFrameIndex === frames.length - 1) {
            showFrame(0); // Restart if at the end
        }
        animationInterval = setInterval(() => {
            if (currentFrameIndex < frames.length - 1) {
                showFrame(currentFrameIndex + 1);
            } else {
                pauseAnimation(); // Stop at the end
            }
        }, animationSpeed);
        updateControls();
    }

    function pauseAnimation() {
        clearInterval(animationInterval);
        animationInterval = null;
        updateControls();
    }

    // Initial setup
    visualizePattern(); // Run with default values on load
});
