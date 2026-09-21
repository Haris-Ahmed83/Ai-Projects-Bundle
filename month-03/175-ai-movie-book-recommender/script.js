document.addEventListener('DOMContentLoaded', () => {
    const genreInput = document.getElementById('genreInput');
    const getRecommendationsBtn = document.getElementById('getRecommendationsBtn');
    const recommendationsList = document.getElementById('recommendationsList');
    const loadingIndicator = document.getElementById('loadingIndicator');

    // Mock API data - simulates a backend database
    const mockApiData = [
        {
            id: 1,
            title: "The Silent Watcher",
            type: "movie",
            genres: ["Thriller", "Mystery", "Drama"],
            description: "A seasoned detective unravels a complex conspiracy in a quiet, isolated town, where nothing is as it seems.",
            rating: 4.5
        },
        {
            id: 2,
            title: "Echoes of Eternity",
            type: "book",
            genres: ["Fantasy", "Adventure", "Epic"],
            description: "A young hero embarks on a perilous quest to save their world from an ancient evil prophesied to return.",
            rating: 4.8
        },
        {
            id: 3,
            title: "Galactic Voyage",
            type: "movie",
            genres: ["Sci-Fi", "Action", "Space Opera"],
            description: "Humanity's last hope lies with a rogue pilot on a daring mission across the galaxy to find a new home.",
            rating: 4.3
        },
        {
            id: 4,
            title: "The Last Alchemist",
            type: "book",
            genres: ["Historical Fiction", "Mystery", "Fantasy"],
            description: "In 17th-century Prague, an alchemist uncovers a secret that could change history, blending science with forbidden magic.",
            rating: 4.7
        },
        {
            id: 5,
            title: "City of Shadows",
            type: "movie",
            genres: ["Film Noir", "Crime", "Thriller"],
            description: "A cynical private eye gets entangled in a web of deceit and murder in the rain-slicked streets of a corrupt city.",
            rating: 4.1
        },
        {
            id: 6,
            title: "Whispers of the Old Gods",
            type: "book",
            genres: ["Horror", "Mystery", "Supernatural"],
            description: "An ancient evil awakens in a remote coastal town, threatening to consume all who dwell there.",
            rating: 4.6
        },
        {
            id: 7,
            title: "Comedy Tonight!",
            type: "movie",
            genres: ["Comedy", "Romance"],
            description: "Two strangers accidentally swap lives and find unexpected love and laughter in the most chaotic circumstances.",
            rating: 3.9
        },
        {
            id: 8,
            title: "The Quantum Leap",
            type: "book",
            genres: ["Sci-Fi", "Time Travel", "Adventure"],
            description: "A brilliant physicist discovers the secret to time travel, but with unforeseen consequences that ripple through history.",
            rating: 4.4
        },
        {
            id: 9,
            title: "Beyond the Stars",
            type: "movie",
            genres: ["Sci-Fi", "Drama"],
            description: "A poignant story of humanity's future among the stars, exploring themes of isolation, connection, and the meaning of home.",
            rating: 4.2
        },
        {
            id: 10,
            title: "The Detective's Dilemma",
            type: "book",
            genres: ["Mystery", "Thriller"],
            description: "A seasoned detective faces his toughest case yet, blurring the lines between justice and revenge in a morally ambiguous world.",
            rating: 4.5
        },
        {
            id: 11,
            title: "Romantic Getaway",
            type: "movie",
            genres: ["Romance", "Comedy"],
            description: "A couple's anniversary trip takes an unexpected turn, leading to hilarious and heartwarming moments they'll never forget.",
            rating: 4.0
        },
        {
            id: 12,
            title: "Ancient Prophecies",
            type: "book",
            genres: ["Fantasy", "Adventure"],
            description: "A young scholar uncovers ancient prophecies that foretell the end of an era and their crucial role in preventing it.",
            rating: 4.6
        }
    ];

    // Simulate API call
    const fetchRecommendations = (genre) => {
        return new Promise(resolve => {
            setTimeout(() => {
                if (!genre || genre.trim() === '') {
                    // If no genre, return a diverse random selection for initial display or a generic search.
                    // For this project, let's return a small random set if input is empty.
                    const shuffled = [...mockApiData].sort(() => 0.5 - Math.random());
                    resolve(shuffled.slice(0, 4)); // Return 4 random items
                    return;
                }

                const searchGenre = genre.toLowerCase();
                const filteredData = mockApiData.filter(item =>
                    item.genres.some(g => g.toLowerCase().includes(searchGenre))
                );
                resolve(filteredData);
            }, 1000); // Simulate network latency of 1 second
        });
    };

    const displayRecommendations = (items) => {
        recommendationsList.innerHTML = ''; // Clear previous recommendations

        if (items.length === 0) {
            recommendationsList.innerHTML = '<p class="no-results-text">No recommendations found for this genre. Try another!</p>';
            return;
        }

        items.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('recommendation-card');

            const genreTags = item.genres.map(g => `<span>${g}</span>`).join('');

            card.innerHTML = `
                <h3>${item.title}</h3>
                <p><strong>Type:</strong> ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</p>
                <p class="genres"><strong>Genres:</strong> ${genreTags}</p>
                <p class="description">${item.description}</p>
                <p><strong>Rating:</strong> ${item.rating} / 5</p>
            `;
            recommendationsList.appendChild(card);
        });
    };

    const handleGetRecommendations = async () => {
        const genre = genreInput.value.trim();

        recommendationsList.innerHTML = ''; // Clear previous results
        loadingIndicator.style.display = 'flex'; // Show loading indicator

        try {
            const recommendations = await fetchRecommendations(genre);
            displayRecommendations(recommendations);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            recommendationsList.innerHTML = '<p class="no-results-text">An error occurred while fetching recommendations.</p>';
        } finally {
            loadingIndicator.style.display = 'none'; // Hide loading indicator
        }
    };

    getRecommendationsBtn.addEventListener('click', handleGetRecommendations);

    // Optional: Trigger recommendations on Enter key press in the input field
    genreInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleGetRecommendations();
        }
    });

    // Initial display of some general recommendations when the page loads
    const loadInitialRecommendations = async () => {
        loadingIndicator.style.display = 'flex';
        try {
            // Fetch a random set of 4 recommendations initially
            const initialRecommendations = await fetchRecommendations('');
            displayRecommendations(initialRecommendations);
            recommendationsList.querySelector('.placeholder-text')?.remove(); // Remove placeholder if present
        } catch (error) {
            console.error('Error loading initial recommendations:', error);
            recommendationsList.innerHTML = '<p class="no-results-text">Failed to load initial recommendations.</p>';
        } finally {
            loadingIndicator.style.display = 'none';
        }
    };

    loadInitialRecommendations();
});
