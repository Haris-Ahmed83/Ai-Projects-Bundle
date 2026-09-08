document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const paraphraseButton = document.getElementById('paraphraseButton');
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');

    // Simulate advanced NLP model for paraphrasing
    function simulateParaphrase(originalText) {
        const versions = [];

        // Basic synonym map for varied transformations
        const synonyms = {
            "is": ["is", "serves as", "functions as"],
            "are": ["are", "represent", "constitute"],
            "very": ["exceedingly", "remarkably", "exceptionally", "highly"],
            "good": ["excellent", "superb", "satisfactory", "positive"],
            "bad": ["poor", "terrible", "unsatisfactory", "negative"],
            "important": ["crucial", "significant", "vital", "essential"],
            "can": ["has the ability to", "is capable of", "may"],
            "make": ["create", "generate", "produce", "formulate"],
            "have": ["possess", "own", "experience", "feature"],
            "get": ["obtain", "acquire", "receive"],
            "show": ["demonstrate", "illustrate", "reveal"],
            "use": ["utilize", "employ", "apply"],
            "help": ["assist", "aid", "facilitate"]
        };

        // Helper to apply replacements (case-insensitive, whole word)
        const applyReplacements = (text, map) => {
            let newText = text;
            for (const word in map) {
                const replacements = map[word];
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                newText = newText.replace(regex, (match) => {
                    const chosen = replacements[Math.floor(Math.random() * replacements.length)];
                    // Attempt to preserve original casing for the first letter
                    if (match.charAt(0) === match.charAt(0).toUpperCase()) {
                        return chosen.charAt(0).toUpperCase() + chosen.slice(1);
                    }
                    return chosen;
                });
            }
            return newText;
        };

        // Version 1: Standard Rephrasing (minor word swaps, slight structural changes)
        let v1 = originalText;
        v1 = applyReplacements(v1, {
            ...synonyms,
            "a": ["a", "one of the"],
            "the": ["the", "this specific"],
            "and": ["and", "in addition to"]
        });
        // Simple sentence reordering simulation (very basic, just swaps adjacent sentences)
        let sentencesV1 = v1.match(/[^.!?]+[.!?]/g) || [v1];
        if (sentencesV1.length > 1) {
            const idx1 = Math.floor(Math.random() * sentencesV1.length);
            let idx2 = (idx1 + 1) % sentencesV1.length;
            // Swap if they are different
            if (idx1 !== idx2) {
                [sentencesV1[idx1], sentencesV1[idx2]] = [sentencesV1[idx2], sentencesV1[idx1]];
            }
        }
        versions.push({
            title: "Standard Rephrasing",
            text: sentencesV1.join(' ').replace(/\s+/g, ' ').trim()
        });

        // Version 2: Formal & Elaborated (more complex vocabulary, expansive phrasing)
        let v2 = originalText;
        v2 = applyReplacements(v2, {
            ...synonyms,
            "is": ["functions as", "operates as", "is recognized as"],
            "can": ["possesses the capacity to", "is enabled to", "is capable of"],
            "get": ["acquire", "obtain", "procure"],
            "make": ["formulate", "construct", "engineer"],
            "important": ["paramount", "pivotal", "indispensable"],
            "good": ["exemplary", "commendable", "meritorious"],
            "bad": ["detrimental", "unfavorable", "deleterious"],
            "very": ["exceedingly", "profoundly", "considerably"],
            "we": ["one", "individuals", "the organization"],
            "you": ["users", "the individual", "clients"],
            "it is": ["it is imperative that", "it is essential to acknowledge that"]
        });
        // Add some formal linking phrases
        v2 = v2.replace(/(\.\s)/g, '. Furthermore, ');
        v2 = v2.replace(/(\?\s)/g, '? In this regard, ');
        versions.push({
            title: "Formal & Elaborated",
            text: v2.replace(/\s+/g, ' ').trim()
        });

        // Version 3: Concise & Simplified (removes fluff, direct language)
        let v3 = originalText;
        v3 = applyReplacements(v3, {
            ...synonyms,
            "is": ["is"], // Keep simple
            "can": ["can"], // Keep simple
            "very": [""], // Try to remove 'very' for conciseness
            "important": ["key", "crucial"],
            "good": ["good"],
            "bad": ["bad"],
            "have": ["have"],
            "get": ["get"],
            "we": ["we"],
            "you": ["you"],
            "it is essential to recognize that": ["it's essential that"],
            "in consideration of this": ["thus"],
            "possesses the capacity to": ["can"],
            "operates as": ["is"],
            "functions as": ["is"]
        });
        // Attempt to remove common filler words/phrases more aggressively
        v3 = v3.replace(/\b(that|which|really|just|in order to|due to the fact that|the fact that|it is important to note that)\b/gi, '')
                 .replace(/\s+/g, ' ').trim();
        versions.push({
            title: "Concise & Simplified",
            text: v3
        });

        return versions;
    }

    paraphraseButton.addEventListener('click', () => {
        const text = inputText.value.trim();

        if (text.length === 0) {
            alert('Please enter some text to paraphrase.');
            return;
        }

        // Show loading state
        paraphraseButton.disabled = true;
        paraphraseButton.textContent = 'Paraphrasing...';
        resultsDiv.innerHTML = ''; // Clear previous results
        loadingDiv.classList.remove('hidden');

        // Simulate API call delay
        setTimeout(() => {
            const paraphrasedVersions = simulateParaphrase(text);

            loadingDiv.classList.add('hidden');
            paraphraseButton.disabled = false;
            paraphraseButton.textContent = 'Paraphrase Text';

            if (paraphrasedVersions.length === 0 || paraphrasedVersions[0].text.length === 0) {
                resultsDiv.innerHTML = '<p class="placeholder-text">Could not paraphrase the given text. Please try a different input.</p>';
            } else {
                paraphrasedVersions.forEach(version => {
                    const card = document.createElement('div');
                    card.classList.add('result-card');
                    card.innerHTML = `<h3>${version.title}</h3><p>${version.text}</p>`;
                    resultsDiv.appendChild(card);
                });
            }

        }, 1500); // Simulate 1.5 seconds of processing time
    });

    // Example initial text
    inputText.value = "The quick brown fox jumps over the lazy dog. It is a very important concept for demonstrating typography and computing capabilities.";
});
