const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
    { id: 4, name: 'Diana' }
];

const items = [
    { id: 101, title: 'Galaxy Quest', genres: ['Sci-Fi', 'Comedy', 'Adventure'] },
    { id: 102, title: 'The Martian', genres: ['Sci-Fi', 'Drama', 'Adventure'] },
    { id: 103, title: 'Inception', genres: ['Sci-Fi', 'Action', 'Thriller'] },
    { id: 104, title: 'Forrest Gump', genres: ['Drama', 'Romance', 'History'] },
    { id: 105, title: 'Pulp Fiction', genres: ['Crime', 'Drama', 'Thriller'] },
    { id: 106, title: 'The Lion King', genres: ['Animation', 'Family', 'Musical'] },
    { id: 107, title: 'Interstellar', genres: ['Sci-Fi', 'Drama', 'Adventure'] },
    { id: 108, title: 'Spirited Away', genres: ['Animation', 'Fantasy', 'Adventure'] },
    { id: 109, title: 'La La Land', genres: ['Musical', 'Romance', 'Drama'] },
    { id: 110, title: 'Matrix', genres: ['Sci-Fi', 'Action', 'Thriller'] }
];

// Ratings from 1 to 5
const ratings = [
    { userId: 1, itemId: 101, rating: 5 }, // Alice liked Galaxy Quest (Sci-Fi, Comedy)
    { userId: 1, itemId: 103, rating: 4 }, // Alice liked Inception (Sci-Fi, Action, Thriller)
    { userId: 1, itemId: 107, rating: 5 }, // Alice liked Interstellar (Sci-Fi, Drama, Adventure)

    { userId: 2, itemId: 104, rating: 5 }, // Bob liked Forrest Gump (Drama, Romance)
    { userId: 2, itemId: 105, rating: 4 }, // Bob liked Pulp Fiction (Crime, Drama)
    { userId: 2, itemId: 109, rating: 3 }, // Bob liked La La Land (Musical, Romance, Drama)

    { userId: 3, itemId: 106, rating: 5 }, // Charlie liked Lion King (Animation, Family)
    { userId: 3, itemId: 108, rating: 4 }, // Charlie liked Spirited Away (Animation, Fantasy)
    { userId: 3, itemId: 101, rating: 3 }, // Charlie also liked Galaxy Quest a bit

    { userId: 4, itemId: 102, rating: 4 }, // Diana liked The Martian (Sci-Fi, Drama)
    { userId: 4, itemId: 103, rating: 5 }, // Diana liked Inception (Sci-Fi, Action)
    { userId: 4, itemId: 110, rating: 5 }, // Diana liked Matrix (Sci-Fi, Action)
    { userId: 4, itemId: 105, rating: 2 }  // Diana disliked Pulp Fiction (Crime, Drama)
];

// DOM Elements
const userSelect = document.getElementById('userSelect');
const currentUserNameSpan = document.getElementById('currentUserName');
const recommendedForUserNameSpan = document.getElementById('recommendedForUserName');
const ratedMoviesList = document.getElementById('ratedMoviesList');
const recommendedMoviesList = document.getElementById('recommendedMoviesList');

/**
 * Creates and returns an HTML div element for a movie item.
 * @param {object} movie - The movie object.
 * @param {'rated'|'recommended'} type - Type of display (for styling and content).
 * @param {number|null} score - Recommendation score (for recommended items).
 * @param {string|null} reason - Explanation for the recommendation.
 * @returns {HTMLDivElement} The created movie item element.
 */
function renderMovieItem(movie, type, score = null, reason = null) {
    const movieDiv = document.createElement('div');
    movieDiv.classList.add('movie-item', type);

    const title = document.createElement('h3');
    title.textContent = movie.title;
    movieDiv.appendChild(title);

    const genresDiv = document.createElement('p');
    genresDiv.classList.add('genres');
    movie.genres.forEach(genre => {
        const span = document.createElement('span');
        span.textContent = genre;
        genresDiv.appendChild(span);
    });
    movieDiv.appendChild(genresDiv);

    if (type === 'rated') {
        const userRating = ratings.find(r => r.userId === parseInt(userSelect.value) && r.itemId === movie.id);
        const ratingP = document.createElement('p');
        ratingP.classList.add('rating');
        ratingP.innerHTML = `Your Rating: <strong>${userRating.rating}/5</strong>`;
        movieDiv.appendChild(ratingP);
    } else if (score !== null) {
        const scoreP = document.createElement('p');
        scoreP.classList.add('score');
        scoreP.innerHTML = `Recommendation Score: <strong>${score.toFixed(2)}</strong> (Higher is better)`;
        movieDiv.appendChild(scoreP);

        if (reason) {
            const reasonP = document.createElement('p');
            reasonP.classList.add('reason');
            reasonP.innerHTML = `<em>${reason}</em>`;
            movieDiv.appendChild(reasonP);
        }
    }

    return movieDiv;
}

/**
 * Updates the UI with a selected user's ratings and recommendations.
 * @param {number} userId - The ID of the selected user.
 */
function updateUI(userId) {
    const user = users.find(u => u.id === userId);
    currentUserNameSpan.textContent = user ? user.name : 'Unknown User';
    recommendedForUserNameSpan.textContent = user ? user.name : 'Unknown User';

    renderUserRatings(userId);
    const recommendations = calculateRecommendations(userId);
    renderRecommendations(recommendations);
}

