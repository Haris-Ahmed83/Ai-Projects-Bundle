document.addEventListener('DOMContentLoaded', () => {
    const audioFileInput = document.getElementById('audioFileInput');
    const generateSummaryBtn = document.getElementById('generateSummaryBtn');
    const statusMessage = document.getElementById('statusMessage');
    const summaryOutput = document.getElementById('summaryOutput');

    let selectedFile = null;

    // Disable button initially
    generateSummaryBtn.disabled = true;

    audioFileInput.addEventListener('change', (event) => {
        selectedFile = event.target.files[0];
        if (selectedFile) {
            statusMessage.className = 'status-message';
            statusMessage.textContent = `File selected: ${selectedFile.name}`;
            generateSummaryBtn.disabled = false;
        } else {
            statusMessage.className = 'status-message';
            statusMessage.textContent = 'No file selected.';
            generateSummaryBtn.disabled = true;
        }
    });

    generateSummaryBtn.addEventListener('click', () => {
        if (!selectedFile) {
            displayStatus('Please select an audio file first.', 'error');
            return;
        }

        // Basic file type check (more robust checks would be server-side)
        if (!selectedFile.type.startsWith('audio/')) {
            displayStatus('Invalid file type. Please upload an audio file.', 'error');
            summaryOutput.textContent = 'Error: Please upload a valid audio file.';
            return;
        }

        // Simulate processing
        displayStatus('Uploading and processing audio... <span class="loading-spinner"></span>', 'loading');
        generateSummaryBtn.disabled = true;
        summaryOutput.textContent = ''; // Clear previous summary

        // Simulate API call delay
        setTimeout(() => {
            try {
                // In a real application, 'selectedFile' would be sent to a backend
                // for Speech-to-Text and NLP processing.
                // For this simulation, we generate a placeholder summary.
                const fileName = selectedFile.name;
                const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);

                const summaryText = `
                Summary for: "${fileName}"
                File Size: ${fileSizeMB} MB

                --- Simulated AI Summary ---

                This podcast, likely discussing topics related to AI and machine learning, focuses on the advancements in speech recognition and natural language processing. The speaker delves into the challenges of transcribing diverse audio inputs and the subsequent task of extracting key information and generating concise summaries. Key themes include the ethical implications of AI in content generation, the future of automated content creation, and the potential for AI to revolutionize how we consume information.

                Specific points covered might include:
                - The architecture of modern speech-to-text models.
                - Techniques for identifying main topics and entities.
                - Strategies for abstractive versus extractive summarization.
                - The role of contextual understanding in NLP.
                - Potential applications in various industries, from media to education.

                Further discussion may involve the computational resources required for such tasks and the ongoing research to improve accuracy and efficiency.

                Disclaimer: This summary is a simulated output for demonstration purposes. A real AI Podcast Summary Generator would involve complex backend services for audio processing, speech-to-text conversion, and advanced natural language understanding.
                `;

                summaryOutput.textContent = summaryText;
                displayStatus('Summary generated successfully!', 'success');

            } catch (error) {
                console.error('Error during simulated summary generation:', error);
                displayStatus('An error occurred during summary generation.', 'error');
                summaryOutput.textContent = 'Failed to generate summary. Please try again.';
            } finally {
                generateSummaryBtn.disabled = false;
            }
        }, 3000); // Simulate a 3-second processing delay
    });

    function displayStatus(message, type) {
        statusMessage.innerHTML = message; // Use innerHTML to allow spinner SVG/HTML
        statusMessage.className = `status-message ${type}`;
    }
});
