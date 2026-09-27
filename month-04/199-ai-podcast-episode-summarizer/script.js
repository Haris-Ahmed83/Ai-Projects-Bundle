document.addEventListener('DOMContentLoaded', () => {
    const podcastUrlInput = document.getElementById('podcastUrl');
    const audioFileInput = document.getElementById('audioFile');
    const processButton = document.getElementById('processButton');
    const loadingMessage = document.getElementById('loadingMessage');
    const transcriptionOutput = document.getElementById('transcriptionOutput');
    const summaryOutput = document.getElementById('summaryOutput');

    processButton.addEventListener('click', async () => {
        const podcastUrl = podcastUrlInput.value.trim();
        const audioFile = audioFileInput.files[0];

        // Clear previous outputs
        transcriptionOutput.innerHTML = '<p>Transcription will appear here...</p>';
        summaryOutput.innerHTML = '<p>Summary will appear here...</p>';
        loadingMessage.textContent = '';

        if (!podcastUrl && !audioFile) {
            loadingMessage.textContent = 'Please enter a URL or upload an audio file.';
            loadingMessage.style.color = '#e74c3c'; // Red for error
            return;
        }

        // --- Simulate AI Processing ---
        processButton.disabled = true;
        loadingMessage.textContent = 'Processing... This might take a moment.';
        loadingMessage.style.color = '#e67e22'; // Orange for loading

        try {
            // Simulate transcription
            const transcription = await mockTranscribeAudio(podcastUrl || audioFile);
            transcriptionOutput.innerHTML = `<p>${transcription}</p>`;

            // Simulate summarization
            const summary = await mockSummarizeText(transcription);
            summaryOutput.innerHTML = `<p>${summary}</p>`;

            loadingMessage.textContent = 'Processing complete!';
            loadingMessage.style.color = '#27ae60'; // Green for success

        } catch (error) {
            console.error('AI Processing Error:', error);
            loadingMessage.textContent = `Error: ${error.message}`;
            loadingMessage.style.color = '#e74c3c'; // Red for error
            transcriptionOutput.innerHTML = `<p>Error during transcription: ${error.message}</p>`;
            summaryOutput.innerHTML = `<p>Error during summarization: ${error.message}</p>`;
        } finally {
            processButton.disabled = false;
        }
    });

    /**
     * Mocks an AI audio transcription service.
     * @param {string|File} input - The podcast URL or audio File.
     * @returns {Promise<string>} A promise that resolves with a simulated transcription.
     */
    async function mockTranscribeAudio(input) {
        console.log(`Simulating transcription for: ${typeof input === 'string' ? input : input.name}`);
        return new Promise(resolve => {
            setTimeout(() => {
                const mockTranscription = `
                (Intro Music fades)

                Host: Welcome back to "Future Frontiers," the podcast exploring the cutting edge of technology and its impact on our world. Today, we're diving deep into the fascinating realm of Generative AI, specifically large language models. With me is Dr. Anya Sharma, a leading researcher in AI ethics and development. Anya, thanks for joining us.

                Anya: Thanks for having me, John. It's a pleasure to be here.

                Host: So, Generative AI has been making headlines, from creating art to writing code. For those new to the concept, how would you best describe what it is and why it's such a game-changer?

                Anya: At its core, Generative AI refers to AI systems capable of producing novel content – whether that's text, images, audio, or even video – that didn't explicitly exist in its training data. Unlike discriminative AI, which classifies or predicts based on existing data, generative models create. The "game-changer" aspect comes from its ability to learn underlying patterns and structures from vast datasets and then apply that understanding to generate entirely new, yet coherent and contextually relevant, outputs. This shifts AI from being purely analytical to being truly creative.

                Host: That's a great distinction. And we've seen a rapid acceleration in capabilities, particularly with Large Language Models, or LLMs. What makes them so powerful, and what are some of the current limitations or ethical concerns you're observing?

                Anya: LLMs are powerful because of their scale – billions, even trillions, of parameters – and the sheer volume of text data they're trained on. This allows them to capture incredibly nuanced linguistic patterns, grammar, factual knowledge, and even reasoning abilities to some extent. They can translate, summarize, write different kinds of creative content, and answer your questions in an informative way.

                However, limitations are significant. They can 'hallucinate,' meaning they generate plausible-sounding but factually incorrect information. Bias is another major concern; if the training data contains societal biases, the model will reflect and even amplify them. Then there are issues of intellectual property, environmental impact due to their energy consumption, and the potential for misuse in generating misinformation or deepfakes. From an ethical standpoint, transparency, accountability, and fairness are paramount, and we're still grappling with how to effectively implement these.

                Host: Fascinating. So, looking ahead, what do you see as the next big challenges or breakthroughs in Generative AI?

                Anya: I believe the next frontier involves improving reliability and factuality, perhaps through better integration with external knowledge bases or more sophisticated reasoning architectures. Personalization will also become key, allowing these models to adapt more deeply to individual user needs while maintaining privacy. And critically, we need robust regulatory frameworks and public education to ensure these powerful tools are developed and deployed responsibly for the benefit of humanity, not just for profit. The human-AI collaboration aspect is also exciting – how can AI augment human creativity rather than replace it?

                Host: Dr. Anya Sharma, thank you for shedding light on these complex and crucial topics. It's been an incredibly insightful discussion.

                Anya: My pleasure, John.

                (Outro Music fades in)
                `;
                resolve(mockTranscription.trim());
            }, 2500); // Simulate network latency and processing time
        });
    }

    /**
     * Mocks an AI text summarization service.
     * @param {string} text - The text to summarize.
     * @returns {Promise<string>} A promise that resolves with a simulated summary.
     */
    async function mockSummarizeText(text) {
        console.log('Simulating summarization...');
        return new Promise(resolve => {
            setTimeout(() => {
                // A very simple "summary" for demonstration purposes
                const mockSummary = `
                This episode of "Future Frontiers" features an interview with Dr. Anya Sharma, an AI ethics researcher, discussing Generative AI and Large Language Models (LLMs). Dr. Sharma explains Generative AI's ability to create novel content by learning patterns from vast datasets, distinguishing it from discriminative AI. She highlights LLMs' power due to their scale and data volume, enabling tasks like translation and content creation.

                However, she also addresses significant limitations and ethical concerns, including hallucinations, bias amplification from training data, intellectual property issues, and environmental impact. Dr. Sharma emphasizes the need for transparency, accountability, and fairness in AI development. Looking forward, she foresees challenges in improving reliability and factuality, enhancing personalization, and establishing robust regulatory frameworks to ensure responsible AI deployment. She also stresses the importance of human-AI collaboration to augment creativity.
                `;
                resolve(mockSummary.trim());
            }, 1500); // Simulate network latency and processing time
        });
    }
});
