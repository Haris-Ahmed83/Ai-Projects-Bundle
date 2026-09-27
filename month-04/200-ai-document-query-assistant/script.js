document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const documentUploadInput = document.getElementById('documentUpload');
    const uploadStatus = document.getElementById('upload-status');
    const uploadedDocumentsList = document.getElementById('uploadedDocumentsList');
    const chatWindow = document.getElementById('chatWindow');
    const chatInput = document.getElementById('chatInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');

    // --- State Management ---
    let uploadedDocuments = []; // Stores { name: 'fileName.pdf', status: 'Processing'/'Ready', summary: '...' }
    let chatHistory = [
        { sender: 'ai', message: 'Hello! Upload a document to get started. Once uploaded, you can ask me questions about its content.' }
    ];

    // --- Functions ---

    /**
     * Renders the list of uploaded documents.
     */
    function renderDocuments() {
        uploadedDocumentsList.innerHTML = ''; // Clear existing list
        if (uploadedDocuments.length === 0) {
            uploadedDocumentsList.innerHTML = '<p style="color: var(--text-light); font-size: 0.9em;">No documents uploaded yet.</p>';
            return;
        }

        const ul = document.createElement('ul');
        uploadedDocuments.forEach(doc => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="doc-name">${doc.name}</span>
                <span class="doc-status" style="color: ${doc.status === 'Ready' ? 'var(--accent-color)' : 'var(--primary-color)'};">${doc.status}</span>
            `;
            ul.appendChild(li);
        });
        uploadedDocumentsList.appendChild(ul);
    }

    /**
     * Renders the chat history.
     */
    function renderChat() {
        chatWindow.innerHTML = ''; // Clear existing messages
        chatHistory.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('chat-message', msg.sender);
            messageDiv.innerHTML = `<p>${msg.message}</p>`;
            chatWindow.appendChild(messageDiv);
        });
        // Scroll to the bottom of the chat window
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    /**
     * Simulates backend processing of a document.
     * In a real application, this would involve:
     * 1. Sending file to a Node.js backend API.
     * 2. Backend parsing the document (e.g., using libraries for PDF, DOCX, TXT).
     * 3. Extracting text content.
     * 4. Splitting text into manageable chunks.
     * 5. Generating vector embeddings for each chunk (using an NLP/LLM model).
     * 6. Storing these embeddings in a vector database (e.g., Pinecone, Weaviate, ChromaDB).
     * 7. Returning a confirmation and perhaps a basic summary.
     */
    async function processDocument(file) {
        console.log(`Simulating processing for: ${file.name}`);
        const docEntry = uploadedDocuments.find(d => d.name === file.name);
        if (docEntry) {
            docEntry.status = 'Processing...';
            renderDocuments();
        }

        // Simulate async API call with a delay
        return new Promise(resolve => {
            setTimeout(() => {
                // In a real app, this would be the result of successful backend processing
                const simulatedContentSummary = `This document, '${file.name}', appears to be about [topic related to filename]. You can ask me to summarize it, find key points, or answer specific questions related to this topic.`;
                
                if (docEntry) {
                    docEntry.status = 'Ready';
                    // Store a simulated summary/metadata for later use in chat
                    docEntry.summary = simulatedContentSummary;
                }
                resolve({ success: true, summary: simulatedContentSummary });
            }, 2000 + Math.random() * 1000); // 2-3 second delay
        });
    }

    /**
     * Simulates AI response based on chat input and (hypothetical) document context.
     * In a real application, this would involve:
     * 1. Sending user query and context (e.g., uploaded document IDs, recent chat history) to a Node.js backend.
     * 2. Backend performing a vector similarity search in the vector database to find relevant document chunks.
     * 3. Constructing a prompt for an LLM (e.g., OpenAI's GPT, Anthropic's Claude) using the user's query and the retrieved document chunks (RAG - Retrieval-Augmented Generation).
     * 4. Sending the prompt to the LLM and processing its response.
     * 5. Returning the LLM's generated answer.
     */
    async function getAIResponse(query) {
        console.log(`Simulating AI response for query: "${query}"`);
        const lowerQuery = query.toLowerCase();
        let response = "I'm sorry, I couldn't find a direct answer to that. Please try rephrasing or upload more relevant documents.";

        if (uploadedDocuments.length > 0) {
            const readyDocs = uploadedDocuments.filter(doc => doc.status === 'Ready');
            const firstReadyDoc = readyDocs.length > 0 ? readyDocs[0] : null;

            if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
                response = `Hello there! I've processed your documents${firstReadyDoc ? `, including '${firstReadyDoc.name}'` : ''}. What would you like to know?`;
            } else if (lowerQuery.includes('summarize') || lowerQuery.includes('summary')) {
                if (firstReadyDoc && firstReadyDoc.summary) {
                    response = `Based on your uploaded documents, particularly '${firstReadyDoc.name}', here's a simulated summary: ${firstReadyDoc.summary.replace(`This document, '${firstReadyDoc.name}', `, 'It ')}.`;
                } else {
                    response = "I need a document to be ready before I can summarize it. Please wait for processing to complete or upload one.";
                }
            } else if (lowerQuery.includes('key points') || lowerQuery.includes('main ideas')) {
                if (firstReadyDoc) {
                    response = `For '${firstReadyDoc.name}', some simulated key points could include: core concepts, main objectives, and potential outcomes discussed within the document.`;
                } else {
                    response = "Please upload a document first to get key points.";
                }
            } else if (lowerQuery.includes('who is') || lowerQuery.includes('what is') || lowerQuery.includes('when is') || lowerQuery.includes('how to')) {
                if (firstReadyDoc) {
                    response = `To answer "${query}", I would typically search the content of '${firstReadyDoc.name}'. For instance, if '${firstReadyDoc.name}' was a company report, I might find details about its founders, market strategies, or fiscal year.`;
                } else {
                    response = "I can answer questions once you've uploaded documents.";
                }
            } else if (lowerQuery.includes('upload more')) {
                response = "You can upload more documents using the 'Choose Files' button on the left.";
            } else {
                response = `I can help you analyze documents. Try asking about their summary, specific details, or definitions of terms within them.`;
            }
        } else {
            response = "Please upload a document first so I have something to assist you with!";
        }

        return new Promise(resolve => {
            setTimeout(() => {
                resolve(response);
            }, 1000 + Math.random() * 1000); // 1-2 second delay
        });
    }

    // --- Event Handlers ---

    /**
     * Handles document file selection.
     */
    documentUploadInput.addEventListener('change', async (event) => {
        const files = event.target.files;
        if (files.length === 0) {
            uploadStatus.textContent = 'No files chosen.';
            return;
        }

        uploadStatus.textContent = `Processing ${files.length} file(s)...`;

        for (const file of Array.from(files)) {
            // Add document to state with 'Uploading...' status
            const newDoc = { name: file.name, status: 'Uploading...' };
            uploadedDocuments.push(newDoc);
            renderDocuments();

            // Simulate processing
            await processDocument(file);
            renderDocuments(); // Update status to 'Ready'

            // Add a chat message once document is ready
            if (newDoc.status === 'Ready') {
                chatHistory.push({ sender: 'ai', message: `Document '${newDoc.name}' uploaded and processed successfully! You can now ask me questions about it.` });
                renderChat();
            }
        }
        uploadStatus.textContent = `${files.length} file(s) uploaded and ready.`;
    });

    /**
     * Handles sending chat messages.
     */
    sendMessageBtn.addEventListener('click', async () => {
        const userQuery = chatInput.value.trim();
        if (userQuery === '') return;

        chatHistory.push({ sender: 'user', message: userQuery });
        renderChat();
        chatInput.value = ''; // Clear input
        sendMessageBtn.disabled = true; // Disable button while AI is thinking
        chatInput.disabled = true;

        // Simulate AI thinking message
        chatHistory.push({ sender: 'ai', message: 'Thinking...' });
        renderChat();

        const aiResponse = await getAIResponse(userQuery);
        // Remove 'Thinking...' message and add actual response
        chatHistory.pop(); // Remove the last 'Thinking...' message
        chatHistory.push({ sender: 'ai', message: aiResponse });
        renderChat();
        sendMessageBtn.disabled = false; // Re-enable button
        chatInput.disabled = false;
        chatInput.focus();
    });

    // Allow sending message by pressing Enter key
    chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !sendMessageBtn.disabled) {
            sendMessageBtn.click();
        }
    });

    // --- Initial Render ---
    renderDocuments();
    renderChat();
});
