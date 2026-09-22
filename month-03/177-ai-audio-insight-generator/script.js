document.addEventListener('DOMContentLoaded', () => {
    const audioFileInput = document.getElementById('audioFile');
    const audioUrlInput = document.getElementById('audioUrl');
    const processAudioBtn = document.getElementById('processAudioBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const transcriptionOutput = document.getElementById('transcriptionOutput');
    const insightsOutput = document.getElementById('insightsOutput');

    // Initial state setup
    transcriptionOutput.innerHTML = '<em>Transcription will appear here.</em>';
    insightsOutput.innerHTML = '<em>Insights will appear here.</em>';
    loadingIndicator.classList.add('hidden');

    // Enable/disable button based on input
    const checkInputs = () => {
        const fileSelected = audioFileInput.files.length > 0;
        const urlEntered = audioUrlInput.value.trim() !== '';

        if (fileSelected || urlEntered) {
            processAudioBtn.disabled = false;
        } else {
            processAudioBtn.disabled = true;
        }
    };

    audioFileInput.addEventListener('change', () => {
        // Clear URL input if file is selected
        if (audioFileInput.files.length > 0) {
            audioUrlInput.value = '';
        }
        checkInputs();
    });

    audioUrlInput.addEventListener('input', () => {
        // Clear file input if URL is entered
        if (audioUrlInput.value.trim() !== '') {
            audioFileInput.value = ''; // Clears selected file
        }
        checkInputs();
    });

    // Initial check
    checkInputs();

    processAudioBtn.addEventListener('click', async () => {
        const file = audioFileInput.files[0];
        const url = audioUrlInput.value.trim();

        if (!file && !url) {
            alert('Please upload an audio file or enter an audio URL.');
            return;
        }

        // Clear previous results
        transcriptionOutput.textContent = '';
        insightsOutput.textContent = '';
        loadingIndicator.classList.remove('hidden');
        processAudioBtn.disabled = true; // Disable button during processing

        // Simulate API call and processing
        try {
            const simulatedTranscription = await simulateAudioProcessing(file, url);
            const simulatedInsights = generateMockInsights(simulatedTranscription);

            transcriptionOutput.textContent = simulatedTranscription;
            insightsOutput.textContent = simulatedInsights;

        } catch (error) {
            console.error("Error during simulated processing:", error);
            transcriptionOutput.textContent = 'Error: Could not process audio. Please try again.';
            insightsOutput.textContent = 'Error: No insights generated due to processing failure.';
        } finally {
            loadingIndicator.classList.add('hidden');
            processAudioBtn.disabled = false; // Re-enable button
        }
    });

    /**
     * Simulates an asynchronous audio processing (Speech-to-Text) API call.
     * @param {File | null} file - The uploaded audio file.
     * @param {string} url - The audio URL.
     * @returns {Promise<string>} A promise that resolves with a simulated transcription.
     */
    function simulateAudioProcessing(file, url) {
        return new Promise(resolve => {
            setTimeout(() => {
                let source = '';
                if (file) {
                    source = `file named "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
                } else if (url) {
                    source = `URL: "${url}"`;
                }

                const transcription = `
[Simulated Transcription]
This is a mock transcription generated for the audio from ${source}.
In a real application, this content would be produced by an advanced Speech-to-Text AI model.
The audio discussed various aspects of artificial intelligence, machine learning, and their applications in data analysis.
Key themes included the importance of ethical AI development, the potential for AI to revolutionize industries like healthcare and finance, and the ongoing research into more robust and explainable AI systems.
It also touched upon the challenges of data privacy, model bias, and the need for skilled human oversight in AI-driven processes.
The speaker emphasized that AI is a tool, and its ultimate impact depends on how responsibly it is developed and deployed.
                `;
                resolve(transcription.trim());
            }, 3000); // Simulate 3 seconds of processing time
        });
    }

    /**
     * Generates mock insights and a summary based on a simulated transcription.
     * In a real application, this would involve NLP techniques.
     * @param {string} transcription - The simulated transcription text.
     * @returns {string} A simulated summary and key insights.
     */
    function generateMockInsights(transcription) {
        // Simple keyword-based simulation for demonstration
        const keywords = ['AI', 'machine learning', 'ethical', 'revolutionize', 'healthcare', 'finance', 'data privacy', 'model bias', 'human oversight', 'responsible development'];
        const foundKeywords = keywords.filter(keyword => transcription.toLowerCase().includes(keyword.toLowerCase()));

        let insights = `
[Simulated Key Insights & Summary]

**Summary:**
The audio content, identified as coming from ${transcription.includes('file named') ? 'an uploaded file' : 'a provided URL'}, primarily focuses on the multifaceted world of Artificial Intelligence and Machine Learning. It delves into their transformative potential across sectors like healthcare and finance, while also highlighting critical considerations such as ethical development, data privacy, and the challenges of model bias. The overarching message underscores the necessity for responsible AI deployment and the continuous need for human involvement.

**Key Actionable Points:**
- **Ethical AI Development:** Prioritize and integrate ethical guidelines in all AI projects.
- **Industry Revolution:** Explore AI's potential to innovate and streamline operations in healthcare and finance.
- **Mitigate Risks:** Address concerns around data privacy and model bias through robust design and validation.
- **Human-in-the-Loop:** Ensure skilled human oversight complements AI-driven processes.
- **Continuous Learning:** Stay updated with ongoing AI research, especially in explainable AI.
        `;

        if (foundKeywords.length > 0) {
            insights += `\n**Detected Keywords:** ${foundKeywords.join(', ')}.`;
        }

        return insights.trim();
    }
});
