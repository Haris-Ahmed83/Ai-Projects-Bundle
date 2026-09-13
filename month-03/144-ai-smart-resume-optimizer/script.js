document.addEventListener('DOMContentLoaded', () => {
    const resumeUpload = document.getElementById('resumeUpload');
    const jobDescription = document.getElementById('jobDescription');
    const analyzeButton = document.getElementById('analyzeButton');
    const suggestionsOutput = document.getElementById('suggestionsOutput');
    const loadingIndicator = document.getElementById('loadingIndicator');

    // Function to enable/disable the analyze button
    const toggleAnalyzeButton = () => {
        const isResumeUploaded = resumeUpload.files.length > 0;
        const isJobDescriptionProvided = jobDescription.value.trim().length > 50; // Require a minimum length
        analyzeButton.disabled = !(isResumeUploaded && isJobDescriptionProvided);
    };

    // Event listeners for inputs to toggle button state
    resumeUpload.addEventListener('change', toggleAnalyzeButton);
    jobDescription.addEventListener('input', toggleAnalyzeButton);

    // Initial state check for the button
    toggleAnalyzeButton();

    analyzeButton.addEventListener('click', () => {
        const resumeFile = resumeUpload.files[0];
        const jdText = jobDescription.value.trim();

        if (!resumeFile || jdText.length < 50) {
            alert('Please upload a resume and provide a detailed job description (minimum 50 characters).');
            return;
        }

        suggestionsOutput.innerHTML = ''; // Clear previous suggestions
        suggestionsOutput.classList.remove('error');
        loadingIndicator.style.display = 'block'; // Show loading indicator
        analyzeButton.disabled = true; // Disable button during analysis

        // Simulate AI analysis with a delay
        setTimeout(() => {
            loadingIndicator.style.display = 'none'; // Hide loading indicator
            analyzeButton.disabled = false; // Re-enable button

            // --- AI Simulation Logic ---
            const suggestions = [
                "**Keyword Matching:** Our AI detected several key terms from the job description not prominently featured in your resume. Consider integrating terms like '" + getRandomKeyword() + "', '" + getRandomKeyword() + "', and '" + getRandomKeyword() + "' into your experience and skills sections.",
                "**Quantify Achievements:** Many of your bullet points describe responsibilities. To make them more impactful, quantify your achievements using numbers and metrics. For example, instead of 'Managed projects', try 'Managed 5+ projects, leading to a 15% increase in efficiency'.",
                "**Skills Alignment:** The job description emphasizes '" + getRandomSkill() + "' and '" + getRandomSkill() + "'. Ensure these skills are clearly listed and demonstrated with examples in your work experience.",
                "**Action Verbs:** Enhance your resume with strong action verbs. Replace passive phrases with powerful verbs like 'Developed', 'Implemented', 'Led', 'Optimized', and 'Achieved'.",
                "**Conciseness & Readability:** Our NLP model suggests some sentences could be more concise. Aim for clear, impactful statements. Consider breaking down dense paragraphs for better readability.",
                "**Customized Summary/Objective:** Tailor your resume's summary or objective statement to directly address the specific needs and requirements outlined in this particular job description. Highlight how your unique background aligns.",
                "**Formatting Review:** While not directly content-related, ensure your resume's formatting is clean, professional, and easy to scan. Consistent fonts, spacing, and clear headings are crucial for applicant tracking systems (ATS) and human readers alike."
            ];

            const outputList = suggestions.map(suggestion => `<li>${suggestion}</li>`).join('');
            suggestionsOutput.innerHTML = `<ul>${outputList}</ul>`;
            suggestionsOutput.style.backgroundColor = '#e8f5e9'; // Reset background if it was an error before
            suggestionsOutput.style.borderColor = '#a5d6a7';
            suggestionsOutput.style.color = '#388e3c';
            suggestionsOutput.classList.remove('placeholder');

        }, 2000); // Simulate a 2-second processing time
    });

    // Helper function for simulated keywords/skills
    function getRandomKeyword() {
        const keywords = ['data analysis', 'project management', 'customer success', 'strategic planning', 'software development', 'marketing strategy', 'financial modeling', 'cloud computing'];
        return keywords[Math.floor(Math.random() * keywords.length)];
    }

    function getRandomSkill() {
        const skills = ['problem-solving', 'communication', 'leadership', 'teamwork', 'critical thinking', 'adaptability', 'innovation', 'time management'];
        return skills[Math.floor(Math.random() * skills.length)];
    }

});
