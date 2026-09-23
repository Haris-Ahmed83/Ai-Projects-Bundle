document.addEventListener('DOMContentLoaded', () => {
    const resumeFileInput = document.getElementById('resumeFile');
    const jobDescriptionInput = document.getElementById('jobDescription');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const suggestionsContent = document.getElementById('suggestionsContent');

    analyzeBtn.addEventListener('click', async () => {
        const resumeFile = resumeFileInput.files[0];
        const jobDescription = jobDescriptionInput.value.trim();

        if (!resumeFile) {
            alert('Please upload your resume file first!');
            return;
        }

        // Show loading, disable button
        analyzeBtn.disabled = true;
        loadingSpinner.style.display = 'block';
        suggestionsContent.innerHTML = '<p>Analyzing your resume... This might take a moment.</p>';

        try {
            // In a real application, you would send resumeFile (e.g., via FormData) 
            // and jobDescription to a backend API endpoint for AI processing.
            // Example: 
            // const formData = new FormData();
            // formData.append('resume', resumeFile);
            // formData.append('jobDescription', jobDescription);
            // const response = await fetch('/api/analyze-resume', { method: 'POST', body: formData });
            // const data = await response.json();
            // const mockSuggestions = data.suggestions; // Get actual suggestions

            // For this project, we'll simulate the AI processing with a delay.
            const resumeFileName = resumeFile.name;

            // Simulate AI processing delay and get mock suggestions
            const mockSuggestions = await simulateAIAnalysis(resumeFileName, jobDescription);

            // Display suggestions
            suggestionsContent.innerHTML = mockSuggestions;

        } catch (error) {
            console.error('Analysis failed:', error);
            suggestionsContent.innerHTML = `<p style="color: red;">Error during analysis: ${error.message || 'An unknown error occurred'}. Please try again.</p>`;
        } finally {
            // Hide loading, enable button
            analyzeBtn.disabled = false;
            loadingSpinner.style.display = 'none';
        }
    });

    /**
     * Simulates an AI analysis call to a backend.
     * In a real scenario, this would be an `fetch` call to your API endpoint
     * that integrates with a powerful LLM.
     * @param {string} resumeFileName The name of the uploaded resume file.
     * @param {string} jobDescription The job description text.
     * @returns {Promise<string>} A promise that resolves with HTML formatted suggestions.
     */
    function simulateAIAnalysis(resumeFileName, jobDescription) {
        return new Promise(resolve => {
            setTimeout(() => {
                let suggestionsHTML = `
                    <h3>Resume Analysis for: <em>${resumeFileName}</em></h3>
                    <p><strong>Disclaimer:</strong> This is a <strong>simulated AI analysis</strong>. In a real application, a powerful LLM would provide these insights after securely processing your actual document content on a backend server.</p>
                `;

                if (jobDescription) {
                    suggestionsHTML += `
                        <h4>🎯 Keyword Relevance (vs. Job Description)</h4>
                        <ul>
                            <li><strong>Detected Keywords:</strong> "Software Engineer", "Python", "AWS", "Cloud Computing", "API Integration".</li>
                            <li><strong>Suggested Additions:</strong> Consider incorporating phrases like "microservices architecture," "CI/CD pipelines," or "containerization" if your experience aligns with these concepts in the job description.</li>
                            <li><strong>Actionable Insight:</strong> Tailor your experience bullet points to explicitly mention key phrases from the job description, using strong action verbs.</li>
                        </ul>
                    `;
                }

                suggestionsHTML += `
                    <h4>📝 Formatting & Readability</h4>
                    <ul>
                        <li><strong>Layout:</strong> Generally clean and professional. Ensure consistent spacing between sections.</li>
                        <li><strong>Bullet Points:</strong> All bullet points should start with strong, quantifiable action verbs (e.g., "Developed," "Managed," "Optimized").</li>
                        <li><strong>Consistency:</strong> Verify consistent date formats (e.g., MM/YYYY) and font usage throughout the document.</li>
                        <li><strong>Length:</strong> Aim for 1-2 pages for most professional roles.</li>
                    </ul>

                    <h4>💡 Content & Impact</h4>
                    <ul>
                        <li><strong>Quantify Achievements:</strong> Transform responsibilities into measurable achievements. Instead of "Managed projects," try "Managed 3 key projects, reducing delivery time by 15% and saving $X."</li>
                        <li><strong>Skill Section:</strong> Categorize skills clearly (e.g., "Programming Languages," "Cloud Platforms," "Tools & Technologies"). Prioritize skills most relevant to your target roles.</li>
                        <li><strong>Summary/Objective:</strong> Make it compelling and concise (3-4 lines). Highlight your strongest qualifications and career goals, specifically tailored to the type of roles you're applying for.</li>
                        <li><strong>Experience Depth:</strong> For each role, include 3-5 strong bullet points that showcase impact and relevant skills.</li>
                    </ul>

                    <h4>🚀 Next Steps</h4>
                    <p>Based on this simulated analysis, focus on refining your resume for each specific application. Prioritize quantifying your accomplishments, integrating relevant keywords naturally, and ensuring a polished, easy-to-read format. Good luck!</p>
                `;
                resolve(suggestionsHTML);
            }, 2500); // Simulate network delay and AI processing time
        });
    }
});
