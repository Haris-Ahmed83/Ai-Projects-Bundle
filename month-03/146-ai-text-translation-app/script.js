document.addEventListener('DOMContentLoaded', () => {
    const inputTextarea = document.getElementById('inputText');
    const outputTextarea = document.getElementById('outputText');
    const sourceLangSelect = document.getElementById('sourceLang');
    const targetLangSelect = document.getElementById('targetLang');
    const translateBtn = document.getElementById('translateBtn');

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'ja', name: 'Japanese' },
        { code: 'zh', name: 'Chinese (Simplified)' },
        { code: 'ru', name: 'Russian' },
        { code: 'ar', name: 'Arabic' }
    ];

    // Populate language dropdowns
    function populateLanguages() {
        languages.forEach(lang => {
            const option1 = document.createElement('option');
            option1.value = lang.code;
            option1.textContent = lang.name;
            sourceLangSelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = lang.code;
            option2.textContent = lang.name;
            targetLangSelect.appendChild(option2);
        });

        // Set default selections
        sourceLangSelect.value = 'en';
        targetLangSelect.value = 'es';
    }

    // Simple mock translation logic
    // In a real app, this would be an API call to an AI translation service
    const mockTranslations = {
        'en-es': {
            'hello': 'hola',
            'world': 'mundo',
            'how are you': '¿cómo estás?',
            'ai': 'inteligencia artificial',
            'machine learning': 'aprendizaje automático',
            'language': 'idioma',
            'translation': 'traducción',
            'this is a test': 'esto es una prueba',
            'goodbye': 'adiós'
        },
        'es-en': {
            'hola': 'hello',
            'mundo': 'world',
            '¿cómo estás?': 'how are you?',
            'inteligencia artificial': 'ai',
            'aprendizaje automático': 'machine learning',
            'idioma': 'language',
            'traducción': 'translation',
            'esto es una prueba': 'this is a test',
            'adiós': 'goodbye'
        },
        'en-fr': {
            'hello': 'bonjour',
            'world': 'monde',
            'how are you': 'comment allez-vous?',
            'ai': 'IA',
            'machine learning': 'apprentissage automatique'
        },
        'fr-en': {
            'bonjour': 'hello',
            'monde': 'world',
            'comment allez-vous?': 'how are you?',
            'IA': 'ai',
            'apprentissage automatique': 'machine learning'
        },
        'en-de': {
            'hello': 'hallo',
            'world': 'welt',
            'how are you': 'wie geht es dir?'
        },
        'de-en': {
            'hallo': 'hello',
            'welt': 'world',
            'wie geht es dir?': 'how are you?'
        }
        // Add more mock translations as needed for other language pairs.
        // For demonstration, not all pairs will have specific translations.
    };

    async function translateText(text, sourceLang, targetLang) {
        // Simulate API call delay to mimic network latency for a real AI service
        await new Promise(resolve => setTimeout(resolve, 1200));

        const lowerCaseText = text.toLowerCase().trim();
        const translationKey = `${sourceLang}-${targetLang}`;

        // Check for specific mock translations first
        if (mockTranslations[translationKey] && mockTranslations[translationKey][lowerCaseText]) {
            return mockTranslations[translationKey][lowerCaseText];
        }

        // If source and target languages are the same, no translation needed
        if (sourceLang === targetLang) {
            return text;
        }

        // A very basic "AI-like" transformation for demonstration purposes.
        // In a real AI translation service, a complex machine learning model would generate this.
        // Here, we just indicate a translation attempt for unknown phrases.
        if (text.length > 0) {
            return `[AI Translated from ${sourceLang.toUpperCase()} to ${targetLang.toUpperCase()}: "${text}"]`;
        }
        return `[AI Translation could not process empty text]`;
    }

    async function handleTranslate() {
        const inputText = inputTextarea.value.trim();
        const sourceLang = sourceLangSelect.value;
        const targetLang = targetLangSelect.value;

        if (!inputText) {
            outputTextarea.value = 'Please enter text to translate.';
            return;
        }

        translateBtn.disabled = true;
        translateBtn.textContent = 'Translating...';
        outputTextarea.value = ''; // Clear previous output
        outputTextarea.placeholder = 'Translating...'; // Show translating message

        try {
            const translatedText = await translateText(inputText, sourceLang, targetLang);
            outputTextarea.value = translatedText;
        } catch (error) {
            console.error('Translation failed:', error);
            outputTextarea.value = 'Translation failed. Please try again.';
        } finally {
            translateBtn.disabled = false;
            translateBtn.textContent = 'Translate';
            outputTextarea.placeholder = 'Translated text will appear here...'; // Reset placeholder
        }
    }

    // Event Listeners
    translateBtn.addEventListener('click', handleTranslate);

    // Initial setup
    populateLanguages();
});
