document.addEventListener('DOMContentLoaded', () => {
    // Initialize the Leaflet map
    // Set initial view to a general world view or a default city like London
    const map = L.map('map').setView([20, 0], 2); // Centered near the equator, low zoom

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const locationInput = document.getElementById('locationInput');
    const addLocationBtn = document.getElementById('addLocationBtn');
    const messageDiv = document.getElementById('message');

    // Function to display messages (errors, info)
    function displayMessage(msg, type = 'error') {
        messageDiv.textContent = msg;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
            messageDiv.textContent = '';
            messageDiv.className = 'message';
        }, 5000);
    }

    // Function to add a location to the map
    async function addLocationToMap() {
        const locationString = locationInput.value.trim();
        if (!locationString) {
            displayMessage('Please enter a location.', 'error');
            return;
        }

        addLocationBtn.disabled = true;
        addLocationBtn.textContent = 'Adding...';
        messageDiv.style.display = 'none'; // Hide previous messages

        try {
            // Check if input is a coordinate pair (latitude, longitude)
            const coordRegex = /^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/;
            const match = locationString.match(coordRegex);

            let lat, lon;

            if (match) {
                // Input is coordinates
                lat = parseFloat(match[1]);
                lon = parseFloat(match[2]);

                if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
                    throw new Error('Invalid coordinates. Latitude must be -90 to 90, Longitude -180 to 180.');
                }

                addMarker(lat, lon, locationString);
            } else {
                // Input is a place name, use Nominatim geocoding API
                const geocodingUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationString)}`;
                const response = await fetch(geocodingUrl);
                const data = await response.json();

                if (data && data.length > 0) {
                    lat = parseFloat(data[0].lat);
                    lon = parseFloat(data[0].lon);
                    addMarker(lat, lon, data[0].display_name || locationString);
                } else {
                    displayMessage('Location not found. Please try a different query.', 'error');
                }
            }
        } catch (error) {
            console.error('Error adding location:', error);
            displayMessage(`Failed to add location: ${error.message || 'An unknown error occurred.'}`, 'error');
        } finally {
            addLocationBtn.disabled = false;
            addLocationBtn.textContent = 'Add to Map';
            locationInput.value = ''; // Clear input
        }
    }

    // Helper function to add a marker to the map
    function addMarker(lat, lon, popupText) {
        const marker = L.marker([lat, lon]).addTo(map);
        marker.bindPopup(`<b>Location:</b> ${popupText}`).openPopup();
        map.setView([lat, lon], 13); // Center map on the new marker with zoom level 13
    }

    // Event listener for the button
    addLocationBtn.addEventListener('click', addLocationToMap);

    // Allow pressing Enter key in the input field
    locationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addLocationToMap();
        }
    });
});
