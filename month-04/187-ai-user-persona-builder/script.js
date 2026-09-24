document.addEventListener('DOMContentLoaded', () => {
    const productDescriptionInput = document.getElementById('productDescription');
    const generatePersonaBtn = document.getElementById('generatePersonaBtn');
    const personaOutput = document.getElementById('personaOutput');
    const loadingIndicator = document.getElementById('loadingIndicator');

    generatePersonaBtn.addEventListener('click', async () => {
        const description = productDescriptionInput.value.trim();

        if (!description) {
            alert('Please enter a product description.');
            return;
        }

        personaOutput.innerHTML = ''; // Clear previous persona
        loadingIndicator.classList.remove('hidden'); // Show loading indicator
        generatePersonaBtn.disabled = true; // Disable button during generation

        try {
            const persona = await mockGeneratePersona(description);
            displayPersona(persona);
        } catch (error) {
            console.error('Error generating persona:', error);
            personaOutput.innerHTML = '<p class="error-text">Failed to generate persona. Please try again.</p>';
        } finally {
            loadingIndicator.classList.add('hidden'); // Hide loading indicator
            generatePersonaBtn.disabled = false; // Re-enable button
        }
    });

    function mockGeneratePersona(productDescription) {
        return new Promise(resolve => {
            setTimeout(() => {
                let personaData;

                // Simple keyword-based persona generation logic
                if (productDescription.toLowerCase().includes('finance') || productDescription.toLowerCase().includes('budget')) {
                    personaData = {
                        name: 'Savvy Sarah',
                        age: 32,
                        occupation: 'Marketing Manager',
                        goals: [
                            'Pay off student loans faster.',
                            'Save for a down payment on a house.',
                            'Understand where her money goes each month.'
                        ],
                        frustrations: [
                            'Complex budgeting apps that are hard to set up.',
                            'Unexpected expenses throwing off her plans.',
                            'Feeling overwhelmed by financial jargon.'
                        ],
                        bio: 'Sarah is a detail-oriented marketing professional living in a bustling city. She earns a decent salary but struggles with managing her personal finances effectively. She wants to be more proactive with her money, but often finds herself stressed by the complexity of financial planning. She values tools that are intuitive and provide clear insights without requiring extensive financial knowledge.'
                    };
                } else if (productDescription.toLowerCase().includes('health') || productDescription.toLowerCase().includes('fitness')) {
                    personaData = {
                        name: 'Active Alex',
                        age: 28,
                        occupation: 'Graphic Designer',
                        goals: [
                            'Track daily calorie intake and exercise.',
                            'Stay motivated to achieve fitness milestones.',
                            'Find healthy meal prep ideas.'
                        ],
                        frustrations: [
                            'Inconsistent workout routines.',
                            'Conflicting health information online.',
                            'Lack of time for elaborate meal prep.'
                        ],
                        bio: 'Alex is a creative graphic designer who enjoys an active lifestyle but struggles with consistency. He wants to maintain a healthy diet and regular exercise, but his busy work schedule often gets in the way. He is looking for a solution that can help him stay accountable, provide personalized recommendations, and simplify his health tracking without being too time-consuming.'
                    };
                } else if (productDescription.toLowerCase().includes('education') || productDescription.toLowerCase().includes('learning') || productDescription.toLowerCase().includes('course')) {
                    personaData = {
                        name: 'Curious Chloe',
                        age: 24,
                        occupation: 'University Student',
                        goals: [
                            'Master new skills for her future career.',
                            'Efficiently manage study materials and assignments.',
                            'Collaborate with peers on group projects.'
                        ],
                        frustrations: [
                            'Difficulty staying organized with multiple courses.',
                            'Finding reliable and up-to-date learning resources.',
                            'Procrastination and lack of motivation.'
                        ],
                        bio: 'Chloe is an ambitious university student pursuing a degree in computer science. She is eager to learn and grow, but often feels overwhelmed by the sheer volume of information and tasks. She needs tools that can help her streamline her study process, discover relevant learning paths, and connect with other students to enhance her educational journey.'
                    };
                }
                else {
                    // Default persona if no keywords match
                    personaData = {
                        name: 'Innovator Ivy',
                        age: 35,
                        occupation: 'Product Manager',
                        goals: [
                            'Understand user needs deeply.',
                            'Streamline product development cycles.',
                            'Validate new features quickly.'
                        ],
                        frustrations: [
                            'Lack of clear user insights.',
                            'Difficulty prioritizing features.',
                            'Teams not aligning on user problems.'
                        ],
                        bio: 'Ivy is a forward-thinking product manager always on the lookout for tools that provide actionable insights into her user base. She thrives on data-driven decisions and aims to create products that genuinely solve user problems. She values efficiency and clarity, seeking to bridge the gap between user needs and product strategy.'
                    };
                }
                resolve(personaData);
            }, 1500); // Simulate API call delay
        });
    }

    function displayPersona(persona) {
        personaOutput.innerHTML = `
            <p><strong>Name:</strong> ${persona.name}</p>
            <p><strong>Age:</strong> ${persona.age}</p>
            <p><strong>Occupation:</strong> ${persona.occupation}</p>
            <p><strong>Bio:</strong> ${persona.bio}</p>
            <p><strong>Goals:</strong></p>
            <ul>
                ${persona.goals.map(goal => `<li>${goal}</li>`).join('')}
            </ul>
            <p><strong>Frustrations:</strong></p>
            <ul>
                ${persona.frustrations.map(frustration => `<li>${frustration}</li>`).join('')}
            </ul>
        `;
    }
});
