document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('post-generator-form');
    const topicInput = document.getElementById('topic');
    const audienceInput = document.getElementById('audience');
    const toneSelect = document.getElementById('tone');
    const generateButton = document.getElementById('generate-button');
    const loadingIndicator = document.getElementById('loading-indicator');
    const resultsSection = document.getElementById('results-section');
    const postOptionsContainer = document.getElementById('post-options-container');

    // Simulated AI/NLG logic
    const generatePostOptions = (topic, audience, tone) => {
        const posts = [];
        const baseHashtags = ["#SocialMediaTips", "#ContentMarketing", "#DigitalStrategy", "#MarketingTips"];
        const topicHashtags = topic.toLowerCase().split(' ').filter(word => word.length > 2 && !['the', 'of', 'and', 'for', 'to', 'in'].includes(word))
                                .map(word => `#${word.replace(/[^a-zA-Z0-9]/g, '')}`);

        const tonesConfig = {
            "Professional": {
                starters: [
                    "Unlock the potential of your brand with these insights on",
                    "Elevate your strategy. We're diving deep into the world of",
                    "Maximize engagement and achieve your goals by focusing on"
                ],
                emojis: ["📊", "📈", "💡", "💼"],
                suffix: "Discover how to achieve measurable success! #BusinessGrowth",
                hashtags: ["#ProfessionalMarketing", "#Strategy", "#Innovation"]
            },
            "Casual": {
                starters: [
                    "Hey everyone! Let's chat about",
                    "Quick tip for ya: mastering",
                    "Ever wondered how to make "
                ],
                emojis: ["👋", "✨", "😊", "👍"],
                suffix: "It's easier than you think! Join the conversation. #Community",
                hashtags: ["#DailyTips", "#FunFacts", "#Lifestyle"]
            },
            "Humorous": {
                starters: [
                    "Warning: May cause excessive scrolling! We're talking about",
                    "Why did the social media post cross the road? To get to the other side of your feed! Speaking of,",
                    "Don't be that person who misses out on the fun around"
                ],
                emojis: ["😂", "🤪", "🤣", "🥳"],
                suffix: "Get ready for some laughs and learning! You won't regret it. #FunnyMarketing",
                hashtags: ["#Humor", "#LaughAndLearn", "#ViralContent"]
            },
            "Inspirational": {
                starters: [
                    "Inspire your audience and transform your approach to",
                    "Dream big, post bigger! Let's explore the power of",
                    "Your journey starts now. Discover the magic of"
                ],
                emojis: ["✨", "🚀", "🌟", "💖"],
                suffix: "Unleash your creativity and make an impact! Believe in yourself. #Motivation",
                hashtags: ["#Inspiration", "#SuccessMindset", "#Empowerment"]
            },
            "Educational": {
                starters: [
                    "Dive deep into the fundamentals of",
                    "Learn everything you need to know about",
                    "Master the concepts behind"
                ],
                emojis: ["📚", "🧠", "🎓", "🔍"],
                suffix: "Expand your knowledge and sharpen your skills. #KnowledgeIsPower",
                hashtags: ["#Learning", "#Education", "#FactCheck", "#Skills"]
            }
        };

        const selectedTone = tonesConfig[tone] || tonesConfig["Professional"];

        for (let i = 0; i < 3; i++) { // Generate 3 post options
            const starter = selectedTone.starters[Math.floor(Math.random() * selectedTone.starters.length)];
            const emoji1 = selectedTone.emojis[Math.floor(Math.random() * selectedTone.emojis.length)];
            const emoji2 = selectedTone.emojis[Math.floor(Math.random() * selectedTone.emojis.length)];

            let postText = `${starter} ${topic}. ${selectedTone.suffix}`;
            let postHashtags = [...new Set([...baseHashtags, ...topicHashtags, ...selectedTone.hashtags])];
            let postEmojis = `${emoji1} ${emoji2}`;

            // Add some variation for audience
            if (audience.toLowerCase().includes("young") || audience.toLowerCase().includes("gen z")) {
                postText = postText.replace("Discover how to achieve measurable success!", "Learn how to slay your social game! 🚀");
                postHashtags.push("#GenZMarketing");
                postEmojis += "🔥";
            } else if (audience.toLowerCase().includes("small business")) {
                postText = postText.replace("Maximize engagement and achieve your goals", "Boost your local presence and attract more customers");
                postHashtags.push("#SmallBiz");
                postEmojis += "💰";
            } else if (audience.toLowerCase().includes("new parents")) {
                postText = postText.replace("Unlock the potential of your brand", "Navigate the joys and challenges of parenthood");
                postHashtags.push("#ParentingLife");
                postEmojis += "🍼👶";
            }

            // Ensure max 6 unique hashtags
            postHashtags = postHashtags.slice(0, 6);

            posts.push({
                text: postText,
                hashtags: postHashtags.join(' '),
                emojis: postEmojis
            });
        }

        return posts;
    };

    const displayPosts = (posts) => {
        postOptionsContainer.innerHTML = ''; // Clear previous results
        posts.forEach((post, index) => {
            const postCard = document.createElement('div');
            postCard.classList.add('post-card');
            postCard.innerHTML = `
                <p>${post.text}</p>
                <p class="hashtags">${post.hashtags}</p>
                <p class="emojis">${post.emojis}</p>
                <button class="copy-button" data-index="${index}">Copy Post</button>
            `;
            postOptionsContainer.appendChild(postCard);
        });

        // Add event listeners for copy buttons
        document.querySelectorAll('.copy-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const index = event.target.dataset.index;
                const postToCopy = posts[index];
                const fullText = `${postToCopy.text}\n\n${postToCopy.hashtags} ${postToCopy.emojis}`;
                navigator.clipboard.writeText(fullText).then(() => {
                    event.target.textContent = 'Copied!';
                    setTimeout(() => {
                        event.target.textContent = 'Copy Post';
                    }, 1500);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                    alert('Failed to copy post. Please try again.');
                });
            });
        });
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const topic = topicInput.value.trim();
        const audience = audienceInput.value.trim();
        const tone = toneSelect.value;

        if (!topic || !audience || !tone) {
            alert('Please fill in all fields.');
            return;
        }

        // Show loading indicator, hide results
        loadingIndicator.classList.remove('hidden');
        resultsSection.classList.add('hidden');
        postOptionsContainer.innerHTML = '';
        generateButton.disabled = true;

        // Simulate API call delay
        setTimeout(() => {
            const generatedPosts = generatePostOptions(topic, audience, tone);
            displayPosts(generatedPosts);

            // Hide loading indicator, show results
            loadingIndicator.classList.add('hidden');
            resultsSection.classList.remove('hidden');
            generateButton.disabled = false;
        }, 2000); // 2-second delay
    });
});
