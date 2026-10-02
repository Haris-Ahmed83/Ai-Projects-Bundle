document.addEventListener('DOMContentLoaded', () => {
    const codeInput = document.getElementById('code-input');
    const explainButton = document.getElementById('explain-button');
    const explanationOutput = document.getElementById('explanation-output');

    explainButton.addEventListener('click', () => {
        const code = codeInput.value.trim();
        explanationOutput.innerHTML = '<p>Generating explanation...</p>';

        if (code === '') {
            explanationOutput.innerHTML = '<p>Please paste some code into the input box to get an explanation.</p>';
            return;
        }

        // Simulate AI API call
        setTimeout(() => {
            const explanation = generateSimulatedExplanation(code);
            explanationOutput.innerHTML = `<p>${explanation}</p>`;
        }, 1500); // Simulate network latency
    });

    function generateSimulatedExplanation(code) {
        let explanationParts = [];

        // Convert code to lowercase for case-insensitive checks
        const lowerCode = code.toLowerCase();

        if (lowerCode.includes('function') || lowerCode.includes('def ')) {
            explanationParts.push("a function or method definition");
        }
        if (lowerCode.includes('class ')) {
            explanationParts.push("a class definition, possibly including properties and methods");
        }
        if (lowerCode.includes('import') || lowerCode.includes('require')) {
            explanationParts.push("code that imports external modules or libraries");
        }
        if (lowerCode.includes('for (') || lowerCode.includes('while (') || lowerCode.includes('for ') || lowerCode.includes('while ')) {
            explanationParts.push("a loop structure for iteration");
        }
        if (lowerCode.includes('if (') || lowerCode.includes('else if (') || lowerCode.includes('elif ') || lowerCode.includes('else ')) {
            explanationParts.push("conditional logic to control flow");
        }
        if (lowerCode.includes('console.log') || lowerCode.includes('print(') || lowerCode.includes('alert(')) {
            explanationParts.push("debugging or output statements");
        }
        if (lowerCode.includes('return ')) {
            explanationParts.push("a block of code that returns a value");
        }
        if (lowerCode.includes('async') || lowerCode.includes('await')) {
            explanationParts.push("asynchronous operations");
        }
        if (lowerCode.includes('try') && lowerCode.includes('catch')) {
            explanationParts.push("error handling mechanisms");
        }
        if (lowerCode.includes('const ') || lowerCode.includes('let ') || lowerCode.includes('var ')) {
            explanationParts.push("variable declarations");
        }

        let baseExplanation = "This code snippet appears to be ";

        if (explanationParts.length > 0) {
            if (explanationParts.length === 1) {
                baseExplanation += explanationParts[0] + ". ";
            } else if (explanationParts.length === 2) {
                baseExplanation += explanationParts.join(" and ") + ". ";
            } else {
                baseExplanation += explanationParts.slice(0, -1).join(", ") + ", and " + explanationParts[explanationParts.length - 1] + ". ";
            }
        } else {
            baseExplanation += "a general programming construct. It might be a small fragment or declarative piece. Try pasting a more complex snippet for a richer simulated analysis. ";
        }

        baseExplanation += "A real AI would delve deeper into its purpose, parameters, return values, and potential side effects to provide comprehensive documentation or even suggest optimizations and identify potential issues.";

        return baseExplanation;
    }
});
