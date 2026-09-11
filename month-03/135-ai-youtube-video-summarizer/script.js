document.addEventListener('DOMContentLoaded', () => {
    const youtubeUrlInput = document.getElementById('youtubeUrl');
    const summarizeBtn = document.getElementById('summarizeBtn');
    const statusMessage = document.getElementById('statusMessage');
    const summaryOutput = document.getElementById('summaryOutput');
    const summaryText = document.getElementById('summaryText');

    summarizeBtn.addEventListener('click', async () => {
        const url = youtubeUrlInput.value.trim();
        statusMessage.textContent = '';
        summaryOutput.classList.add('hidden');
        summaryText.innerHTML = '';

        if (!url) {
            statusMessage.textContent = 'Please enter a YouTube video URL.';
            statusMessage.style.color = '#e74c3c'; // Red for error
            return;
        }

        const videoId = getYouTubeVideoId(url);

        if (!videoId) {
            statusMessage.textContent = 'Invalid YouTube URL. Please enter a valid link.';
            statusMessage.style.color = '#e74c3c'; // Red for error
            return;
        }

        // Simulate API call
        statusMessage.textContent = 'Summarizing video... This might take a moment.';
        statusMessage.classList.add('loading');
        statusMessage.style.color = '#28a745'; // Green for loading
        summarizeBtn.disabled = true;
        youtubeUrlInput.disabled = true;

        try {
            // Simulate network delay and AI processing
            const mockSummary = await simulateAISummary(videoId);

            summaryText.innerHTML = mockSummary;
            summaryOutput.classList.remove('hidden');
            statusMessage.textContent = 'Summary generated successfully!';
            statusMessage.style.color = '#28a745'; // Green for success
        } catch (error) {
            statusMessage.textContent = `Error: ${error.message}`;
            statusMessage.style.color = '#e74c3c'; // Red for error
            summaryOutput.classList.add('hidden');
        } finally {
            summarizeBtn.disabled = false;
            youtubeUrlInput.disabled = false;
            statusMessage.classList.remove('loading');
        }
    });

    /**
     * Extracts YouTube video ID from various YouTube URL formats.
     * @param {string} url - The YouTube video URL.
     * @returns {string|null} The video ID or null if not found.
     */
    function getYouTubeVideoId(url) {
        const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    /**
     * Simulates an AI summarization API call.
     * In a real application, this would involve a fetch() request to a backend API.
     * @param {string} videoId - The YouTube video ID.
     * @returns {Promise<string>} A promise that resolves with a mock summary.
     */
    function simulateAISummary(videoId) {
        return new Promise((resolve, reject) => {
            const delay = Math.random() * 2000 + 1500; // Simulate 1.5 to 3.5 seconds delay

            setTimeout(() => {
                // Mock different summaries based on videoId or just a generic one
                const summaries = {
                    'dQw4w9WgXcQ': `This video, "Never Gonna Give You Up" by Rick Astley, is a classic 1987 synth-pop hit. The summary highlights its iconic status as a meme ('Rickrolling'), its catchy melody, and Astley's powerful baritone vocals delivering a message of unwavering commitment and love. The song is a cultural phenomenon, celebrated for its earnest lyrics and nostalgic appeal.`, 
                    'xvFZjo5PgG0': `This video likely discusses the latest advancements in AI, focusing on topics such as large language models (LLMs), neural networks, and their applications in various industries. Key takeaways include the rapid pace of AI development, ethical considerations, and its potential to revolutionize daily life and work.`, 
                    'kqtD5dpn9C8': `This video, titled "The Science of Sleep," explores the critical importance of sleep for physical and mental health. It delves into sleep cycles (REM, NREM), common sleep disorders like insomnia and apnea, and practical tips for improving sleep hygiene. The summary emphasizes how adequate sleep enhances cognitive function, mood regulation, and overall well-being.`, 
                    'L02x0Wf24QY': `This video explores the fundamentals of quantum computing, explaining complex concepts like superposition and entanglement in an accessible manner. It outlines the potential applications of quantum computers in fields such as drug discovery, materials science, and cryptography, while also addressing the significant challenges in building and maintaining these cutting-edge machines.`, 
                    'q2CjKx_3jFk': `This tutorial demonstrates how to build a basic web application using HTML, CSS, and JavaScript. It covers setting up the project structure, styling with modern CSS techniques (like Flexbox), and adding interactivity with vanilla JavaScript, providing a solid foundation for aspiring web developers.`
                };

                const mockSummary = summaries[videoId] || `This video (ID: ${videoId}) discusses various aspects of its primary topic. The AI analysis identified key themes including [Topic 1], [Topic 2], and [Topic 3]. The presenter emphasized the importance of [Key Concept] and provided insights into [Specific Example]. Overall, the video offers a comprehensive overview of the subject matter, highlighting its relevance and future implications.`;

                // Simulate potential errors for demonstration
                if (Math.random() < 0.05) { // 5% chance of a simulated error
                    reject(new Error('Failed to process video audio or generate summary. Please try again.'));
                } else {
                    resolve(mockSummary);
                }
            }, delay);
        });
    }
});
