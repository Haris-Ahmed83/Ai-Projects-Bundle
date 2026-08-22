document.addEventListener('DOMContentLoaded', () => {
    const coreIdeaInput = document.getElementById('coreIdea');
    const roleInput = document.getElementById('role');
    const contextInput = document.getElementById('context');
    const formatInput = document.getElementById('format');
    const constraintsInput = document.getElementById('constraints');
    const generatePromptBtn = document.getElementById('generatePromptBtn');
    const generatedPromptOutput = document.getElementById('generatedPrompt');
    const copyPromptBtn = document.getElementById('copyPromptBtn');
    const copyFeedback = document.getElementById('copyFeedback');

    generatePromptBtn.addEventListener('click', () => {
        const coreIdea = coreIdeaInput.value.trim();
        const role = roleInput.value.trim();
        const context = contextInput.value.trim();
        const format = formatInput.value.trim();
        const constraints = constraintsInput.value.trim();

        let promptParts = [];

        if (role) {
            promptParts.push(`Act as a ${role}.`);
        }

        if (coreIdea) {
            promptParts.push(coreIdea);
        }

        if (context) {
            promptParts.push(`Context: ${context}.`);
        }

        if (constraints) {
            promptParts.push(`Constraints: ${constraints}.`);
        }

        if (format) {
            promptParts.push(`Output format: ${format}.`);
        }

        // Combine parts, ensuring proper spacing and avoiding duplicate periods
        let finalPrompt = promptParts.map(part => {
            // Remove trailing period if it exists, as we'll add one universally
            return part.endsWith('.') ? part.slice(0, -1) : part;
        }).join(' ').trim();

        if (finalPrompt) {
            finalPrompt += '.'; // Add a period at the very end if there's content
        } else {
            finalPrompt = "Please fill in some fields to generate a prompt.";
        }

        generatedPromptOutput.value = finalPrompt;
    });

    copyPromptBtn.addEventListener('click', () => {
        generatedPromptOutput.select();
        generatedPromptOutput.setSelectionRange(0, 99999); // For mobile devices

        try {
            document.execCommand('copy');
            copyFeedback.textContent = 'Copied!';
            copyFeedback.classList.add('show');
            setTimeout(() => {
                copyFeedback.classList.remove('show');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            copyFeedback.textContent = 'Failed to copy.';
            copyFeedback.classList.add('show');
            setTimeout(() => {
                copyFeedback.classList.remove('show');
            }, 2000);
        }
    });
});
