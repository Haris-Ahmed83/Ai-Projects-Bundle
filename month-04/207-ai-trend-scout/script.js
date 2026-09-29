document.addEventListener('DOMContentLoaded', () => {
    const newSourceInput = document.getElementById('new-source-input');
    const addSourceBtn = document.getElementById('add-source-btn');
    const dataSourcesList = document.getElementById('data-sources-list');
    const trendsList = document.getElementById('trends-list');
    const buzzwordsCloud = document.getElementById('buzzwords-cloud');

    let dataSources = [
        'Simulated Tech News',
        'AI Research Blog',
        'Industry Analysis Report'
    ];

    const aiKeywords = [
        'AI', 'Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Neural Network',
        'NLP', 'Natural Language Processing', 'Computer Vision', 'Generative AI', 'Reinforcement Learning',
        'Robotics', 'Data Science', 'Big Data', 'AI Ethics', 'Large Language Models', 'LLMs', 'GPT'
    ];

    const simulatedHeadlines = [
        "New breakthroughs in {KEYWORD} algorithms announced.",
        "Startup raises funding for {KEYWORD} powered analytics platform.",
        "The future of {KEYWORD} in healthcare.",
        "Understanding the impact of {KEYWORD} on modern society.",
        "Researchers develop novel approach for {KEYWORD} tasks.",
        "Ethical considerations for deploying {KEYWORD} solutions.",
        "How {KEYWORD} is transforming industries.",
        "Exploring the potential of {KEYWORD} for creative applications.",
        "The role of {KEYWORD} in combating climate change.",
        "Latest trends in {KEYWORD} development.",
        "{KEYWORD} integration into everyday consumer products.",
        "Challenges and opportunities in {KEYWORD} research."
    ];

    // Function to render data sources
    function renderDataSources() {
        dataSourcesList.innerHTML = '';
        dataSources.forEach(source => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<span class="source-name">${source}</span> <button class="remove-btn" data-source="${source}">x</button>`;
            dataSourcesList.appendChild(listItem);
        });
        attachRemoveSourceListeners();
    }

    // Function to attach listeners for remove buttons
    function attachRemoveSourceListeners() {
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.onclick = (event) => {
                const sourceToRemove = event.target.dataset.source;
                dataSources = dataSources.filter(source => source !== sourceToRemove);
                renderDataSources();
            };
        });
    }

    // Function to simulate fetching data (random articles)
    function fetchSimulatedArticles() {
        const articles = [];
        const numArticles = Math.floor(Math.random() * 5) + 3; // 3-7 articles per update

        for (let i = 0; i < numArticles; i++) {
            const randomHeadlineTemplate = simulatedHeadlines[Math.floor(Math.random() * simulatedHeadlines.length)];
            const randomKeyword = aiKeywords[Math.floor(Math.random() * aiKeywords.length)];
            const articleText = randomHeadlineTemplate.replace('{KEYWORD}', randomKeyword) +
                                (Math.random() > 0.5 ? ` Further discussion on ${aiKeywords[Math.floor(Math.random() * aiKeywords.length)]}.` : '');
            articles.push({
                id: Date.now() + i,
                title: articleText,
                source: dataSources[Math.floor(Math.random() * dataSources.length)],
                timestamp: new Date().toLocaleTimeString()
            });
        }
        return articles;
    }

    // Function to detect trends from articles
    function detectTrends(articles) {
        const detectedTrends = new Map(); // Using Map to count occurrences

        articles.forEach(article => {
            aiKeywords.forEach(keyword => {
                // Case-insensitive check for keywords
                if (article.title.toLowerCase().includes(keyword.toLowerCase())) {
                    const currentCount = detectedTrends.get(keyword) || 0;
                    detectedTrends.set(keyword, currentCount + 1);
                }
            });
        });

        // Convert map to array of objects for easier display
        const trends = Array.from(detectedTrends.entries())
                            .map(([keyword, count]) => ({ keyword, count }))
                            .sort((a, b) => b.count - a.count); // Sort by most frequent
        return trends;
    }

    // Function to render detected trends
    function renderTrends(trends) {
        trendsList.innerHTML = ''; // Clear previous trends
        if (trends.length === 0) {
            trendsList.innerHTML = '<li>No significant AI trends detected recently.</li>';
            return;
        }
        trends.slice(0, 5).forEach(trend => { // Show top 5 trends
            const listItem = document.createElement('li');
            listItem.textContent = `${trend.keyword} (${trend.count} mentions)`;
            trendsList.appendChild(listItem);
        });
    }

    // Function to update the buzzwords cloud
    function updateBuzzwordsCloud() {
        buzzwordsCloud.innerHTML = '';
        // Randomly select some keywords to appear in the cloud
        const shuffledKeywords = aiKeywords.sort(() => 0.5 - Math.random());
        shuffledKeywords.slice(0, Math.floor(Math.random() * 5) + 5).forEach(keyword => { // 5-9 buzzwords
            const span = document.createElement('span');
            span.classList.add('buzzword');
            span.textContent = keyword;
            buzzwordsCloud.appendChild(span);
        });
    }

    // Main dashboard update function
    function updateDashboard() {
        const articles = fetchSimulatedArticles();
        const trends = detectTrends(articles);
        renderTrends(trends);
        updateBuzzwordsCloud();
        console.log("Dashboard updated.", articles.length, "articles processed.");
    }

    // Event listener for adding new data sources
    addSourceBtn.addEventListener('click', () => {
        const newSource = newSourceInput.value.trim();
        if (newSource && !dataSources.includes(newSource)) {
            dataSources.push(newSource);
            renderDataSources();
            newSourceInput.value = '';
        } else if (newSource) {
            alert('This source has already been added or is empty!');
        }
    });

    newSourceInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addSourceBtn.click();
        }
    });

    // Initial render and start real-time updates
    renderDataSources();
    updateDashboard(); // Initial load
    setInterval(updateDashboard, 5000); // Update every 5 seconds
});
