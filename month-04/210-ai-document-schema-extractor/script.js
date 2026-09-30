document.addEventListener('DOMContentLoaded', () => {
    const documentUpload = document.getElementById('documentUpload');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const extractedSchemaOutput = document.getElementById('extractedSchemaOutput');
    const loadingSpinner = document.getElementById('loading');

    documentUpload.addEventListener('change', handleFileSelect);

    async function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) {
            fileNameDisplay.textContent = 'No file chosen';
            extractedSchemaOutput.textContent = 'Upload a document to see the extracted schema here.';
            return;
        }

        fileNameDisplay.textContent = file.name;
        extractedSchemaOutput.textContent = 'Processing document...';
        loadingSpinner.classList.remove('hidden');

        try {
            const fileContent = await readFileAsText(file);
            // Simulate AI API call
            const extractedData = await simulateAIExtraction(fileContent);
            extractedSchemaOutput.textContent = JSON.stringify(extractedData, null, 2);
        } catch (error) {
            console.error('Error processing document:', error);
            extractedSchemaOutput.textContent = `Error: ${error.message}. Please try again.`;
        } finally {
            loadingSpinner.classList.add('hidden');
        }
    }

    function readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error(`Failed to read file: ${e.target.error.message}`));
            reader.readAsText(file);
        });
    }

    async function simulateAIExtraction(documentText) {
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000)); // 1.5 - 2.5 seconds

        const lowerText = documentText.toLowerCase();
        let documentType = "Unknown Document";
        let extractedFields = {};

        // Simple keyword-based extraction logic
        if (lowerText.includes('invoice') || lowerText.includes('bill')) {
            documentType = "Invoice";
            extractedFields = extractInvoiceData(documentText);
        } else if (lowerText.includes('resume') || lowerText.includes('cv')) {
            documentType = "Resume";
            extractedFields = extractResumeData(documentText);
        } else if (lowerText.includes('contract') || lowerText.includes('agreement')) {
            documentType = "Contract";
            extractedFields = extractContractData(documentText);
        } else if (lowerText.includes('report') || lowerText.includes('analysis')) {
            documentType = "Report";
            extractedFields = extractReportData(documentText);
        } else {
            // Generic extraction for unknown types
            extractedFields = extractGenericData(documentText);
        }

        return {
            documentType: documentType,
            extractedFields: extractedFields,
            rawTextSample: documentText.substring(0, 200) + (documentText.length > 200 ? '...' : '')
        };
    }

    // Helper to find a value based on a regex pattern
    const findValue = (text, regex, groupIndex = 1) => {
        const match = text.match(regex);
        return match && match[groupIndex] ? match[groupIndex].trim() : null;
    };

    // --- Mock Extraction Functions ---
    function extractInvoiceData(text) {
        const data = {};
        const lines = text.split('\n');

        data.invoiceNumber = findValue(text, /(invoice|bill|ref)\s*#?:\s*([A-Za-z0-9-]+)/i, 2);
        data.date = findValue(text, /(date|issue date|invoice date):\s*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{4}-\d{2}-\d{2})/i, 2);
        data.totalAmount = findValue(text, /(total|amount due|grand total):\s*(\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i, 2);
        data.currency = data.totalAmount && data.totalAmount.includes('$') ? 'USD' : null;
        if (data.totalAmount && !data.currency) {
            const currencyMatch = text.match(/(€|£|¥)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i);
            if (currencyMatch) data.currency = currencyMatch[1];
        }

        data.items = [];
        // A very basic item extraction - looking for lines that might represent items
        lines.forEach(line => {
            if (line.match(/^\s*\d+\s+[\w\s]+\s+\d+\.\d{2}/)) { // e.g., "1 Item Description 100.00"
                const parts = line.trim().split(/\s+(?=\d+\.\d{2}$)/); // Split before last number
                if (parts.length > 1) {
                    data.items.push({
                        description: parts[0].trim(),
                        amount: parseFloat(parts[1]).toFixed(2)
                    });
                }
            }
        });

        // Clean up nulls
        Object.keys(data).forEach(key => data[key] === null && delete data[key]);
        return data;
    }

    function extractResumeData(text) {
        const data = {};

        data.name = findValue(text, /(?:name|candidate):\s*([A-Za-z\s.'-]+)/i, 1);
        if (!data.name) { // Fallback for name if not found with label, try first non-empty line
            const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            if (lines.length > 0) {
                // Heuristic: first non-empty line, capitalize first letter of each word
                data.name = lines[0].split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            }
        }

        data.email = findValue(text, /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i, 1);
        data.phone = findValue(text, /(?:phone|tel|mobile):?\s*(\+?\d{1,3}[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/i, 1);
        data.linkedin = findValue(text, /(linkedin\.com\/in\/[a-zA-Z0-9_-]+)/i, 1);
        data.summary = findValue(text, /(summary|profile|about me):\s*([\s\S]+?)(?=(?:experience|education|skills|\n\n|$))/i, 2);
        if (data.summary) data.summary = data.summary.replace(/\n/g, ' ').trim();

        // Basic skills extraction
        const skillsMatch = text.match(/(skills|technologies):\s*([\s\S]+?)(?=(?:experience|education|\n\n|$))/i);
        if (skillsMatch && skillsMatch[2]) {
            data.skills = skillsMatch[2].split(/[,;\n\t\r-]/).map(s => s.trim()).filter(s => s.length > 2);
            data.skills = [...new Set(data.skills)]; // Remove duplicates
        }

        // Clean up nulls
        Object.keys(data).forEach(key => data[key] === null && delete data[key]);
        return data;
    }

    function extractContractData(text) {
        const data = {};

        data.contractTitle = findValue(text, /(agreement|contract|terms)\s+(?:for|of)?\s*([A-Za-z\s'-]+)/i, 2);
        data.effectiveDate = findValue(text, /(effective date|date of agreement):\s*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{4}-\d{2}-\d{2})/i, 2);
        data.partyA = findValue(text, /(party a|first party|licensor):\s*([A-Za-z\s.'",-]+)/i, 2);
        data.partyB = findValue(text, /(party b|second party|licensee):\s*([A-Za-z\s.'",-]+)/i, 2);
        data.term = findValue(text, /(term of agreement|duration):\s*([A-Za-z0-9\s-]+)/i, 2);
        data.governingLaw = findValue(text, /(governing law):\s*([A-Za-z\s-]+)/i, 2);

        // Clean up nulls
        Object.keys(data).forEach(key => data[key] === null && delete data[key]);
        return data;
    }

    function extractReportData(text) {
        const data = {};

        data.reportTitle = findValue(text, /(report title|subject|analysis of):\s*([A-Za-z\s'-]+)/i, 2);
        data.date = findValue(text, /(report date|date of report):\s*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{4}-\d{2}-\d{2})/i, 2);
        data.author = findValue(text, /(author|prepared by):\s*([A-Za-z\s.'-]+)/i, 2);
        data.summary = findValue(text, /(summary|abstract):\s*([\s\S]+?)(?=(?:introduction|methodology|results|\n\n|$))/i, 2);
        if (data.summary) data.summary = data.summary.replace(/\n/g, ' ').trim();

        // Clean up nulls
        Object.keys(data).forEach(key => data[key] === null && delete data[key]);
        return data;
    }

    function extractGenericData(text) {
        const data = {};
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        // Try to find key-value pairs in the first few lines
        for (let i = 0; i < Math.min(lines.length, 10); i++) {
            const line = lines[i];
            const kvMatch = line.match(/^(\w[\w\s]*?):\s*(.+)$/);
            if (kvMatch) {
                const key = kvMatch[1].replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, ''); // Sanitize key
                data[key.charAt(0).toLowerCase() + key.slice(1)] = kvMatch[2].trim();
            }
        }

        // Add a general "content" field if the document is long
        if (text.length > 500) {
            data.firstParagraph = lines[0];
            data.lastParagraph = lines[lines.length - 1];
        }

        return data;
    }
});
