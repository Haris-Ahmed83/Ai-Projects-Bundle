document.addEventListener('DOMContentLoaded', () => {
    const documentText = document.getElementById('documentText');
    const fileUpload = document.getElementById('fileUpload');
    const fileNameSpan = document.getElementById('fileName');
    const summarizeBtn = document.getElementById('summarizeBtn');
    const summaryOutput = document.getElementById('summaryOutput');

    // Handle file upload
    fileUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            fileNameSpan.textContent = file.name;
            if (file.type === 'text/plain') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    documentText.value = e.target.result;
                };
                reader.onerror = () => {
                    summaryOutput.innerHTML = '<p style="color: red;">Error reading file.</p>';
                };
                reader.readAsText(file);
            } else {
                summaryOutput.innerHTML = '<p style="color: orange;">Only .txt files are supported for direct reading in this demo.</p>';
                documentText.value = ''; // Clear textarea if unsupported file
            }
        } else {
            fileNameSpan.textContent = 'No file chosen';
            documentText.value = '';
        }
    });

    // Handle summarization
    summarizeBtn.addEventListener('click', () => {
        const text = documentText.value.trim();
        summaryOutput.innerHTML = '<p>Processing your document...</p>'; // Loading indicator

        if (text === '') {
            summaryOutput.innerHTML = '<p style="color: red;">Please paste some text or upload a document to summarize.</p>';
            return;
        }

        // Simulate AI summarization with a delay
        setTimeout(() => {
            const summary = generateMockSummary(text);
            summaryOutput.innerHTML = `<p>${summary}</p><p style="font-style: italic; font-size: 0.9em; color: #666;">(This is a simulated AI summary. For a real AI summary, a backend service would be required.)</p>`;
        }, 1500); // Simulate network delay
    });

    /**
     * Generates a mock summary by taking the first few sentences.
     * In a real application, this would be replaced by an actual AI/NLP API call.
     * @param {string} text - The input text to summarize.
     * @returns {string} The mock summary.
     */
    function generateMockSummary(text) {
        // Split text into sentences. A very basic approach.
        // This regex tries to split by common sentence endings followed by a space or end of string.
        const sentences = text.match(/[^.!?]+[.!?]*\s*/g) || [];

        if (sentences.length === 0) {
            return "Could not generate a summary. The text might be too short or lack proper sentence structure.";
        }

        // Take the first 3 sentences for a concise summary
        const summarySentences = sentences.slice(0, Math.min(sentences.length, 3));

        let summary = summarySentences.join('').trim();

        // Add an ellipsis if the original text had more sentences than included in the summary
        if (sentences.length > summarySentences.length) {
            summary += '...';
        }

        if (summary.length < 50 && sentences.length === 1) { // If only one short sentence, just return it.
            return sentences[0].trim();
        }

        return summary;
    }
});
