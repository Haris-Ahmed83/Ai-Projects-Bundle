document.addEventListener('DOMContentLoaded', () => {
    // Initialize the Leaflet map
    const map = L.map('map').setView([0, 0], 2); // Centered at [0,0] with zoom level 2 (world view)

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Get references to input elements and button
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    const dataInput = document.getElementById('data');
    const addPointBtn = document.getElementById('addPointBtn');

    // Store markers (optional, for potential future management or removal)
    const markers = [];

    // Add event listener for the button
    addPointBtn.addEventListener('click', () => {
        const lat = parseFloat(latitudeInput.value);
        const lng = parseFloat(longitudeInput.value);
        const data = dataInput.value.trim();

        // Basic validation
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            alert('Please enter valid latitude (-90 to 90) and longitude (-180 to 180) values.');
            return;
        }

        if (data === '') {
            alert('Please enter some data information for the point.');
            return;
        }

        // Create a marker and add it to the map
        const marker = L.marker([lat, lng])
            .addTo(map)
            .bindPopup(`<b>Location:</b> (${lat}, ${lng})<br><b>Data:</b> ${data}`)
            .openPopup(); // Open popup immediately for new points

        markers.push(marker); // Store the marker reference

        // Optionally, center the map on the new point and zoom in slightly
        map.setView([lat, lng], 10); 

        // Clear input fields
        latitudeInput.value = '';
        longitudeInput.value = '';
        dataInput.value = '';
    });
});