/**
 * Renders the movies rated by the given user.
 * @param {number} userId - The ID of the user.
 */
function renderUserRatings(userId) {
    ratedMoviesList.innerHTML = ''; // Clear previous ratings
    const userRatedItems = ratings.filter(r => r.userId === userId)
                                 .map(r => ({ ...items.find(item => item.id === r.itemId), rating: r.rating }));

    if (userRatedItems.length === 0) {
        ratedMoviesList.innerHTML = '<p>This user has not rated any movies yet.</p>';
        return;
    }

    userRatedItems.sort((a, b) => b.rating - a.rating); // Sort by rating descending
    userRatedItems.forEach(movie => {
        ratedMoviesList.appendChild(renderMovieItem(movie, 'rated'));
    });
}

/**
 * Calculates movie recommendations for a given user.
 * This uses a simplified content-based approach combined with a popularity factor.
 * @param {number} userId - The ID of the user.
 * @returns {Array<object>} An array of recommended items with their scores and reasons.
 */
function calculateRecommendations(userId) {
    const userRatedMovies = ratings.filter(r => r.userId === userId);
    const ratedItemIds = new Set(userRatedMovies.map(r => r.itemId));

    // 1. Build User Genre Profile based on their ratings
    const userGenreProfile = {}; // { genre: { totalRating: N, count: M } }

    userRatedMovies.forEach(userRating => {
        const item = items.find(i => i.id === userRating.itemId);
        if (item) {
            item.genres.forEach(genre => {
                if (!userGenreProfile[genre]) {
                    userGenreProfile[genre] = { totalRating: 0, count: 0 };
                }
                userGenreProfile[genre].totalRating += userRating.rating;
                userGenreProfile[genre].count++;
            });
        }
    });

    // Convert to average preference score per genre
    const userGenrePreferences = {}; // { genre: average_rating_for_this_genre_by_user }
    for (const genre in userGenreProfile) {
        userGenrePreferences[genre] = userGenreProfile[genre].totalRating / userGenreProfile[genre].count;
    }

    // If the user hasn't rated anything, we can't build a genre profile.
    // In a real system, we'd recommend popular items or ask for initial preferences.
    if (Object.keys(userGenrePreferences).length === 0) {
        return [];
    }

    // 2. Score unrated items
    const recommendations = [];
    const unratedItems = items.filter(item => !ratedItemIds.has(item.id));

    unratedItems.forEach(item => {
        let contentBasedScore = 0;
        let matchedGenres = [];

        item.genres.forEach(genre => {
            if (userGenrePreferences[genre]) {
                // If user has a preference for this genre, add it to the score
                contentBasedScore += userGenrePreferences[genre];
                matchedGenres.push(genre);
            }
        });

        // Calculate item's overall average rating (popularity)
        const itemAllRatings = ratings.filter(r => r.itemId === item.id);
        const averageItemRating = itemAllRatings.length > 0
            ? itemAllRatings.reduce((sum, r) => sum + r.rating, 0) / itemAllRatings.length
            : 0; // Default to 0 if no one rated it

        // Combine content-based score with a weighted popularity score
        // Weights can be tuned: 0.7 for content-based, 0.3 for popularity
        const finalScore = (contentBasedScore * 0.7) + (averageItemRating * 0.3);

        if (finalScore > 0) { // Only recommend items with a positive score
            let reason = '';
            if (matchedGenres.length > 0) {
                reason += `Matches your preference for: ${matchedGenres.join(', ')}.`;
            }
            if (averageItemRating > 0 && contentBasedScore === 0) {
                reason += ` Generally popular movie (avg rating: ${averageItemRating.toFixed(1)}/5).`;
            } else if (averageItemRating > 0) {
                reason += ` Also a popular choice (avg rating: ${averageItemRating.toFixed(1)}/5).`;
            }
            if (reason === '') reason = 'No specific match found, but has a positive general appeal.';

            recommendations.push({
                item: item,
                score: finalScore,
                reason: reason.trim()
            });
        }
    });

    // 3. Sort and return top N recommendations
    recommendations.sort((a, b) => b.score - a.score);
    return recommendations.slice(0, 5); // Limit to top 5 recommendations
}

/**
 * Renders the calculated recommendations.
 * @param {Array<object>} recommendations - An array of recommended items.
 */
function renderRecommendations(recommendations) {
    recommendedMoviesList.innerHTML = ''; // Clear previous recommendations

    if (recommendations.length === 0) {
        recommendedMoviesList.innerHTML = '<p>No recommendations could be generated for this user based on current data.</p>';
        return;
    }

    recommendations.forEach(rec => {
        recommendedMoviesList.appendChild(renderMovieItem(rec.item, 'recommended', rec.score, rec.reason));
    });
}

/**
 * Initializes the application: populates user dropdown and renders initial data.
 */
function init() {
    // Populate user dropdown
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        userSelect.appendChild(option);
    });

    // Set initial user and render UI
    const initialUserId = parseInt(userSelect.value);
    if (!isNaN(initialUserId)) {
        updateUI(initialUserId);
    } else if (users.length > 0) {
        // Fallback if initial value is somehow not set, pick the first user
        userSelect.value = users[0].id;
        updateUI(users[0].id);
    }

    // Event listener for user selection change
    userSelect.addEventListener('change', (event) => {
        const selectedUserId = parseInt(event.target.value);
        updateUI(selectedUserId);
    });
}

// Initialize the app when the DOM is ready
document.addEventListener('DOMContentLoaded', init);
