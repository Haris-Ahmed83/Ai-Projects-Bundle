document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const summarizeBtn = document.getElementById('summarizeBtn');
    const summaryOutput = document.getElementById('summaryOutput');

    summarizeBtn.addEventListener('click', summarizePage);

    async function summarizePage() {
        const url = urlInput.value.trim();

        if (!url) {
            alert('Please enter a URL to summarize.');
            return;
        }

        if (!isValidUrl(url)) {
            alert('Please enter a valid URL (e.g., https://example.com).');
            return;
        }

        summaryOutput.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center;">Summarizing...</p>';
        summarizeBtn.disabled = true;
        urlInput.disabled = true;

        try {
            // --- SIMULATED AI API CALL --- 
            // In a real application, you would make an actual API call to a backend server.
            // This backend server would then scrape the URL, process its content using an AI/NLP model
            // (e.g., OpenAI, Google Cloud NLP, custom model), and return the summary.
            // Example: fetch('/api/summarize', { method: 'POST', body: JSON.stringify({ url }) });
            //
            // For this client-side only project, we'll simulate a network delay and provide a mock summary.

            await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate API latency

            const mockSummaryData = generateMockSummary(url);

            displaySummary(mockSummaryData);

        } catch (error) {
            console.error('Error during summarization:', error);
            summaryOutput.innerHTML = '<p style="color: red;">Failed to summarize. Please try again later or check the URL.</p>';
        } finally {
            summarizeBtn.disabled = false;
            urlInput.disabled = false;
        }
    }

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (e) {
            return false;
        }
    }

    function generateMockSummary(url) {
        // A simple mock summary based on the input URL.
        const urlHostname = new URL(url).hostname;
        const baseSummary = [
            `Key insights from ${urlHostname}:`,
            `Analysis indicates the page focuses on aspects related to '${urlHostname.split('.')[0]}'.`,
            `Potential topics covered include advanced AI applications and web technologies.`, 
            `The content likely aims to inform users about cutting-edge developments.`, 
            `This summary is simulated to demonstrate functionality.`
        ];

        return {
            title: `Simulated Summary for ${urlHostname}`,
            bulletPoints: baseSummary
        };
    }

    function displaySummary(data) {
        let html = `<h3>${data.title}</h3>`;
        if (data.bulletPoints && data.bulletPoints.length > 0) {
            html += '<ul>';
            data.bulletPoints.forEach(point => {
                html += `<li>${point}</li>`;
            });
            html += '</ul>';
        } else {
            html += '<p>No specific bullet points generated for this URL.</p>';
        }
        summaryOutput.innerHTML = html;
    }
});
