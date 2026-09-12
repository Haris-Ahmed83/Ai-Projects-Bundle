document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements --- (Using querySelector for brevity, could use getElementById as well)
    const documentUploadInput = document.getElementById('documentUpload');
    const fileNameSpan = document.getElementById('fileName');
    const uploadErrorDiv = document.getElementById('uploadError');
    const uploadSpinnerDiv = document.getElementById('uploadSpinner');

    const documentContentPreviewTextarea = document.getElementById('documentContentPreview');
    const questionInputTextarea = document.getElementById('questionInput');
    const askButton = document.getElementById('askButton');
    const questionErrorDiv = document.getElementById('questionError');
    const qaSpinnerDiv = document.getElementById('qaSpinner');
    const aiAnswerParagraph = document.getElementById('aiAnswer');

    // --- State Variables ---
    let documentContent = '';
    let documentType = ''; // 'text' or 'pdf' (simulated)

    // --- Utility Functions ---
    const showElement = (element) => { element.style.display = 'block'; };
    const hideElement = (element) => { element.style.display = 'none'; };
    const clearError = (element) => { element.textContent = ''; hideElement(element); };
    const showError = (element, message) => { element.textContent = message; showElement(element); };
    const enableButton = (button) => { button.disabled = false; };
    const disableButton = (button) => { button.disabled = true; };

    // --- Document Upload Logic ---
    documentUploadInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        clearError(uploadErrorDiv);
        disableButton(askButton); // Disable until content is loaded

        if (!file) {
            fileNameSpan.textContent = 'No file chosen';
            documentContent = '';
            documentContentPreviewTextarea.value = '';
            return;
        }

        fileNameSpan.textContent = file.name;
        documentType = file.type.includes('pdf') ? 'pdf' : 'text'; // Basic type detection

        showElement(uploadSpinnerDiv);
        aiAnswerParagraph.textContent = 'Upload a document and ask a question to get an AI-powered answer.';

        try {
            if (documentType === 'pdf') {
                // Simulate PDF processing. In a real application, this would involve a backend API
                // to extract text from PDF (e.g., using pdf.js for client-side or a server-side library).
                documentContent = await simulatePdfToText(file);
                documentContentPreviewTextarea.value = documentContent.substring(0, 500) + (documentContent.length > 500 ? '...' : '');
                if (documentContent.length === 0) {
                    showError(uploadErrorDiv, 'Could not extract text from PDF. Please try a TXT file or another PDF.');
                    documentContent = ''; // Ensure content is empty if extraction fails
                } else {
                    enableButton(askButton);
                }
            } else if (documentType === 'text') {
                documentContent = await readFileAsText(file);
                documentContentPreviewTextarea.value = documentContent.substring(0, 500) + (documentContent.length > 500 ? '...' : '');
                enableButton(askButton);
            } else {
                showError(uploadErrorDiv, 'Unsupported file type. Please upload a PDF or TXT file.');
                documentContent = '';
            }
        } catch (error) {
            console.error('File processing error:', error);
            showError(uploadErrorDiv, `Error processing file: ${error.message}`);
            documentContent = '';
        } finally {
            hideElement(uploadSpinnerDiv);
        }
    });

    const readFileAsText = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file.'));
            reader.readAsText(file);
        });
    };

    const simulatePdfToText = (file) => {
        return new Promise((resolve) => {
            // Simulate a delay for PDF processing (which would typically be a backend call).
            // For this front-end only project, we return a predefined text.
            setTimeout(() => {
                const simulatedText = `This is a simulated text content for the uploaded PDF document named "${file.name}".
                It discusses various aspects of artificial intelligence (AI), including large language models (LLMs), natural language processing (NLP),
                and their applications in semantic search and question-answering (Q&A) systems. The document highlights the importance of
                efficient document processing for enhanced user interaction and knowledge extraction.
                
                Key figures in AI research mentioned include Alan Turing, John McCarthy, Marvin Minsky, and Geoffrey Hinton.
                The field of AI saw significant advancements in the 2010s and continues to evolve rapidly in the 2020s, with new breakthroughs
                in areas like deep learning and neural networks. The ultimate goal is to enable machines to understand, learn, and apply knowledge
                similarly to humans, thereby creating intelligent systems that can assist with complex tasks.`;
                resolve(simulatedText);
            }, 1500); // Simulate 1.5 seconds processing time
        });
    };

    // --- Q&A Logic ---
    askButton.addEventListener('click', async () => {
        const question = questionInputTextarea.value.trim();
        clearError(questionErrorDiv);
        aiAnswerParagraph.textContent = ''; // Clear previous answer
        
        if (!documentContent) {
            showError(questionErrorDiv, 'Please upload a document first.');
            return;
        }

        if (!question) {
            showError(questionErrorDiv, 'Please enter a question.');
            return;
        }

        showElement(qaSpinnerDiv);
        disableButton(askButton);
        questionInputTextarea.disabled = true;

        try {
            const answer = await simulateAIResponse(question, documentContent);
            aiAnswerParagraph.textContent = answer;
        } catch (error) {
            console.error('AI simulation error:', error);
            aiAnswerParagraph.textContent = 'Sorry, an error occurred while generating the answer.';
        } finally {
            hideElement(qaSpinnerDiv);
            enableButton(askButton);
            questionInputTextarea.disabled = false;
        }
    });

    // Very simplistic AI simulation based on keyword matching and content snippets
    const simulateAIResponse = (question, content) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const lowerCaseQuestion = question.toLowerCase();
                let simulatedAnswer = "Based on the document, I couldn't find a direct answer to that specific question, but here's a relevant snippet: ";
                // Split content into sentences and paragraphs for better extraction
                const sentences = content.match(/[^.!?]+[.!?]/g) || [content]; 
                const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0); 

                // Keyword-based answering
                if (lowerCaseQuestion.includes('what is') || lowerCaseQuestion.includes('what are') || lowerCaseQuestion.includes('what about')) {
                    if (lowerCaseQuestion.includes('main topic') || lowerCaseQuestion.includes('document about')) {
                        simulatedAnswer = paragraphs[0] ? `This document primarily discusses: ${paragraphs[0].substring(0, 150).trim()}...` : sentences[0].trim();
                    } else if (lowerCaseQuestion.includes('ai') || lowerCaseQuestion.includes('artificial intelligence')) {
                         const aiSentence = sentences.find(s => s.toLowerCase().includes('artificial intelligence') || s.toLowerCase().includes('ai'));
                         simulatedAnswer = aiSentence ? aiSentence.trim() : sentences[0].trim();
                    } else if (sentences.length > 0) {
                        simulatedAnswer = sentences[0].trim(); // Fallback
                    }
                } else if (lowerCaseQuestion.includes('who')) {
                    // Simple proper noun detection: capitalized words followed by other capitalized words
                    const names = [...new Set(content.match(/[A-Z][a-z]+(?: [A-Z][a-z]+)+/g) || [])]; 
                    const relevantNames = names.filter(name => !['This Is', 'It Discusses', 'Key Figures', 'The Field'].includes(name)); // Filter common false positives
                    if (relevantNames.length > 0) {
                        simulatedAnswer = `The document mentions individuals such as: ${relevantNames.slice(0, 3).join(', ')}${relevantNames.length > 3 ? ' and others.' : '.'}`;
                    } else {
                        simulatedAnswer = `The document does not explicitly mention specific individuals in detail. ${sentences[0].trim()}`;
                    }
                } else if (lowerCaseQuestion.includes('when')) {
                    // Simple date/year detection
                    const dates = [...new Set(content.match(/\b\d{4}\b|\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?(?:,\s*\d{4})?\b/gi) || [])];
                    if (dates.length > 0) {
                        simulatedAnswer = `The document refers to periods or dates such as: ${dates.slice(0, 3).join(', ')}.`;
                    } else {
                        simulatedAnswer = `Specific dates or times are not prominently featured in the document. ${sentences[0].trim()}`;
                    }
                } else if (lowerCaseQuestion.includes('summary') || lowerCaseQuestion.includes('main points') || lowerCaseQuestion.includes('summarize')) {
                    simulatedAnswer = paragraphs.slice(0, Math.min(3, paragraphs.length)).join(' ').substring(0, 300) + '...';
                    if (simulatedAnswer.length < 50 && sentences.length > 0) { // Fallback for very short documents
                         simulatedAnswer = sentences.slice(0, Math.min(3, sentences.length)).join(' ').substring(0, 300) + '...';
                    }
                } else {
                    // Generic search for keywords in sentences
                    const questionWords = lowerCaseQuestion.split(/\s+/)
                                          .filter(word => word.length > 3 && !['the', 'is', 'a', 'an', 'of', 'in', 'for', 'to', 'from', 'about', 'can', 'you', 'me', 'tell', 'what', 'who', 'when', 'where', 'how'].includes(word)); // Filter common stop words
                    let foundSentence = null;
                    for (const sent of sentences) {
                        const lowerSent = sent.toLowerCase();
                        if (questionWords.some(word => lowerSent.includes(word))) {
                            foundSentence = sent.trim();
                            break;
                        }
                    }
                    simulatedAnswer = foundSentence || (sentences.length > 0 ? sentences[0].trim() : 'No relevant information found in the document.'); // Fallback to first sentence or generic message
                }

                // Ensure the answer doesn't start with the default message if a better one was found
                if (simulatedAnswer.startsWith("Based on the document, I couldn't find a direct answer") && sentences.length > 0 && simulatedAnswer !== sentences[0].trim()) {
                    simulatedAnswer = `While a direct answer might not be available, the document mentions: "${sentences[0].trim()}"`;
                }
                if (simulatedAnswer.length < 20 && sentences.length > 0) { // Ensure a minimum length for the answer
                    simulatedAnswer = sentences[0].trim();
                }
                if (simulatedAnswer.length === 0) {
                     simulatedAnswer = "I'm sorry, I couldn't find any relevant information in the document for that question.";
                }

                resolve(simulatedAnswer);
            }, 2000); // Simulate 2 seconds AI processing time
        });
    };

    // Initial state setup
    disableButton(askButton);
});
