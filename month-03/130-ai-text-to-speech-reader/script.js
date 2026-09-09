document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const voiceSelect = document.getElementById('voiceSelect');
    const readButton = document.getElementById('readButton');
    const stopButton = document.getElementById('stopButton');
    const supportMessage = document.getElementById('supportMessage');

    let utterance = null; // Holds the SpeechSynthesisUtterance object
    let voices = []; // Array to store available voices

    // Check for Speech Synthesis API support
    if (!('speechSynthesis' in window)) {
        supportMessage.style.display = 'block';
        textInput.disabled = true;
        readButton.disabled = true;
        voiceSelect.disabled = true;
        return; // Stop further execution if API is not supported
    }

    // Function to populate voices dropdown
    function populateVoiceList() {
        voices = window.speechSynthesis.getVoices();
        voiceSelect.innerHTML = ''; // Clear existing options

        // Filter for English voices, or use all if no English voices are found
        const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
        const voicesToUse = englishVoices.length > 0 ? englishVoices : voices;

        voicesToUse.forEach(voice => {
            const option = document.createElement('option');
            option.textContent = `${voice.name} (${voice.lang})`;
            option.setAttribute('data-lang', voice.lang);
            option.setAttribute('data-name', voice.name);
            voiceSelect.appendChild(option);
        });

        // Set a default voice if available
        if (voiceSelect.options.length > 0) {
            // Try to select a common English voice as default
            const defaultVoiceOption = Array.from(voiceSelect.options).find(option =>
                option.textContent.includes('Google US English') ||
                option.textContent.includes('Microsoft David') ||
                option.textContent.includes('Microsoft Zira') ||
                option.textContent.includes('Apple Samantha')
            );
            if (defaultVoiceOption) {
                defaultVoiceOption.selected = true;
            } else {
                voiceSelect.selectedIndex = 0; // Fallback to the first voice
            }
        }
    }

    // Populate voices when they are loaded (async)
    // onvoiceschanged is fired when the list of SpeechSynthesisVoice objects changes.
    // This can happen when new voices are installed or when the browser loads them.
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = populateVoiceList;
    } else {
        // Fallback for browsers that might not fire onvoiceschanged immediately
        // or where voices are already loaded by the time the script runs.
        populateVoiceList();
    }

    // Also call it with a small delay, as sometimes onvoiceschanged might not fire immediately
    // or the voices array might be empty initially. This helps ensure voices are loaded.
    setTimeout(populateVoiceList, 100);

    // Event listener for Read button
    readButton.addEventListener('click', () => {
        const text = textInput.value.trim();
        if (text === '') {
            alert('Please enter some text to read.');
            return;
        }

        // Stop any ongoing speech before starting a new one
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        utterance = new SpeechSynthesisUtterance(text);

        // Set selected voice
        const selectedOption = voiceSelect.selectedOptions[0];
        if (selectedOption) {
            const selectedVoiceName = selectedOption.getAttribute('data-name');
            utterance.voice = voices.find(voice => voice.name === selectedVoiceName);
        }

        // Event handlers for utterance lifecycle
        utterance.onstart = () => {
            readButton.disabled = true;
            stopButton.disabled = false;
            textInput.disabled = true;
            voiceSelect.disabled = true;
        };

        utterance.onend = () => {
            readButton.disabled = false;
            stopButton.disabled = true;
            textInput.disabled = false;
            voiceSelect.disabled = false;
        };

        utterance.onerror = (event) => {
            console.error('SpeechSynthesisUtterance.onerror', event);
            alert(`Speech synthesis error: ${event.error}. Please try again.`);
            // Re-enable controls on error
            readButton.disabled = false;
            stopButton.disabled = true;
            textInput.disabled = false;
            voiceSelect.disabled = false;
        };

        window.speechSynthesis.speak(utterance);
    });

    // Event listener for Stop button
    stopButton.addEventListener('click', () => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel(); // This will trigger utterance.onend
        }
    });
});
