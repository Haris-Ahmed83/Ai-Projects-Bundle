document.addEventListener('DOMContentLoaded', () => {
    const reviewInput = document.getElementById('reviewInput');
    const summarizeBtn = document.getElementById('summarizeBtn');
    const summaryOutput = document.getElementById('summaryOutput').querySelector('p');
    const prosOutput = document.getElementById('prosOutput').querySelector('ul');
    const consOutput = document.getElementById('consOutput').querySelector('ul');
    const sentimentOutput = document.getElementById('sentimentOutput').querySelector('p');
    const loadingIndicator = document.getElementById('loading');

    summarizeBtn.addEventListener('click', () => {
        const reviewsText = reviewInput.value.trim();
        if (!reviewsText) {
            alert('Please enter some product reviews to summarize.');
            return;
        }

        loadingIndicator.classList.remove('hidden');
        summarizeBtn.disabled = true;
        summaryOutput.textContent = 'Generating summary...';
        prosOutput.innerHTML = '<li>Analyzing pros...</li>';
        consOutput.innerHTML = '<li>Analyzing cons...</li>';
        sentimentOutput.textContent = 'Determining sentiment...';

        // Simulate an API call with a delay
        setTimeout(() => {
            // Split reviews by new lines or a specific separator like '---'
            const reviews = reviewsText.split(/\n\s*---\s*\n|\n\n|\r\n\r\n/).filter(line => line.trim() !== ''); 
            
            const { summary, pros, cons, sentiment } = analyzeReviews(reviews);

            summaryOutput.textContent = summary;

            prosOutput.innerHTML = '';
            if (pros.length > 0) {
                pros.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    prosOutput.appendChild(li);
                });
            } else {
                prosOutput.innerHTML = '<li>No significant pros identified.</li>';
            }

            consOutput.innerHTML = '';
            if (cons.length > 0) {
                cons.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    consOutput.appendChild(li);
                });
            } else {
                consOutput.innerHTML = '<li>No significant cons identified.</li>';
            }

            sentimentOutput.textContent = sentiment;

            loadingIndicator.classList.add('hidden');
            summarizeBtn.disabled = false;
        }, 1500); // Simulate network delay of 1.5 seconds
    });

    function analyzeReviews(reviews) {
        let allText = reviews.join(' ').toLowerCase();

        // --- Sentiment Analysis (Simulated) ---
        const positiveKeywords = ['amazing', 'excellent', 'great', 'love', 'fantastic', 'superb', 'good', 'happy', 'recommend', 'fast', 'easy', 'reliable', 'durable', 'efficient', 'perfect', 'smooth', 'responsive', 'user-friendly', 'high quality', 'well-built', 'affordable'];
        const negativeKeywords = ['terrible', 'bad', 'poor', 'hate', 'disappointing', 'awful', 'slow', 'difficult', 'unreliable', 'fragile', 'expensive', 'buggy', 'broke', 'laggy', 'confusing', 'low quality', 'flimsy', 'overpriced'];
        
        const proPhrases = {
            'Battery Life': ['excellent battery life', 'long battery', 'great battery', 'good battery'],
            'Performance': ['super fast', 'smooth performance', 'works quickly', 'very responsive', 'fast performance'],
            'Ease of Use': ['easy to use', 'user-friendly', 'simple setup', 'intuitive interface'],
            'Design': ['nice design', 'sleek look', 'attractive design', 'modern design'],
            'Value for Money': ['good value', 'worth the price', 'affordable', 'great price'],
            'Quality/Durability': ['high quality', 'well-built', 'durable', 'sturdy'],
            'Reliability': ['reliable', 'never fails', 'always works']
        };
        const conPhrases = {
            'Battery Life': ['poor battery life', 'short battery', 'drains fast', 'bad battery'],
            'Performance': ['very slow', 'laggy', 'not responsive', 'slow performance'],
            'Ease of Use': ['difficult to use', 'confusing interface', 'complicated setup', 'not user-friendly'],
            'Design': ['ugly design', 'bulky', 'cheap looking', 'poor design'],
            'Value for Money': ['too expensive', 'not worth the price', 'overpriced'],
            'Quality/Durability': ['low quality', 'flimsy', 'broke easily', 'not durable'],
            'Reliability': ['unreliable', 'fails often', 'buggy']
        };

        let positiveScore = 0;
        let negativeScore = 0;

        positiveKeywords.forEach(keyword => {
            positiveScore += (allText.split(keyword).length - 1); // Count occurrences
        });
        negativeKeywords.forEach(keyword => {
            negativeScore += (allText.split(keyword).length - 1);
        });

        let sentiment = 'Neutral';
        if (positiveScore > negativeScore * 1.5) { // Positive significantly more than negative
            sentiment = 'Positive';
        } else if (negativeScore > positiveScore * 1.5) { // Negative significantly more than positive
            sentiment = 'Negative';
        } else if (positiveScore > 0 || negativeScore > 0) {
            sentiment = 'Mixed';
        }

        // --- Pros and Cons Extraction (Simulated) ---
        let identifiedPros = new Set();
        let identifiedCons = new Set();

        for (const [category, phrases] of Object.entries(proPhrases)) {
            if (phrases.some(phrase => allText.includes(phrase))) {
                identifiedPros.add(category);
            }
        }

        for (const [category, phrases] of Object.entries(conPhrases)) {
            if (phrases.some(phrase => allText.includes(phrase))) {
                identifiedCons.add(category);
            }
        }
        
        // Add general keywords as pros/cons if specific categories aren't hit but sentiment implies them
        if (sentiment === 'Positive' && identifiedPros.size === 0) identifiedPros.add('Overall Satisfaction');
        if (sentiment === 'Negative' && identifiedCons.size === 0) identifiedCons.add('Overall Dissatisfaction');
        
        // --- Summary Generation (Simulated) ---
        let generatedSummary = "Based on the provided reviews, the product ";
        if (sentiment === 'Positive') {
            generatedSummary += "is generally well-received and highly regarded. ";
        } else if (sentiment === 'Negative') {
            generatedSummary += "receives predominantly negative feedback, with significant concerns highlighted. ";
        } else {
            generatedSummary += "has a mixed reception, with both positive and negative points emerging. ";
        }

        const allFeaturesDiscussed = new Set();
        [...Object.keys(proPhrases), ...Object.keys(conPhrases)].forEach(feature => {
            // Check if any part of the feature name or its associated phrases are in the text
            const featureInText = feature.toLowerCase().split(' ').some(word => allText.includes(word)) ||
                                 proPhrases[feature]?.some(phrase => allText.includes(phrase)) ||
                                 conPhrases[feature]?.some(phrase => allText.includes(phrase));
            if (featureInText) {
                allFeaturesDiscussed.add(feature.toLowerCase());
            }
        });

        const prosArray = Array.from(identifiedPros);
        const consArray = Array.from(identifiedCons);

        if (prosArray.length > 0 && consArray.length === 0) {
            generatedSummary += `Users particularly praise its ${prosArray.join(', ').toLowerCase()}.`;
        } else if (consArray.length > 0 && prosArray.length === 0) {
            generatedSummary += `However, significant concerns are raised regarding its ${consArray.join(', ').toLowerCase()}.`;
        } else if (prosArray.length > 0 && consArray.length > 0) {
            generatedSummary += `Key strengths include ${prosArray.join(', ').toLowerCase()}, while areas of concern are ${consArray.join(', ').toLowerCase()}.`;
        } else if (allFeaturesDiscussed.size > 0) {
             generatedSummary += `Reviews frequently mention aspects such as ${Array.from(allFeaturesDiscussed).join(', ').toLowerCase()}.`;
        } else {
            generatedSummary += "Specific details are varied, but a general sentiment is noted.";
        }
        
        // Fallback for very short or generic reviews
        if (reviews.length > 0 && generatedSummary.length < 100) {
            const firstReviewSnippet = reviews[0].substring(0, Math.min(reviews[0].length, 80)).trim();
            generatedSummary = `A general analysis of ${reviews.length} review(s) indicates that: "${firstReviewSnippet}${firstReviewSnippet.length < reviews[0].length ? '...' : ''}" and other points are discussed.`;
        }

        return {
            summary: generatedSummary,
            pros: prosArray,
            cons: consArray,
            sentiment: sentiment
        };
    }
});
