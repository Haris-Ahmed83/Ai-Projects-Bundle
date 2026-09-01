document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const voiceSelect = document.getElementById('voiceSelect');
    const languageSelect = document.getElementById('languageSelect');
    const playButton = document.getElementById('playButton');
    const downloadButton = document.getElementById('downloadButton');
    const shareButton = document.getElementById('shareButton');
    // The audioPlayer element is not used by the native SpeechSynthesis API for playback.
    // It's included for a complete project feel, as a real API integration might use it.
    const audioPlayer = document.getElementById('audioPlayer'); 

    let voices = [];
    let currentUtterance = null; // To keep track of the current speech utterance

    // Function to populate voice and language dropdowns
    function populateVoiceList() {
        voices = speechSynthesis.getVoices();
        voiceSelect.innerHTML = ''; // Clear existing voice options
        languageSelect.innerHTML = ''; // Clear existing language options

        const availableLanguages = new Set();

        // First, collect all unique languages
        voices.forEach(voice => {
            availableLanguages.add(voice.lang);
        });

        // Populate language options
        const sortedLanguages = Array.from(availableLanguages).sort();
        sortedLanguages.forEach(lang => {
            const option = document.createElement('option');
            option.textContent = lang;
            option.value = lang;
            languageSelect.appendChild(option);
        });

        // Try to set default language to en-US or first available English, then filter
        const defaultLang = sortedLanguages.find(lang => lang === 'en-US' || lang.startsWith('en')) || sortedLanguages[0];
        if (defaultLang) {
            languageSelect.value = defaultLang;
        }

        filterVoicesByLanguage(); // Filter voices immediately after populating languages
    }

    // Function to filter voices when language selection changes
    function filterVoicesByLanguage() {
        const selectedLang = languageSelect.value;
        voiceSelect.innerHTML = ''; // Clear current voice options

        let firstVoiceForLang = null;

        // Populate voice options based on the currently selected language
        voices.forEach(voice => {
            if (voice.lang === selectedLang) {
                const option = document.createElement('option');
                option.textContent = `${voice.name} (${voice.lang})`;
                option.value = voice.name;
                voiceSelect.appendChild(option);
                if (!firstVoiceForLang) {
                    firstVoiceForLang = voice.name; // Keep track of the first valid voice
                }
            }
        });

        // Set the voiceSelect to the first available voice for the selected language
        // or clear if none are found.
        if (firstVoiceForLang) {
            voiceSelect.value = firstVoiceForLang;
        } else {
            voiceSelect.value = ''; // No voice found for this language
        }
    }

    // Event listener for when voices are loaded/changed
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => {
            populateVoiceList();
            // No need to call filterVoicesByLanguage here, populateVoiceList already does it.
        };
    }
    
    // Initial population call (for browsers that might not fire onvoiceschanged on DOMContentLoaded)
    populateVoiceList();

    // Event listener for language selection change
    languageSelect.addEventListener('change', filterVoicesByLanguage);

    // Function to speak the text
    function speakText() {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel(); // Stop any ongoing speech
        }

        const text = textInput.value.trim();
        if (!text) {
            alert('Please enter some text to speak.');
            return;
        }

        const selectedVoiceName = voiceSelect.value;
        const selectedVoice = voices.find(voice => voice.name === selectedVoiceName);

        if (!selectedVoice) {
            alert('Selected voice not found. Please try again or refresh.');
            return;
        }

        currentUtterance = new SpeechSynthesisUtterance(text);
        currentUtterance.voice = selectedVoice;
        currentUtterance.lang = selectedVoice.lang; // Ensure language matches voice

        // Optional: adjust pitch and rate if desired (e.g., from sliders)
        // currentUtterance.pitch = 1; // 0 to 2
        // currentUtterance.rate = 1;  // 0.1 to 10

        playButton.textContent = 'Stop';
        playButton.classList.add('speaking'); // Add a class for styling if needed

        currentUtterance.onend = () => {
            playButton.textContent = 'Play';
            playButton.classList.remove('speaking');
            currentUtterance = null;
        };

        currentUtterance.onerror = (event) => {
            console.error('SpeechSynthesisUtterance.onerror', event);
            alert('Error during speech synthesis: ' + event.error);
            playButton.textContent = 'Play';
            playButton.classList.remove('speaking');
            currentUtterance = null;
        };

        speechSynthesis.speak(currentUtterance);
    }

    // Event listener for play button
    playButton.addEventListener('click', () => {
        if (speechSynthesis.speaking && currentUtterance) {
            speechSynthesis.cancel(); // Stop current speech
            playButton.textContent = 'Play';
            playButton.classList.remove('speaking');
            currentUtterance = null;
        } else {
            speakText();
        }
    });

    // Event listener for download button
    downloadButton.addEventListener('click', () => {
        // IMPORTANT: The browser's native SpeechSynthesis API does not provide a direct way
        // to get the audio data as a downloadable file (Blob/URL) client-side.
        // To truly download the synthesized audio, you would need to use a server-side
        // Text-to-Speech API (e.g., Google Cloud TTS, AWS Polly) that returns an audio file.
        alert('Downloading synthesized audio directly from the browser\'s native Text-to-Speech API is not supported. This feature would require integration with a server-side Text-to-Speech service.');

        // As a placeholder, you could download the text input as a .txt file:
        /*
        const textToDownload = textInput.value;
        if (textToDownload.trim()) {
            const blob = new Blob([textToDownload], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'tts_input.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            alert('No text to download.');
        }
        */
    });

    // Event listener for share button
    shareButton.addEventListener('click', () => {
        const textToShare = textInput.value.trim();
        if (!textToShare) {
            alert('No text to share.');
            return;
        }

        if (navigator.share) {
            navigator.share({
                title: 'Text-to-Speech Studio',
                text: textToShare,
                url: window.location.href // Share the current page URL
            })
            .then(() => console.log('Text shared successfully'))
            .catch((error) => console.error('Error sharing:', error));
        } else {
            // Fallback for browsers that do not support Web Share API
            navigator.clipboard.writeText(textToShare)
                .then(() => alert('Text copied to clipboard! You can paste it to share.'))
                .catch(err => console.error('Failed to copy text: ', err));
        }
    });
});
