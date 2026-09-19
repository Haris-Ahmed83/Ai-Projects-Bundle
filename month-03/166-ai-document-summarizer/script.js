document.addEventListener('DOMContentLoaded', () => {
    const documentInput = document.getElementById('document-input');
    const summarizeBtn = document.getElementById('summarize-btn');
    const loadingIndicator = document.getElementById('loading-indicator');
    const summaryOutput = document.getElementById('summary-output');

    summarizeBtn.addEventListener('click', () => {
        const text = documentInput.value.trim();

        if (text === '') {
            summaryOutput.textContent = 'Please paste some text into the document field to summarize.';
            summaryOutput.style.color = 'red';
            return;
        }

        summaryOutput.style.color = 'var(--text-color)'; // Reset color
        summaryOutput.textContent = ''; // Clear previous summary
        loadingIndicator.classList.remove('hidden'); // Show loading indicator
        summarizeBtn.disabled = true; // Disable button during processing

        // Simulate API call to an AI summarization service
        // In a real application, you would make a fetch() request here:
        // fetch('/api/summarize', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ document: text })
        // })
        // .then(response => {
        //     if (!response.ok) {
        //         throw new Error(`HTTP error! status: ${response.status}`);
        //     }
        //     return response.json();
        // })
        // .then(data => {
        //     summaryOutput.textContent = data.summary;
        // })
        // .catch(error => {
        //     summaryOutput.textContent = 'Error summarizing document. Please try again.';
        //     console.error('Summarization error:', error);
        // })
        // .finally(() => {
        //     loadingIndicator.classList.add('hidden');
        //     summarizeBtn.disabled = false;
        // });

        // --- MOCKED API CALL FOR DEMONSTRATION ---
        setTimeout(() => {
            // A very basic, non-AI "summarization" for frontend demo purposes
            // In a real app, this would come from the AI API response.
            const words = text.split(/\s+/);
            let simulatedSummary = '';

            if (words.length > 50) {
                simulatedSummary = words.slice(0, Math.floor(words.length * 0.3)).join(' ') + '... [AI-generated concise summary]';
            } else if (words.length > 10) {
                 simulatedSummary = words.slice(0, Math.floor(words.length * 0.5)).join(' ') + '... [AI-generated summary]';
            } else {
                simulatedSummary = text + ' [This document is too short for meaningful summarization, but an AI would handle it!]';
            }


            summaryOutput.textContent = simulatedSummary;
            loadingIndicator.classList.add('hidden'); // Hide loading indicator
            summarizeBtn.disabled = false; // Enable button
        }, 2000); // Simulate 2 seconds of API latency
    });
});
