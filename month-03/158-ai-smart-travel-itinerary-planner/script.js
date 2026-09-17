document.addEventListener('DOMContentLoaded', () => {
    const destinationInput = document.getElementById('destination');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const interestsInput = document.getElementById('interests');
    const budgetInput = document.getElementById('budget');
    const generateBtn = document.getElementById('generateBtn');
    const itineraryContent = document.getElementById('itineraryContent');
    const loadingDiv = document.getElementById('loading');

    // Helper function to format dates for display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Helper function to calculate number of days (inclusive)
    const getNumberOfDays = (start, end) => {
        const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffDays = Math.round(Math.abs((endDate - startDate) / oneDay));
        return diffDays + 1; 
    };

    const generateItinerary = () => {
        const destination = destinationInput.value.trim();
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const interests = interestsInput.value.split(',').map(item => item.trim()).filter(item => item !== '');
        const budget = parseInt(budgetInput.value);

        // Basic validation
        if (!destination || !startDate || !endDate || isNaN(budget) || new Date(startDate) > new Date(endDate)) {
            itineraryContent.innerHTML = '<p class="error">Please fill in all fields correctly and ensure the end date is after or same as the start date.</p>';
            loadingDiv.classList.add('hidden');
            return;
        }

        itineraryContent.innerHTML = ''; // Clear previous itinerary
        loadingDiv.classList.remove('hidden'); // Show loading indicator
        generateBtn.disabled = true; // Disable button during generation

        // Simulate AI processing time
        setTimeout(() => {
            loadingDiv.classList.add('hidden'); // Hide loading indicator
            generateBtn.disabled = false; // Re-enable button

            const numberOfDays = getNumberOfDays(startDate, endDate);
            let itineraryHtml = `<h3>Your ${numberOfDays}-Day Trip to ${destination}</h3>`;
            itineraryHtml += `<p><strong>Interests:</strong> ${interests.length > 0 ? interests.join(', ') : 'No specific interests'} | <strong>Budget:</strong> $${budget} per day</p>`;

            for (let i = 0; i < numberOfDays; i++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(currentDate.getDate() + i);
                const formattedDate = formatDate(currentDate);

                itineraryHtml += `
                    <div class="day-plan">
                        <h3>Day ${i + 1}: ${formattedDate}</h3>
                        <ul>
                            <li><strong>Morning:</strong> Explore ${getMorningActivity(destination, interests, i)}</li>
                            <li><strong>Lunch:</strong> Enjoy local cuisine at ${getLunchOption(destination, budget, interests, i)}</li>
                            <li><strong>Afternoon:</strong> Visit ${getAfternoonActivity(destination, interests, i)}</li>
                            <li><strong>Evening:</strong> Dinner at ${getDinnerOption(destination, budget, interests, i)} and ${getEveningActivity(destination, interests, i)}</li>
                        </ul>
                    </div>
                `;
            }

            itineraryContent.innerHTML = itineraryHtml;

        }, 2000); // Simulate 2 seconds of AI processing
    };

    // --- AI Simulation Helper Functions (simplified logic) ---
    // These functions generate dummy but somewhat relevant content based on inputs.
    const getMorningActivity = (destination, interests, dayIndex) => {
        const destLower = destination.toLowerCase();
        if (destLower.includes('kyoto')) {
            return `Fushimi Inari-taisha Shrine (early for fewer crowds)`;
        } else if (destLower.includes('paris')) {
            return `Eiffel Tower photo op & Champ de Mars stroll`;
        } else if (destLower.includes('tokyo')) {
            return `Tsukiji Outer Market (for fresh seafood) or Senso-ji Temple`;
        }
        if (interests.includes('nature')) return `a scenic park or botanical garden`;
        if (interests.includes('history')) return `a historical monument or museum`;
        return `a popular landmark in ${destination}`; 
    };

    const getLunchOption = (destination, budget, interests, dayIndex) => {
        const destLower = destination.toLowerCase();
        if (interests.includes('food')) {
            if (destLower.includes('kyoto')) return `a traditional ramen shop or local soba spot`;
            if (destLower.includes('paris')) return `a charming boulangerie for a sandwich or crêpe`;
            if (destLower.includes('tokyo')) return `a casual sushi train or tempura restaurant`;
        }
        if (budget < 80) {
            return `a charming local bistro or street food stall`;
        } else if (budget >= 80 && budget < 150) {
            return `a highly-rated restaurant offering regional specialties`;
        } else {
            return `a gourmet lunch experience`;
        }
    };

    const getAfternoonActivity = (destination, interests, dayIndex) => {
        const destLower = destination.toLowerCase();
        if (destLower.includes('kyoto')) {
            if (interests.includes('temples') || interests.includes('history')) return `Kinkaku-ji (Golden Pavilion) or Kiyomizu-dera Temple`;
            if (interests.includes('gardens') || interests.includes('nature')) return `Arashiyama Bamboo Grove & Tenryu-ji Temple Garden`;
            if (interests.includes('food')) return `Nishiki Market food tour`;
            return `explore Gion district`;
        } else if (destLower.includes('paris')) {
            if (interests.includes('history') || interests.includes('art')) return `Louvre Museum or Musée d'Orsay`;
            if (interests.includes('shopping')) return `explore Le Marais boutiques`;
            return `a relaxing walk along the Seine`;
        } else if (destLower.includes('tokyo')) {
            if (interests.includes('shopping')) return `Shibuya Crossing & shopping district`;
            if (interests.includes('culture')) return `Meiji Jingu Shrine & Harajuku Takeshita Street`;
            return `explore Shinjuku Gyoen National Garden`;
        }
        if (interests.includes('art')) return `a prominent art gallery`;
        return `a unique local attraction based on your interests`;
    };

    const getDinnerOption = (destination, budget, interests, dayIndex) => {
        const destLower = destination.toLowerCase();
        if (interests.includes('food')) {
            if (destLower.includes('kyoto')) return `traditional Kaiseki or Izakaya experience`;
            if (destLower.includes('paris')) return `classic French brasserie or a romantic bistro`;
            if (destLower.includes('tokyo')) return `sushi omakase, a vibrant ramen joint, or Yakiniku`;
        }
        if (budget < 100) return `a cozy local restaurant with authentic flavors`;
        if (budget >= 100 && budget < 200) return `a highly-rated dining spot with ambiance`;
        return `a fine dining experience or a restaurant with a view`;
    };

    const getEveningActivity = (destination, interests, dayIndex) => {
        const destLower = destination.toLowerCase();
        if (destLower.includes('kyoto')) {
            if (interests.includes('culture')) return `a Gion geisha walk or traditional tea ceremony`;
            return `stroll along Pontocho Alley or enjoy a quiet drink`;
        } else if (destLower.includes('paris')) {
            return `a Bateaux Mouches river cruise, Montmartre exploration, or a cabaret show`;
        } else if (destLower.includes('tokyo')) {
            return `experience Shinjuku nightlife, explore Golden Gai, or visit a themed cafe`;
        }
        if (interests.includes('entertainment')) return `a local show or live music venue`;
        return `enjoying the local nightlife or a relaxing evening walk`;
    };


    generateBtn.addEventListener('click', generateItinerary);

    // Optional: Generate an initial itinerary on load for demo purposes
    // generateItinerary();
});
