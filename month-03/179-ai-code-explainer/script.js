document.addEventListener('DOMContentLoaded', () => {
    const codeInput = document.getElementById('code-input');
    const explainButton = document.getElementById('explain-button');
    const explanationOutput = document.getElementById('explanation-output');

    // Simulate AI explanation API call
    // In a real application, this would be an actual fetch() call to an AI API (e.g., OpenAI, Gemini).
    async function mockAIExplainCode(code) {
        if (!code.trim()) {
            return "Please paste some code to get an explanation.";
        }

        // Simulate a delay for API call
        return new Promise(resolve => {
            setTimeout(() => {
                let explanation = "This code snippet appears to be a programming construct. ";

                // Basic keyword detection for a slightly dynamic mock explanation
                if (code.includes("function") || code.includes("def ")) {
                    explanation += "It defines a function, which is a block of organized, reusable code that is used to perform a single, related action.";
                } else if (code.includes("class ")) {
                    explanation += "It defines a class, which is a blueprint for creating objects, providing initial values for state (member variables) and implementations of behavior (member functions or methods).";
                } else if (code.includes("import ") || code.includes("require(")) {
                    explanation += "It imports or requires external modules or libraries, allowing the current file to use functionalities defined elsewhere.";
                } else if (code.includes("console.log") || code.includes("print(")) {
                    explanation += "It includes a statement to output information to the console, typically used for debugging or displaying results.";
                } else if (code.includes("for ") || code.includes("while ")) {
                    explanation += "It contains a loop structure, designed to execute a block of code repeatedly as long as a certain condition is met.";
                } else if (code.includes("if ") || code.includes("else ")) {
                    explanation += "It uses conditional statements to execute different blocks of code based on whether specified conditions are true or false.";
                } else if (code.includes("const ") || code.includes("let ") || code.includes("var ")) {
                    explanation += "It declares variables, which are containers for storing data values. The type of declaration (const, let, var) indicates its scope and mutability.";
                } else if (code.length < 50) {
                    explanation += "It's a short snippet, possibly a variable declaration, a simple expression, or a part of a larger structure. It likely performs a basic operation or assigns a value.";
                } else {
                    explanation += "It's a piece of code that likely performs a specific task. Without more context or a real AI, a precise explanation is difficult, but it follows typical programming syntax for operations, data manipulation, or control flow.";
                }
                explanation += "\n\n(This is a simulated AI explanation. A real AI would provide a much more detailed and accurate analysis by integrating with a powerful language model API.)";
                resolve(explanation);
            }, 1500); // Simulate network delay
        });
    }

    explainButton.addEventListener('click', async () => {
        const code = codeInput.value;
        explanationOutput.innerHTML = '<p class="loading-indicator">Thinking... Please wait.</p>'; // Show loading state

        try {
            const explanation = await mockAIExplainCode(code);
            explanationOutput.textContent = explanation; // Use textContent to prevent XSS and preserve formatting
        } catch (error) {
            console.error('Error explaining code:', error);
            explanationOutput.textContent = 'An error occurred while getting the explanation. Please try again.';
        }
    });
});
