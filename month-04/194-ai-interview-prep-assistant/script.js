document.addEventListener('DOMContentLoaded', () => {
    const jobDescriptionInput = document.getElementById('jobDescription');
    const generateQuestionsBtn = document.getElementById('generateQuestionsBtn');
    const questionsOutput = document.getElementById('questionsOutput');

    generateQuestionsBtn.addEventListener('click', () => {
        const jobDescription = jobDescriptionInput.value.trim();

        if (jobDescription === '') {
            alert('Please enter a job description to generate questions.');
            return;
        }

        displayLoadingState();

        // Simulate API call delay to mimic backend processing
        setTimeout(() => {
            const generatedQuestions = simulateAIQuestionGeneration(jobDescription);
            displayQuestions(generatedQuestions);
        }, 1500); // Simulate a 1.5 second API response time
    });

    function displayLoadingState() {
        questionsOutput.innerHTML = `
            <div class="loading-spinner"></div>
            <p class="placeholder-text">Generating tailored questions...</p>
        `;
    }

    /**
     * THIS IS A SIMULATED AI QUESTION GENERATION FUNCTION.
     * In a real-world application, this would involve:
     * 1. Sending the job description to a backend server (e.g., Node.js with Express).
     * 2. The backend would use an NLP library or integrate with a powerful AI API (e.g., OpenAI GPT, Cohere, Hugging Face).
     * 3. The AI would analyze the job description, identify key skills (technical, soft), responsibilities, and generate diverse, context-aware questions across categories.
     * 4. The backend would return the structured questions to the frontend as JSON.
     *
     * For this client-side only project, we're using simple keyword matching and pre-defined templates to demonstrate the UI/UX.
     */
    function simulateAIQuestionGeneration(jobDescription) {
        const lowerCaseDesc = jobDescription.toLowerCase();
        const keywords = new Set(lowerCaseDesc.split(/[^a-zA-Z0-9.-]+/).filter(word => word.length > 2));

        const techSkills = ['react', 'javascript', 'python', 'node.js', 'aws', 'sql', 'frontend', 'backend', 'java', 'c++', 'docker', 'kubernetes', 'typescript', 'api', 'databases', 'azure', 'gcp', 'nlp', 'machine learning', 'ai', 'devops', 'agile', 'scrum'];
        const softSkills = ['communication', 'teamwork', 'problem-solving', 'leadership', 'collaboration', 'adaptability', 'critical thinking', 'analytical', 'innovation', 'mentoring', 'decision-making'];

        let behavioral = [];
        let technical = [];
        let situational = [];

        // --- Core Behavioral Questions --- 
        behavioral.push("Tell me about a time you faced a significant challenge at work and how you overcame it.");
        behavioral.push("Describe a project where you had to work closely with a team. What was your role, and what was the outcome?");
        behavioral.push("How do you prioritize your tasks when you have multiple deadlines and conflicting priorities?");
        behavioral.push("Describe a situation where you received constructive criticism. How did you react and what did you learn?");

        // --- Core Technical Questions --- 
        technical.push("Describe your preferred development environment and tools. Why do you prefer them?");
        technical.push("How do you ensure the quality and maintainability of your code?");

        // --- Core Situational Questions --- 
        situational.push("Imagine you've just started a new project and discover a major technical hurdle that wasn't anticipated. How do you proceed?");
        situational.push("You disagree with a colleague on the best technical approach for a feature. How do you handle the situation to reach a consensus?");
        situational.push("A critical system goes down unexpectedly during off-hours. What are your immediate steps?");

        // --- Tailor based on keywords --- 
        techSkills.forEach(skill => {
            if (keywords.has(skill) || lowerCaseDesc.includes(skill)) {
                technical.push(`Explain the core concepts of ${skill} and its practical applications.`);
                technical.push(`Describe your most challenging experience working with ${skill}.`);
                situational.push(`You are tasked with integrating a new system using ${skill}. What are the key considerations for a successful implementation, especially regarding scalability or security?`);
            }
        });

        softSkills.forEach(skill => {
            if (keywords.has(skill) || lowerCaseDesc.includes(skill)) {
                behavioral.push(`Give an example of when you demonstrated strong ${skill} skills in a professional setting.`);
                situational.push(`Describe a situation where your ${skill} was crucial to resolving a team conflict or achieving a critical project goal.`);
            }
        });

        // --- Add more specific questions based on common role types --- 
        if (lowerCaseDesc.includes('frontend') || lowerCaseDesc.includes('react') || lowerCaseDesc.includes('ui/ux') || lowerCaseDesc.includes('web developer')) {
            technical.push("What are the benefits of using a component-based architecture like React, and what are its potential drawbacks?");
            technical.push("How do you ensure a responsive and accessible user interface across different devices and user needs?");
            situational.push("A user reports a critical UI bug that only occurs on a specific, older browser. How do you approach debugging and resolving it, considering cross-browser compatibility?");
        }

        if (lowerCaseDesc.includes('backend') || lowerCaseDesc.includes('node.js') || lowerCaseDesc.includes('api') || lowerCaseDesc.includes('databases') || lowerCaseDesc.includes('server-side')) {
            technical.push("Discuss the pros and cons of RESTful APIs vs. GraphQL for different use cases.");
            technical.push("How do you handle database migrations in a production environment to minimize downtime and data loss?");
            situational.push("Your backend API is experiencing severe performance degradation under heavy load. What steps would you take to diagnose, mitigate, and ultimately fix the problem?");
        }

        if (lowerCaseDesc.includes('data science') || lowerCaseDesc.includes('machine learning') || lowerCaseDesc.includes('ai') || lowerCaseDesc.includes('nlp')) {
            technical.push("Explain the difference between supervised, unsupervised, and reinforcement learning, providing an example for each.");
            technical.push("How do you approach model evaluation, selection, and deployment, especially in a production environment?");
            situational.push("You need to build a predictive model for a client, but the available dataset is incomplete, noisy, and has significant class imbalance. What's your strategy for data preprocessing, model selection, and evaluation?");
        }

        if (lowerCaseDesc.includes('devops') || lowerCaseDesc.includes('cloud') || lowerCaseDesc.includes('containerization') || lowerCaseDesc.includes('ci/cd')) {
            technical.push("Explain the core principles of CI/CD and how you've implemented them in a project.");
            technical.push("What are the benefits of using containerization (e.g., Docker) and orchestration (e.g., Kubernetes) in a modern application architecture?");
            situational.push("A new deployment to production is failing due to an unexpected dependency issue. How do you quickly diagnose the problem, roll back if necessary, and prevent future occurrences?");
        }

        // Deduplicate, shuffle for variety, and limit to max 5 questions per category
        behavioral = Array.from(new Set(behavioral)).sort(() => 0.5 - Math.random()).slice(0, 5);
        technical = Array.from(new Set(technical)).sort(() => 0.5 - Math.random()).slice(0, 5);
        situational = Array.from(new Set(situational)).sort(() => 0.5 - Math.random()).slice(0, 5);

        return {
            behavioral: behavioral,
            technical: technical,
            situational: situational
        };
    }

    function displayQuestions(questions) {
        questionsOutput.innerHTML = ''; // Clear previous content

        const allQuestions = [...questions.behavioral, ...questions.technical, ...questions.situational];
        if (allQuestions.length === 0) {
            questionsOutput.innerHTML = '<p class="placeholder-text">No specific questions could be generated. Try a more detailed job description, or one with common tech/soft skills!</p>';
            return;
        }

        const categories = [
            { title: 'Behavioral Questions', key: 'behavioral' },
            { title: 'Technical Questions', key: 'technical' },
            { title: 'Situational Questions', key: 'situational' }
        ];

        categories.forEach(category => {
            if (questions[category.key] && questions[category.key].length > 0) {
                const categoryDiv = document.createElement('div');
                categoryDiv.classList.add('question-category');
                categoryDiv.innerHTML = `<h3>${category.title}</h3>`;

                const ul = document.createElement('ul');
                ul.classList.add('question-list');

                questions[category.key].forEach(q => {
                    const li = document.createElement('li');
                    li.textContent = q;
                    ul.appendChild(li);
                });
                categoryDiv.appendChild(ul);
                questionsOutput.appendChild(categoryDiv);
            }
        });
    }
});
