document.addEventListener('DOMContentLoaded', () => {
    const topicInput = document.getElementById('topicInput');
    const generateBtn = document.getElementById('generateBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');
    const resultsContainer = document.getElementById('resultsContainer');
    const supportingPointsList = document.getElementById('supportingPoints');
    const counterArgumentsList = document.getElementById('counterArguments');
    const rebuttalsList = document.getElementById('rebuttals');

    // --- Helper Functions ---
    function showElement(element) {
        element.classList.remove('hidden');
    }

    function hideElement(element) {
        element.classList.add('hidden');
    }

    function clearResults() {
        supportingPointsList.innerHTML = '';
        counterArgumentsList.innerHTML = '';
        rebuttalsList.innerHTML = '';
        hideElement(resultsContainer);
        hideElement(errorMessage);
    }

    function displayError(message) {
        errorMessage.textContent = message;
        showElement(errorMessage);
        hideElement(loadingIndicator);
        hideElement(resultsContainer);
    }

    function addListItem(listElement, text) {
        const li = document.createElement('li');
        li.textContent = text;
        listElement.appendChild(li);
    }

    // --- AI Simulation Function ---
    function simulateAIResponse(topic) {
        // A very basic simulation based on keywords or general structure.
        // In a real application, this would involve an actual API call to an LLM.
        const lowerTopic = topic.toLowerCase();
        let supporting = [];
        let counter = [];
        let rebuttal = [];

        if (lowerTopic.includes('homework') || lowerTopic.includes('abolish') || lowerTopic.includes('education')) {
            supporting = [
                "Reduces student stress and anxiety, promoting better mental health.",
                "Allows students more time for extracurricular activities, family, and rest.",
                "Studies suggest little correlation between homework and academic performance in younger grades.",
                "Promotes equity by not penalizing students who lack home support or resources."
            ];
            counter = [
                "Reinforces classroom learning and helps students practice skills.",
                "Develops responsibility, time management, and independent learning skills.",
                "Prepares students for higher education and future careers.",
                "Provides parents insight into their child's learning and progress."
            ];
            rebuttal = [
                "Effective classroom teaching and in-class practice can replace much of homework's reinforcement.",
                "These skills can be taught through project-based learning or classroom assignments without infringing on home time.",
                "The quality and relevance of homework are often more important than the quantity.",
                "Alternative communication methods can keep parents informed without relying solely on homework."
            ];
        } else if (lowerTopic.includes('renewable energy') || lowerTopic.includes('climate change')) {
             supporting = [
                "Reduces reliance on fossil fuels, leading to energy independence.",
                "Mitigates climate change by significantly lowering greenhouse gas emissions.",
                "Creates new jobs in manufacturing, installation, and maintenance sectors.",
                "Has lower operating costs once infrastructure is built, leading to stable energy prices."
            ];
            counter = [
                "Initial investment costs for infrastructure can be very high.",
                "Intermittency of sources like solar and wind requires robust energy storage solutions.",
                "Requires large land areas for deployment (e.g., solar farms, wind farms).",
                "Manufacturing and disposal of components can have environmental impacts."
            ];
            rebuttal = [
                "Long-term savings and environmental benefits often outweigh initial costs, with government incentives helping.",
                "Advancements in battery technology and smart grids are rapidly addressing intermittency challenges.",
                "Land use can be optimized with dual-purpose solutions (e.g., agrivoltaics) and offshore wind.",
                "The lifecycle environmental impact is significantly lower than fossil fuels, and recycling efforts are improving."
            ];
        } else if (lowerTopic.includes('remote work') || lowerTopic.includes('work from home')) {
             supporting = [
                "Increases employee flexibility and work-life balance, leading to higher job satisfaction.",
                "Reduces commute times and costs for employees, saving money and stress.",
                "Allows companies to tap into a wider talent pool, not restricted by geography.",
                "Can lead to reduced overhead costs for companies (office space, utilities)."
            ];
            counter = [
                "May lead to feelings of isolation and reduced team cohesion.",
                "Potential for communication breakdowns and challenges in spontaneous collaboration.",
                "Difficulty in separating work and personal life for some individuals.",
                "Concerns about productivity tracking and maintaining company culture."
            ];
            rebuttal = [
                "Regular virtual team building, online social events, and co-working spaces can combat isolation.",
                "Utilizing advanced communication platforms and scheduled check-ins can enhance clarity and collaboration.",
                "Clear boundaries, dedicated workspaces, and time management strategies can help maintain separation.",
                "Focusing on outcomes rather than hours, and developing strong remote leadership, addresses these concerns."
            ];
        } else {
            // Generic fallback if topic doesn't match specific keywords
            supporting = [
                `Generally, for "${topic}", one might argue that it promotes efficiency.`, 
                `A key benefit of "${topic}" is its potential for innovation.`, 
                `Furthermore, it could lead to increased sustainability.`
            ];
            counter = [
                `However, a counter-argument to "${topic}" could be its high implementation cost.`, 
                `Critics might point to potential negative social impacts.`, 
                `There's also the challenge of scalability for "${topic}".`
            ];
            rebuttal = [
                `While costs are a concern, long-term benefits of "${topic}" often outweigh initial investments.`, 
                `Social impacts can be mitigated through careful planning and community engagement.`, 
                `Scalability issues for "${topic}" are being addressed by ongoing technological advancements.`
            ];
        }

        return {
            supportingPoints: supporting,
            counterArguments: counter,
            rebuttals: rebuttal
        };
    }

    // --- Event Listener ---
    generateBtn.addEventListener('click', () => {
        const topic = topicInput.value.trim();
        clearResults(); // Clear previous results and errors

        if (!topic) {
            displayError('Please enter a topic or statement to generate arguments.');
            return;
        }

        showElement(loadingIndicator); // Show loading spinner
        generateBtn.disabled = true; // Disable button during loading

        // Simulate API call delay
        setTimeout(() => {
            try {
                const { supportingPoints, counterArguments, rebuttals } = simulateAIResponse(topic);

                supportingPoints.forEach(point => addListItem(supportingPointsList, point));
                counterArguments.forEach(point => addListItem(counterArgumentsList, point));
                rebuttals.forEach(point => addListItem(rebuttalsList, point));

                hideElement(loadingIndicator);
                showElement(resultsContainer); // Show results grid
            } catch (error) {
                console.error('Error generating arguments:', error);
                displayError('An unexpected error occurred. Please try again.');
            } finally {
                generateBtn.disabled = false; // Re-enable button
            }
        }, 1500); // Simulate a 1.5-second network delay
    });
});
