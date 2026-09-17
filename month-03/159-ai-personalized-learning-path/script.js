document.addEventListener('DOMContentLoaded', () => {
    const topicInput = document.getElementById('topicInput');
    const generatePathBtn = document.getElementById('generatePathBtn');
    const pathContent = document.getElementById('pathContent');

    // Mock AI data for different topics
    const learningPaths = {
        'react': [
            {
                title: "Introduction to React",
                resources: [
                    { name: "React Official Documentation: Getting Started", url: "https://react.dev/learn" },
                    { name: "YouTube: React for Beginners (Crash Course)", url: "https://www.youtube.com/watch?v=bMknfKXLgfg" }
                ]
            },
            {
                title: "Components, JSX, and Props",
                resources: [
                    { name: "React Docs: Your First Component", url: "https://react.dev/learn/your-first-component" },
                    { name: "Article: Understanding JSX", url: "https://react.dev/learn/writing-markup-with-jsx" }
                ]
            },
            {
                title: "State and Lifecycle",
                resources: [
                    { name: "React Docs: State - A Component's Memory", url: "https://react.dev/learn/state-a-components-memory" },
                    { name: "React Docs: Sharing State Between Components", url: "https://react.dev/learn/sharing-state-between-components" }
                ]
            },
            {
                title: "Hooks (useState, useEffect)",
                resources: [
                    { name: "React Docs: Using the State Hook", url: "https://react.dev/learn/managing-state" },
                    { name: "React Docs: Using the Effect Hook", url: "https://react.dev/learn/synchronizing-with-effects" }
                ]
            },
            {
                title: "Routing with React Router",
                resources: [
                    { name: "React Router Docs: Quick Start", url: "https://reactrouter.com/en/main/start/overview" },
                    { name: "Tutorial: Building a React App with React Router", url: "https://www.freecodecamp.org/news/react-router-tutorial/" }
                ]
            }
        ],
        'machine learning': [
            {
                title: "Basics of Machine Learning",
                resources: [
                    { name: "Coursera: Machine Learning by Andrew Ng (Intro)", url: "https://www.coursera.org/learn/machine-learning" },
                    { name: "Article: What is Machine Learning?", url: "https://www.ibm.com/cloud/learn/machine-learning" }
                ]
            },
            {
                title: "Data Preprocessing and Feature Engineering",
                resources: [
                    { name: "Scikit-learn Docs: Preprocessing data", url: "https://scikit-learn.org/stable/modules/preprocessing.html" },
                    { name: "Video: Data Cleaning and Preprocessing for ML", url: "https://www.youtube.com/watch?v=J_K94LgXb3M" }
                ]
            },
            {
                title: "Supervised Learning: Regression",
                resources: [
                    { name: "Article: Linear Regression Explained", url: "https://towardsdatascience.com/linear-regression-explained-1d98971f11e3" },
                    { name: "Video: Simple Linear Regression (StatQuest)", url: "https://www.youtube.com/watch?v=nk2CQITm_eo" }
                ]
            },
            {
                title: "Supervised Learning: Classification",
                resources: [
                    { name: "Article: Introduction to Logistic Regression", url: "https://towardsdatascience.com/introduction-to-logistic-regression-66248243c148" },
                    { name: "Scikit-learn Docs: Classification", url: "https://scikit-learn.org/stable/supervised_learning.html#classification" }
                ]
            },
            {
                title: "Unsupervised Learning: Clustering",
                resources: [
                    { name: "Article: K-Means Clustering Explained", url: "https://towardsdatascience.com/k-means-clustering-algorithm-applications-evaluation-methods-and-drawbacks-aa03e644b48a" },
                    { name: "Video: K-Means Clustering (StatQuest)", url: "https://www.youtube.com/watch?v=4EXlqM_1tPg" }
                ]
            }
        ],
        'web development': [
            {
                title: "HTML Fundamentals",
                resources: [
                    { name: "MDN Web Docs: HTML Basics", url: "https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML" },
                    { name: "FreeCodeCamp: Responsive Web Design (HTML section)", url: "https://www.freecodecamp.org/learn/responsive-web-design/" }
                ]
            },
            {
                title: "CSS Styling and Layouts",
                resources: [
                    { name: "MDN Web Docs: CSS Basics", url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps" },
                    { name: "CSS-Tricks: A Complete Guide to Flexbox", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" },
                    { name: "CSS-Tricks: A Complete Guide to Grid", url: "https://css-tricks.com/snippets/css/a-complete-guide-to-css-grid/" }
                ]
            },
            {
                title: "JavaScript Essentials",
                resources: [
                    { name: "MDN Web Docs: JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide" },
                    { name: "Eloquent JavaScript (Online Book)", url: "https://eloquentjavascript.net/" }
                ]
            },
            {
                title: "Front-end Frameworks (e.g., React, Vue, Angular)",
                resources: [
                    { name: "React Official Website", url: "https://react.dev/" },
                    { name: "Vue.js Official Website", url: "https://vuejs.org/" }
                ]
            },
            {
                title: "Back-end Development (Node.js, Python, PHP)",
                resources: [
                    { name: "MDN Web Docs: Express (Node.js framework)", url: "https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs" },
                    { name: "Python.org: Getting Started with Python", url: "https://www.python.org/about/gettingstarted/" }
                ]
            }
        ]
    };

    // Function to generate and display the learning path
    function generateLearningPath() {
        const topic = topicInput.value.trim().toLowerCase();
        let pathData = learningPaths[topic];
        let isGeneric = false;

        if (!pathData) {
            isGeneric = true;
            pathData = [
                {
                    title: `Introduction to ${topic || 'Your Topic'}`, // Fallback for empty topic
                    resources: [
                        { name: `Wikipedia: ${topic || 'Topic'}`, url: `https://en.wikipedia.org/wiki/${encodeURIComponent(topic || 'Learning')}` },
                        { name: `Google Search: Learn ${topic || 'Topic'}`, url: `https://www.google.com/search?q=learn+${encodeURIComponent(topic || 'topic')}` }
                    ]
                },
                {
                    title: `Core Concepts of ${topic || 'Your Topic'}`,
                    resources: [
                        { name: "Online Course: Fundamentals (example)", url: "https://www.coursera.org/" },
                        { name: "Book: Deep Dive into (example)", url: "https://www.amazon.com/" }
                    ]
                },
                {
                    title: `Advanced Topics & Best Practices`,
                    resources: [
                        { name: "Community Forum (example)", url: "https://stackoverflow.com/" },
                        { name: "Project Ideas (example)", url: "https://github.com/topics/" }
                    ]
                }
            ];
        }

        pathContent.innerHTML = ''; // Clear previous content

        if (isGeneric) {
            const placeholderEl = document.createElement('p');
            placeholderEl.classList.add('placeholder');
            placeholderEl.textContent = `No specific path found for "${topic}". Here's a generic outline to get you started:`;
            pathContent.appendChild(placeholderEl);
        }

        pathData.forEach((module, index) => {
            const moduleEl = document.createElement('div');
            moduleEl.classList.add('module');

            // Unique ID for each module to store progress
            const moduleId = `${topic.replace(/[^a-z0-9]/gi, '_')}-${index}`;
            const isCompleted = localStorage.getItem(moduleId) === 'true';

            moduleEl.innerHTML = `
                <h3>
                    ${module.title}
                    <input type="checkbox" data-module-id="${moduleId}" ${isCompleted ? 'checked' : ''}>
                </h3>
                <ul>
                    ${module.resources.map(resource => `
                        <li><a href="${resource.url}" target="_blank" rel="noopener noreferrer">${resource.name}</a></li>
                    `).join('')}
                </ul>
            `;
            pathContent.appendChild(moduleEl);

            // Apply initial visual state based on loaded progress
            if (isCompleted) {
                moduleEl.style.opacity = '0.7';
                moduleEl.style.backgroundColor = '#e6ffe6';
            }
        });

        // Add event listeners for checkboxes (after all modules are added)
        document.querySelectorAll('.module input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (event) => {
                const moduleId = event.target.dataset.moduleId;
                localStorage.setItem(moduleId, event.target.checked);
                
                const parentModule = event.target.closest('.module');
                parentModule.style.opacity = event.target.checked ? '0.7' : '1';
                parentModule.style.backgroundColor = event.target.checked ? '#e6ffe6' : '#ffffff';
            });
        });
    }

    generatePathBtn.addEventListener('click', generateLearningPath);

    // Allow pressing Enter in the input field
    topicInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            generateLearningPath();
        }
    });

    // Optional: Generate a default path on load if topic input is pre-filled
    // Example: topicInput.value = 'React';
    // if (topicInput.value) {
    //     generateLearningPath();
    // }
});
