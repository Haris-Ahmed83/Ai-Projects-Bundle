document.addEventListener('DOMContentLoaded', () => {
    const fileUpload = document.getElementById('file-upload');
    const urlInput = document.getElementById('url-input');
    const addUrlBtn = document.getElementById('add-url-btn');
    const processDocsBtn = document.getElementById('process-docs-btn');
    const docSearch = document.getElementById('doc-search');
    const documentsList = document.getElementById('documents-list');
    const noDocsMessage = document.getElementById('no-docs-message');
    const aiQuestion = document.getElementById('ai-question');
    const askAiBtn = document.getElementById('ask-ai-btn');
    const aiResponseDiv = document.getElementById('ai-response');

    let documents = [];

    // --- Local Storage Management ---
    const saveDocuments = () => {
        localStorage.setItem('knowledgeHubDocuments', JSON.stringify(documents));
    };

    const loadDocuments = () => {
        const storedDocs = localStorage.getItem('knowledgeHubDocuments');
        if (storedDocs) {
            documents = JSON.parse(storedDocs);
            renderDocuments();
        }
    };

    // --- Document Processing & Rendering ---
    const generateMockSummary = (content) => {
        const words = content.split(/\s+/).filter(word => word.length > 0);
        const summaryWords = words.slice(0, Math.min(words.length, 30)); // First 30 words as summary
        return summaryWords.join(' ') + (words.length > 30 ? '...' : '');
    };

    const addDocument = (name, type, content, url = null) => {
        const newDoc = {
            id: Date.now().toString(),
            name: name,
            type: type,
            content: content, // For files, this is the text content; for URLs, it's the URL itself
            url: url, // Store original URL if applicable
            mockSummary: generateMockSummary(content || name), // Generate a mock summary
            mockInsights: [
                "Identified key concepts related to " + name.split(' ')[0] + ".",
                "Potential connection with existing document 'Project X Overview'.",
                "Recommended further reading on " + type + " topics."
            ].slice(0, Math.floor(Math.random() * 3) + 1)
        };
        documents.push(newDoc);
        saveDocuments();
        renderDocuments();
    };

    const renderDocuments = (filter = '') => {
        documentsList.innerHTML = '';
        const filteredDocs = documents.filter(doc => 
            doc.name.toLowerCase().includes(filter.toLowerCase()) ||
            (doc.content && doc.content.toLowerCase().includes(filter.toLowerCase()))
        );

        if (filteredDocs.length === 0) {
            noDocsMessage.style.display = 'block';
            documentsList.style.display = 'none';
            return;
        }

        noDocsMessage.style.display = 'none';
        documentsList.style.display = 'grid';

        filteredDocs.forEach(doc => {
            const docItem = document.createElement('div');
            docItem.classList.add('document-item');
            docItem.setAttribute('data-id', doc.id);
            docItem.innerHTML = `
                <h3>${doc.name}</h3>
                <p>Type: ${doc.type === 'url' ? 'Web Link' : doc.type.toUpperCase()}</p>
                <p>${doc.mockSummary}</p>
                <div class="actions">
                    <button class="view-btn">View Details</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;
            documentsList.appendChild(docItem);
        });
    };

    const deleteDocument = (id) => {
        documents = documents.filter(doc => doc.id !== id);
        saveDocuments();
        renderDocuments();
    };

    const showDocumentDetails = (docId) => {
        const doc = documents.find(d => d.id === docId);
        if (!doc) return;

        const detailContent = `
            <h2>${doc.name}</h2>
            <p><strong>Type:</strong> ${doc.type === 'url' ? 'Web Link' : doc.type.toUpperCase()}</p>
            ${doc.url ? `<p><strong>URL:</strong> <a href="${doc.url}" target="_blank">${doc.url}</a></p>` : ''}
            <p><strong>Summary:</strong> ${doc.mockSummary}</p>
            <p><strong>Key Insights (AI Simulated):</strong></p>
            <ul>
                ${doc.mockInsights.map(insight => `<li>${insight}</li>`).join('')}
            </ul>
            <p><strong>Full Content (Partial/Simulated):</strong></p>
            <div class="content-preview" style="max-height: 200px; overflow-y: auto; border: 1px solid #eee; padding: 10px; border-radius: 5px; background-color: #fcfcfc;">
                <p>${doc.content.substring(0, 500)}...</p>
            </div>
        `;

        aiResponseDiv.innerHTML = detailContent; // Display details in AI response area
        aiResponseDiv.scrollTop = 0; // Scroll to top
    };

    // --- Event Listeners ---
    addUrlBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (url) {
            // In a real app, you'd fetch content from the URL via a backend.
            // Here, we simulate by storing the URL and some mock content.
            addDocument(new URL(url).hostname, 'url', `This is mock content for the web link: ${url}. The AI has processed this link and extracted relevant information. Key topics include web development, AI, and data management.`, url);
            urlInput.value = '';
        } else {
            alert('Please enter a valid URL.');
        }
    });

    processDocsBtn.addEventListener('click', async () => {
        const files = fileUpload.files;
        if (files.length === 0) {
            alert('Please select files to upload first.');
            return;
        }

        for (const file of files) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                // Simple content type detection
                const type = file.name.split('.').pop();
                addDocument(file.name, type, content);
            };
            reader.onerror = () => {
                alert(`Failed to read file: ${file.name}`);
            };
            reader.readAsText(file);
        }
        fileUpload.value = ''; // Clear file input
    });

    docSearch.addEventListener('input', (e) => {
        renderDocuments(e.target.value);
    });

    documentsList.addEventListener('click', (e) => {
        const docItem = e.target.closest('.document-item');
        if (!docItem) return;

        const docId = docItem.getAttribute('data-id');

        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this document?')) {
                deleteDocument(docId);
            }
        } else if (e.target.classList.contains('view-btn')) {
            showDocumentDetails(docId);
        }
    });

    askAiBtn.addEventListener('click', () => {
        const question = aiQuestion.value.trim();
        if (!question) {
            alert('Please enter a question for the AI.');
            return;
        }

        aiResponseDiv.innerHTML = '<p class="info-message">Thinking... Processing your query with RAG (Retrieval Augmented Generation)...</p>';

        setTimeout(() => {
            const relevantDocs = documents.filter(doc => 
                doc.name.toLowerCase().includes(question.toLowerCase()) ||
                doc.mockSummary.toLowerCase().includes(question.toLowerCase()) ||
                (doc.content && doc.content.toLowerCase().includes(question.toLowerCase()))
            );

            let response = '';
            if (relevantDocs.length > 0) {
                const docNames = relevantDocs.map(d => `'${d.name}'`).join(', ');
                response = `
                    <p><strong>AI Response (Simulated RAG):</strong></p>
                    <p>Based on my analysis of your knowledge base, specifically drawing insights from ${docNames}, I can tell you that...</p>
                    <p><em>(Simulated Answer based on keywords from your question and retrieved documents):</em></p>
                `;

                if (question.toLowerCase().includes('summarize')) {
                    response += `<p>The main points of the relevant documents are: ${relevantDocs.map(d => d.mockSummary).join(' ')}</p>`;
                } else if (question.toLowerCase().includes('what is rag')) {
                    response += `<p>RAG (Retrieval Augmented Generation) is a technique that enhances large language models (LLMs) by giving them access to external knowledge bases. When you ask a question, RAG first retrieves relevant documents or data from your knowledge base, and then uses this retrieved information to generate a more accurate, up-to-date, and context-specific answer. This prevents the LLM from 'hallucinating' and grounds its responses in factual data.</p>`;
                } else if (question.toLowerCase().includes('key insights')) {
                     response += `<p>From the selected documents, some key insights include: ${relevantDocs.map(d => d.mockInsights.join('; ')).join(' ')}</p>`;
                } else {
                    response += `<p>Your query about "${question}" suggests an interest in ${relevantDocs[0].name.split(' ')[0]} related topics. A potential answer could be: 'Leveraging data from diverse sources is crucial for comprehensive understanding.' This is a mock response demonstrating the AI's ability to synthesize information.</p>`;
                }

                response += `<p>To get more specific answers, ensure your documents contain detailed information on the topic.</p>`;
            } else {
                response = `
                    <p><strong>AI Response (Simulated):</strong></p>
                    <p>I couldn't find highly relevant information for "${question}" within your current knowledge base. Please try adding more documents or refining your question.</p>
                    <p><em>(This is a simulated response. A real AI would perform a deeper semantic search.)</em></p>
                `;
            }
            aiResponseDiv.innerHTML = response;
            aiResponseDiv.scrollTop = 0; // Scroll to top
        }, 1500); // Simulate AI thinking time
    });

    // Initial load
    loadDocuments();
});
