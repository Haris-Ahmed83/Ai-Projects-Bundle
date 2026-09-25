document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const htmlInput = document.getElementById('htmlInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultsDiv = document.getElementById('resultsDiv');

    analyzeBtn.addEventListener('click', analyzeAccessibility);

    function analyzeAccessibility() {
        const url = urlInput.value.trim();
        const html = htmlInput.value.trim();

        if (!url && !html) {
            resultsDiv.innerHTML = '<p class="issue-item"><span class="issue-type error">Error</span><span class="issue-details"><span class="issue-description">Please provide either a URL or paste HTML content to analyze.</span></span></p>';
            return;
        }

        resultsDiv.innerHTML = '<p style="text-align: center;">Analyzing... Please wait.</p>';

        // Simulate API call or AI processing
        setTimeout(() => {
            let analysisContent = html;
            if (url && !html) {
                // In a real scenario, you'd fetch the HTML from the URL here.
                // For this client-side demo, we'll just simulate with a generic page structure.
                analysisContent = `<!-- Simulated content for URL: ${url} -->\n` +
                                  `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Simulated Page Title</title></head><body><h1>Welcome to ${url}</h1><img src="/images/banner.jpg" alt="A beautiful banner"><p>Some content here.</p><button>Click Me</button></body></html>`;
                resultsDiv.innerHTML = '<p style="text-align: center;">Analyzing content from URL (simulated fetch)...</p>';
            } else if (url && html) {
                // If both are provided, prioritize explicit HTML content for analysis
                resultsDiv.innerHTML = '<p style="text-align: center;">URL provided, but using pasted HTML content for analysis...</p>';
            }

            const issues = simulateAIAudit(analysisContent);
            displayResults(issues);
        }, 1500); // Simulate network latency/processing time
    }

    /**
     * Simulates an AI audit for common accessibility issues based on provided HTML content.
     * In a real application, this would involve more sophisticated parsing (DOM parser),
     * AI/NLP models, and potentially external API integrations.
     * @param {string} content - The HTML content to analyze.
     * @returns {Array<Object>} An array of detected accessibility issues.
     */
    function simulateAIAudit(content) {
        const issues = [];

        // --- Critical Checks --- (WCAG A/AA Level)

        // 1. Missing `<html>` lang attribute
        if (!/<html[^>]*lang\s*=\s*['\"][^'\"]*['\"]/i.test(content)) {
            issues.push({
                type: 'error',
                description: 'Missing <code>lang</code> attribute on <code>&lt;html&gt;</code> tag.',
                suggestion: 'Add <code>lang="en"</code> or appropriate language code to the <code>&lt;html&gt;</code> tag for screen reader pronunciation.'
            });
        }

        // 2. Missing `<title>` tag
        if (!/<title>.*?<\/title>/i.test(content)) {
            issues.push({
                type: 'error',
                description: 'Missing or empty <code>&lt;title&gt;</code> tag in <code>&lt;head&gt;</code>.',
                suggestion: 'Add a descriptive <code>&lt;title&gt;</code> tag for browser tabs and search engines.'
            });
        }

        // 3. Images without `alt` attribute (or empty alt for non-decorative)
        const imgTags = content.match(/<img[^>]*>/gi) || [];
        imgTags.forEach(imgTag => {
            if (!/alt\s*=\s*['\"][^'\"]*['\"]/i.test(imgTag)) {
                issues.push({
                    type: 'error',
                    description: `Image missing 'alt' attribute: <code>${escapeHtml(imgTag)}</code>`,
                    suggestion: 'Provide a descriptive `alt` text for screen readers, or `alt=""` for decorative images.'
                });
            } else if (/alt\s*=\s*['\"]\s*['\"]/i.test(imgTag) && !/(aria-hidden\s*=\s*['\"]true['\"])/i.test(imgTag)) {
                 // Check for empty alt but not explicitly hidden or decorative
                 issues.push({
                    type: 'warning',
                    description: `Image has an empty 'alt' attribute, consider if it's truly decorative: <code>${escapeHtml(imgTag)}</code>`,
                    suggestion: 'If decorative, ensure `alt=""`. If it conveys information, add descriptive text. For complex images, consider `aria-describedby`.'
                });
            }
        });

        // 4. Input fields without associated labels
        const inputTags = content.match(/<input[^>]*>/gi) || [];
        inputTags.forEach(inputTag => {
            const typeMatch = inputTag.match(/type\s*=\s*['\"]([^'\"]+)['\"]/i);
            const inputType = typeMatch ? typeMatch[1].toLowerCase() : 'text'; // Default to text if type is missing

            // Exclude button-like inputs (submit, reset, button, image) and hidden inputs
            if (!['hidden', 'submit', 'reset', 'button', 'image'].includes(inputType)) {
                const idMatch = inputTag.match(/id\s*=\s*['\"]([^'\"]+)['\"]/i);
                const inputId = idMatch ? idMatch[1] : null;

                // Check for `for` attribute on a label referencing the input's ID
                if (inputId && !new RegExp(`<label[^>]*for\s*=\s*['\"]${inputId}['\"]`, 'i').test(content)) {
                    issues.push({
                        type: 'error',
                        description: `Input field with ID "${inputId}" is missing an explicit <code>&lt;label for="..."&gt;</code> association: <code>${escapeHtml(inputTag)}</code>`,
                        suggestion: `Associate a <code>&lt;label&gt;</code> with this input using the 'for' attribute matching the input's 'id'.`
                    });
                } else if (!inputId && !/<label[^>]*>.*?<input[^>]*>.*?<\/label>/i.test(content)) { 
                    // Basic check if input is wrapped in a label if no id is present
                    issues.push({
                        type: 'warning',
                        description: `Input field found without 'id' or explicit <code>&lt;label&gt;</code> association: <code>${escapeHtml(inputTag)}</code>`,
                        suggestion: 'Ensure all form inputs have an associated <code>&lt;label&gt;</code>, either by `for`/`id` or by wrapping the input.'
                    });
                }
            }
        });

        // --- Important Checks --- (WCAG AA Level)

        // 5. Headings structure (basic: check for h1 presence and sequential use)
        if (!/<h1[^>]*>.*?<\/h1>/i.test(content)) {
            issues.push({
                type: 'warning',
                description: 'No <code>&lt;h1&gt;</code> heading found on the page.',
                suggestion: 'Ensure your page has a single <code>&lt;h1&gt;</code> as the main heading, providing a clear document outline.'
            });
        }
        // Basic check for skipping heading levels (e.g., h1 then h3 without h2)
        const headingLevels = (content.match(/<h([1-6])[^>]*>.*?<\/h\1>/gi) || []).map(h => parseInt(h.match(/<h([1-6])/i)[1]));
        if (headingLevels.length > 0) {
            let maxLevel = 0;
            for (let i = 0; i < headingLevels.length; i++) {
                if (headingLevels[i] > maxLevel + 1 && maxLevel !== 0) {
                    issues.push({
                        type: 'warning',
                        description: `Heading level skipped (e.g., found <code>&lt;h${headingLevels[i]}&gt;</code> after <code>&lt;h${maxLevel}&gt;</code> without <code>&lt;h${maxLevel + 1}&gt;</code>).`,
                        suggestion: 'Maintain a logical heading structure; do not skip heading levels (e.g., H1 -> H3).'
                    });
                    break;
                }
                if (headingLevels[i] > maxLevel) maxLevel = headingLevels[i];
            }
        }

        // 6. Buttons/Links without discernable text/aria-label/title
        const interactiveElements = content.match(/(<a[^>]*>.*?<\/a>)|(<button[^>]*>.*?<\/button>)/gi) || [];
        interactiveElements.forEach(el => {
            const textContent = el.replace(/<[^>]*>/g, '').trim();
            const ariaLabel = el.match(/aria-label\s*=\s*['\"]([^'\"]+)['\"]/i);
            const titleAttr = el.match(/title\s*=\s*['\"]([^'\"]+)['\"]/i);

            if (!textContent && !ariaLabel && !titleAttr) {
                issues.push({
                    type: 'warning',
                    description: `Interactive element (link/button) has no discernable text, aria-label, or title attribute: <code>${escapeHtml(el)}</code>`,
                    suggestion: 'Provide meaningful text content, an `aria-label`, or a `title` attribute for accessibility.'
                });
            }
        });

        // 7. ARIA roles used incorrectly (very basic check, just for presence of tabindex with role=button on div)
        if (/<div[^>]*role\s*=\s*['\"]button['\"]/i.test(content) && !/<div[^>]*tabindex/i.test(content)) {
             issues.push({
                type: 'warning',
                description: '<code>&lt;div role="button"&gt;</code> found without a <code>tabindex</code> attribute.',
                suggestion: 'When using ARIA roles to simulate native elements, ensure full keyboard interactivity (e.g., `tabindex="0"` and JavaScript event handlers for `click` and `keydown` for `Enter`/`Space`). Prefer native `<button>` elements.'
            });
        }

        // --- General Advice / Simulated NLP/API Integration --- (Info Level)

        issues.push({
            type: 'info',
            description: 'This is a simulated AI analysis. Real AI/API integration would perform deeper checks.',
            suggestion: 'Consider integrating with actual accessibility APIs (e.g., Axe-core, Lighthouse programmatically) for comprehensive audits.'
        });
        issues.push({
            type: 'info',
            description: 'Ensure sufficient color contrast for text and interactive elements.',
            suggestion: 'Use tools to check color contrast ratios (e.g., WCAG guidelines). Minimum contrast ratio for normal text is 4.5:1.'
        });
        issues.push({
            type: 'info',
            description: 'Keyboard navigation is crucial for users who cannot use a mouse.',
            suggestion: 'Verify all interactive elements are reachable and operable using only the keyboard (`Tab`, `Shift+Tab`, `Enter`, `Space`). Ensure a visible focus indicator.'
        });
        issues.push({
            type: 'info',
            description: 'Semantic HTML provides inherent accessibility.',
            suggestion: 'Use semantic HTML5 elements (e.g., `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`, `<article>`, `<section>`) instead of generic `<div>`s where appropriate.'
        });

        if (issues.length === 0) {
            issues.push({
                type: 'info',
                description: 'No common accessibility issues found by this basic simulated audit.',
                suggestion: 'This is a preliminary check. Continue with manual testing and advanced tools for a complete accessibility review.'
            });
        }

        return issues;
    }

    /**
     * Displays the accessibility audit results in the `resultsDiv`.
     * @param {Array<Object>} issues - An array of issue objects to display.
     */
    function displayResults(issues) {
        if (issues.length === 0) {
            resultsDiv.innerHTML = '<p style="text-align: center;">No accessibility issues found by this basic analysis!</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.classList.add('issue-list');

        issues.forEach(issue => {
            const li = document.createElement('li');
            li.classList.add('issue-item');

            const typeSpan = document.createElement('span');
            typeSpan.classList.add('issue-type', issue.type);
            typeSpan.textContent = issue.type;

            const detailsDiv = document.createElement('div');
            detailsDiv.classList.add('issue-details');

            const descriptionP = document.createElement('p');
            descriptionP.classList.add('issue-description');
            description
