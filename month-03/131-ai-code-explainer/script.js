document.addEventListener('DOMContentLoaded', () => {
    const codeInput = document.getElementById('code-input');
    const explainButton = document.getElementById('explain-button');
    const explanationOutput = document.getElementById('explanation-output');
    const loadingIndicator = document.getElementById('loading');

    explainButton.addEventListener('click', async () => {
        const code = codeInput.value.trim();

        if (!code) {
            explanationOutput.textContent = 'Please enter some code to explain.';
            explanationOutput.style.color = '#dc3545'; // Error color
            return;
        }

        explanationOutput.textContent = ''; // Clear previous explanation
        explanationOutput.style.color = '#343a40'; // Reset color
        loadingIndicator.classList.remove('hidden'); // Show loading indicator
        explainButton.disabled = true; // Disable button during processing

        try {
            // Simulate API call to an AI model
            // In a real application, you would make a fetch() request to a backend API here.
            // Example: const response = await fetch('/api/explain-code', { method: 'POST', body: JSON.stringify({ code }) });
            // const data = await response.json();
            // const explanation = data.explanation;

            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

            const simulatedExplanation = generateSimulatedExplanation(code);
            explanationOutput.textContent = simulatedExplanation;

        } catch (error) {
            console.error('Error explaining code:', error);
            explanationOutput.textContent = 'An error occurred while trying to explain the code. Please try again.';
            explanationOutput.style.color = '#dc3545'; // Error color
        } finally {
            loadingIndicator.classList.add('hidden'); // Hide loading indicator
            explainButton.disabled = false; // Re-enable button
        }
    });

    function generateSimulatedExplanation(code) {
        const lowerCode = code.toLowerCase();

        if (lowerCode.includes('function') || (lowerCode.includes('const') && lowerCode.includes('=')) || lowerCode.includes('let') || lowerCode.includes('var') || lowerCode.includes('console.log') || lowerCode.includes('document.getelementbyid')) {
            return "This appears to be a JavaScript code snippet. It likely defines variables, functions, and performs operations within a web browser or Node.js environment, possibly interacting with the DOM.";
        } else if (lowerCode.includes('def ') || lowerCode.includes('import ') || lowerCode.includes('print(') || (lowerCode.includes('for ') && lowerCode.includes(' in '))) {
            return "This looks like a Python code snippet. It probably defines functions, imports modules, or performs data processing tasks using Python's syntax.";
        } else if (lowerCode.includes('public static void main') || (lowerCode.includes('class ') && lowerCode.includes(' extends ')) || lowerCode.includes('system.out.println') || lowerCode.includes('new ')) {
            return "This seems to be a Java code snippet. It likely defines classes, methods, and executes logic within the Java Virtual Machine, demonstrating object-oriented principles.";
        } else if (lowerCode.includes('<html') || lowerCode.includes('<body') || lowerCode.includes('<div') || lowerCode.includes('<p') || lowerCode.includes('<img')) {
            return "This is an HTML snippet. It defines the structure and content of a web page, using tags to organize elements like text, images, and links.";
        } else if ((lowerCode.includes('{') && lowerCode.includes(';')) && (lowerCode.includes('color') || lowerCode.includes('font-size') || lowerCode.includes('display') || lowerCode.includes('padding'))) {
            return "This looks like a CSS snippet. It defines the styling and layout for elements on a web page, controlling visual properties like colors, fonts, and positioning.";
        } else if (lowerCode.includes('<?php') || lowerCode.includes('echo ') || lowerCode.includes('$') || lowerCode.includes('->')) {
            return "This appears to be a PHP code snippet. It likely handles server-side logic, database interactions, and dynamic content generation for web applications.";
        } else if (lowerCode.includes('select ') || lowerCode.includes('from ') || lowerCode.includes('insert into') || lowerCode.includes('update ') || lowerCode.includes('delete from')) {
            return "This looks like an SQL query. It's used to interact with relational databases, performing operations such as retrieving, inserting, updating, or deleting data.";
        }
        return "This code snippet is a piece of programming logic. Without more context or a specific language detection, it performs a series of operations or defines a structure according to its syntax. It's designed to achieve a particular computational goal.";
    }
});
