// script.js

const contentDatabase = [
    {
        title: "The Galactic Odyssey",
        description: "An epic journey through distant galaxies, encountering alien civilizations and facing unknown dangers.",
        keywords: ["sci-fi", "space", "adventure", "aliens", "exploration", "future", "epic"],
        genre: "Science Fiction"
    },
    {
        title: "Mystery of the Old Manor",
        description: "A gripping detective story set in a haunted old manor, full of twists and turns.",
        keywords: ["mystery", "detective", "suspense", "thriller", "haunted", "manor", "investigation"],
        genre: "Mystery"
    },
    {
        title: "Romantic Parisian Escape",
        description: "A heartwarming romantic comedy about finding love in the beautiful city of Paris.",
        keywords: ["romance", "comedy", "paris", "love", "feel-good", "travel", "charming"],
        genre: "Romance"
    },
    {
        title: "Ancient Civilizations Unveiled",
        description: "A documentary exploring the fascinating history and cultures of ancient Egypt, Rome, and Greece.",
        keywords: ["documentary", "history", "ancient", "egypt", "rome", "greece", "culture"],
        genre: "Documentary"
    },
    {
        title: "Coding for Beginners",
        description: "An interactive tutorial series designed to teach the fundamentals of programming.",
        keywords: ["education", "coding", "programming", "tutorial", "beginners", "tech", "learning"],
        genre: "Education"
    },
    {
        title: "Fantasy Realm Chronicles",
        description: "Enter a world of magic, dragons, and brave knights on a quest to save their kingdom.",
        keywords: ["fantasy", "magic", "dragons", "knights", "adventure", "quest", "epic"],
        genre: "Fantasy"
    },
    {
        title: "Healthy Eating Habits",
        description: "A guide to developing sustainable healthy eating habits and understanding nutrition.",
        keywords: ["health", "nutrition", "diet", "wellness", "cooking", "food", "guide"],
        genre: "Health"
    },
    {
        title: "The Art of Photography",
        description: "Learn the basics and advanced techniques of digital photography, from composition to editing.",
        keywords: ["art", "photography", "camera", "visual", "creative", "editing", "skills"],
        genre: "Art"
    },
    {
        title: "Space Exploration Today",
        description: "Explore the latest breakthroughs and missions in space exploration, Mars rovers, and future human colonies.",
        keywords: ["space", "exploration", "nasa", "astronomy", "mars", "future", "technology", "sci-fi"],
        genre: "Science"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const preferencesInput = document.getElementById('preferences');
    const getRecommendationsBtn = document.getElementById('getRecommendations');
    const recommendationsList = document.getElementById('recommendationsList');

    getRecommendationsBtn.addEventListener('click', () => {
        const userPreferences = preferencesInput.value
            .toLowerCase()
            .split(',')
            .map(pref => pref.trim())
            .filter(pref => pref.length > 0);

        if (userPreferences.length === 0) {
            displayRecommendations([]); // Show no recommendations message
            return;
        }

        const scoredContent = contentDatabase.map(content => {
            let score = 0;
            const contentKeywords = content.keywords.map(kw => kw.toLowerCase());
            const contentDescription = content.description.toLowerCase();
            const contentTitle = content.title.toLowerCase();

            userPreferences.forEach(pref => {
                // Check against keywords (higher weight)
                if (contentKeywords.includes(pref)) {
                    score += 2;
                }
                // Check against title
                if (contentTitle.includes(pref)) {
                    score += 1;
                }
                // Check against description (broader match)
                if (contentDescription.includes(pref)) {
                    score += 1;
                }
            });
            return { content, score };
        }).filter(item => item.score > 0); // Only keep items with a positive score

        scoredContent.sort((a, b) => b.score - a.score); // Sort by score descending

        displayRecommendations(scoredContent.slice(0, 5)); // Display top 5 recommendations
    });

    function displayRecommendations(recommendations) {
        recommendationsList.innerHTML = ''; // Clear previous recommendations

        if (recommendations.length === 0) {
            recommendationsList.innerHTML = '<p class="no-recommendations">No recommendations found matching your preferences. Try different keywords!</p>';
            return;
        }

        recommendations.forEach(({ content }) => {
            const card = document.createElement('div');
            card.classList.add('recommendation-card');

            const title = document.createElement('h3');
            title.textContent = content.title;

            const description = document.createElement('p');
            description.textContent = content.description;

            const keywords = document.createElement('p');
            keywords.classList.add('keywords');
            keywords.textContent = `Keywords: ${content.keywords.join(', ')}`;

            card.appendChild(title);
            card.appendChild(description);
            card.appendChild(keywords);
            recommendationsList.appendChild(card);
        });
    }

    // Initial message on page load
    displayRecommendations([]);
});
