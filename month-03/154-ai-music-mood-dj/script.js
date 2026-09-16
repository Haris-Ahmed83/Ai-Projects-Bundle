document.addEventListener('DOMContentLoaded', () => {
    const moodInput = document.getElementById('moodInput');
    const generatePlaylistBtn = document.getElementById('generatePlaylistBtn');
    const playlistItemsContainer = document.getElementById('playlistItems');
    const noPlaylistMessage = document.getElementById('noPlaylistMessage');

    const moodPlaylists = {
        'happy': [
            { title: 'Happy Together', artist: 'The Turtles' },
            { title: 'Walking on Sunshine', artist: 'Katrina & The Waves' },
            { title: 'Don\'t Stop Me Now', artist: 'Queen' },
            { title: 'Good Vibrations', artist: 'The Beach Boys' }
        ],
        'energetic': [
            { title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars' },
            { title: 'Blinding Lights', artist: 'The Weeknd' },
            { title: 'Can\'t Stop The Feeling!', artist: 'Justin Timberlake' },
            { title: 'Eye of the Tiger', artist: 'Survivor' }
        ],
        'relaxed': [
            { title: 'Weightless', artist: 'Marconi Union' },
            { title: 'Clair de Lune', artist: 'Claude Debussy' },
            { title: 'Summertime', artist: 'Ella Fitzgerald' },
            { title: 'What a Wonderful World', artist: 'Louis Armstrong' }
        ],
        'sad': [
            { title: 'Hallelujah', artist: 'Jeff Buckley' },
            { title: 'Yesterday', artist: 'The Beatles' },
            { title: 'Fix You', artist: 'Coldplay' },
            { title: 'Someone Like You', artist: 'Adele' }
        ],
        'focused': [
            { title: 'Lo-fi Study Beats', artist: 'Various Artists' },
            { title: 'Ambient 1: Music for Airports', artist: 'Brian Eno' },
            { title: 'Experience', artist: 'Ludovico Einaudi' },
            { title: 'Nuvole Bianche', artist: 'Ludovico Einaudi' }
        ],
        'romantic': [
            { title: 'At Last', artist: 'Etta James' },
            { title: 'Can\'t Help Falling in Love', artist: 'Elvis Presley' },
            { title: 'Perfect', artist: 'Ed Sheeran' },
            { title: 'Thinking Out Loud', artist: 'Ed Sheeran' }
        ]
    };

    const defaultPlaylist = [
        { title: 'Imagine', artist: 'John Lennon' },
        { title: 'Bohemian Rhapsody', artist: 'Queen' },
        { title: 'Hotel California', artist: 'Eagles' },
        { title: 'Africa', artist: 'Toto' }
    ];

    generatePlaylistBtn.addEventListener('click', () => {
        const moodText = moodInput.value.toLowerCase().trim();
        if (!moodText) {
            alert('Please enter your mood or activity!');
            return;
        }

        generatePlaylistBtn.disabled = true;
        generatePlaylistBtn.textContent = 'Generating...';
        playlistItemsContainer.innerHTML = ''; // Clear previous playlist
        noPlaylistMessage.textContent = 'Generating your personalized playlist...';
        noPlaylistMessage.style.display = 'block';

        // Simulate AI processing and API call with a delay
        setTimeout(() => {
            let detectedMood = 'default';
            for (const mood in moodPlaylists) {
                // Simple keyword matching for mood detection
                if (moodText.includes(mood) || moodText.includes(mood.slice(0, -1))) {
                    detectedMood = mood;
                    break;
                }
            }

            const playlist = moodPlaylists[detectedMood] || defaultPlaylist;

            displayPlaylist(playlist);
            generatePlaylistBtn.disabled = false;
            generatePlaylistBtn.textContent = 'Generate Playlist';
        }, 1500); // Simulate 1.5 seconds of AI processing
    });

    function displayPlaylist(playlist) {
        playlistItemsContainer.innerHTML = ''; // Clear previous items
        if (playlist.length === 0) {
            noPlaylistMessage.textContent = 'Could not generate a playlist for your mood. Please try again!';
            noPlaylistMessage.style.display = 'block';
            return;
        }

        noPlaylistMessage.style.display = 'none';
        playlist.forEach(song => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span>${song.title}</span>
                <span>${song.artist}</span>
            `;
            playlistItemsContainer.appendChild(listItem);
        });
    }

    // Initial message display
    noPlaylistMessage.style.display = 'block';
});
