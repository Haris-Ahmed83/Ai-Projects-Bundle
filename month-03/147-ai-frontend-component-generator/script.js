document.addEventListener('DOMContentLoaded', () => {
    const descriptionInput = document.getElementById('componentDescription');
    const generateBtn = document.getElementById('generateBtn');
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    const tabButtons = document.querySelectorAll('.tab-button');
    const htmlCodeBlock = document.querySelector('#htmlContent code');
    const cssCodeBlock = document.querySelector('#cssContent code');
    const jsCodeBlock = document.querySelector('#jsContent code');
    const previewContent = document.getElementById('previewContent');

    let currentGeneratedHTML = '';
    let currentGeneratedCSS = '';
    let currentGeneratedJS = '';

    // Function to escape HTML for display in <pre> tags
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    // Function to simulate AI code generation
    function generateComponent(description) {
        description = description.toLowerCase();
        let html = '';
        let css = '';
        let js = '';

        if (description.includes('navigation bar') || description.includes('nav') || description.includes('menu')) {
            html = `<nav class="navbar">
    <a href="#">Home</a>
    <a href="#">About</a>
    <a href="#">Services</a>
    <a href="#">Contact</a>
    ${description.includes('dark mode') ? '<button class="dark-mode-toggle">Toggle Dark</button>' : ''}
</nav>`;
            css = `.navbar {
    display: flex;
    justify-content: space-around;
    align-items: center;
    background-color: #333;
    padding: 1rem;
    color: white;
    font-family: sans-serif;
}

.navbar a {
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    transition: background-color 0.3s ease;
}

.navbar a:hover {
    background-color: #555;
    border-radius: 4px;
}

${description.includes('dark mode') ? `
.dark-mode-toggle {
    background-color: #555;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 5px;
    cursor: pointer;
    margin-left: 1rem;
    transition: background-color 0.3s ease;
}

.dark-mode-toggle:hover {
    background-color: #777;
}

/* Dark Mode Styles */
body.dark-theme {
    background-color: #1a1a1a;
    color: #e0e0e0;
}

body.dark-theme .navbar {
    background-color: #222;
}

body.dark-theme .navbar a {
    color: #e0e0e0;
}

body.dark-theme .dark-mode-toggle {
    background-color: #444;
}
` : ''}
`;
            if (description.includes('dark mode')) {
                js = `document.querySelector('.dark-mode-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
});`;
            }

        } else if (description.includes('button') || description.includes('cta')) {
            html = `<button class="primary-btn">Click Me!</button>`;
            css = `.primary-btn {
    padding: 12px 25px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1.1em;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
}

.primary-btn:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
}

.primary-btn:active {
    transform: translateY(0);
}`; 
            js = `document.querySelector('.primary-btn').addEventListener('click', () => {
    alert('Button Clicked!');
});`;

        } else if (description.includes('card') || description.includes('product')) {
            html = `<div class="product-card">
    <img src="https://via.placeholder.com/150" alt="Product Image">
    <h3>Awesome Product</h3>
    <p>A short description of this amazing product.</p>
    <div class="price">$29.99</div>
    <button class="add-to-cart-btn">Add to Cart</button>
</div>`;
            css = `.product-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    text-align: center;
    width: 250px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    font-family: sans-serif;
}

.product-card img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin-bottom: 10px;
}

.product-card h3 {
    margin: 10px 0 5px;
    font-size: 1.2em;
    color: #333;
}

.product-card p {
    color: #666;
    font-size: 0.9em;
    margin-bottom: 10px;
}

.product-card .price {
    font-weight: bold;
    color: #007bff;
    font-size: 1.1em;
    margin-bottom: 15px;
}

.add-to-cart-btn {
    background-color: #28a745;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
    transition: background-color 0.3s ease;
}

.add-to-cart-btn:hover {
    background-color: #218838;
}
`;
            js = `document.querySelector('.add-to-cart-btn').addEventListener('click', () => {
    alert('Product added to cart!');
});`;
        } else {
            // Default component
            html = `<div>
    <h1>Hello from AI!</h1>
    <p>This is a basic component. Try describing something specific like 'a navigation bar' or 'a primary button'.</p>
</div>`;
            css = `div {
    padding: 20px;
    border: 2px dashed #ccc;
    border-radius: 8px;
    text-align: center;
    background-color: #f9f9f9;
    color: #333;
    font-family: sans-serif;
}

h1 {
    color: #007bff;
}

p {
    max-width: 400px;
    margin: 10px auto;
}`; 
            js = `console.log('Default AI component loaded.');`;
        }

        return { html, css, js };
    }

    // Function to update code blocks and preview
    function updateOutput(html, css, js) {
        htmlCodeBlock.textContent = escapeHtml(html);
        cssCodeBlock.textContent = css;
        jsCodeBlock.textContent = js;

        currentGeneratedHTML = html;
        currentGeneratedCSS = css;
        currentGeneratedJS = js;

        // Update preview
        previewContent.innerHTML = html;

        // Inject CSS for preview
        const styleTagId = 'generated-component-style';
        let styleTag = document.getElementById(styleTagId);
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = styleTagId;
            document.head.appendChild(styleTag);
        }
        styleTag.textContent = css;

        // Execute JS for preview (careful with dynamic JS execution)
        const scriptTagId = 'generated-component-script';
        let oldScriptTag = document.getElementById(scriptTagId);
        if (oldScriptTag) {
            oldScriptTag.remove();
        }
        if (js) {
            const scriptTag = document.createElement('script');
            scriptTag.id = scriptTagId;
            // Using textContent and appending ensures the script runs.
            // For more complex scenarios, an iframe might be safer.
            scriptTag.textContent = js;
            document.body.appendChild(scriptTag);
        }

        // Activate the HTML tab by default after generation
        tabButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-tab="html"]').classList.add('active');
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById('htmlContent').classList.add('active');
    }

    // Event Listener for Generate Button
    generateBtn.addEventListener('click', () => {
        const description = descriptionInput.value.trim();
        if (description) {
            const { html, css, js } = generateComponent(description);
            updateOutput(html, css, js);
        } else {
            alert('Please enter a description for your component.');
        }
    });

    // Event Listeners for Tab Navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove 'active' from all buttons and content
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            // Add 'active' to clicked button and corresponding content
            button.classList.add('active');
            const targetTab = button.dataset.tab;
            document.getElementById(`${targetTab}Content`).classList.add('active');
        });
    });

    // Event Listener for Copy Code Button
    copyCodeBtn.addEventListener('click', async () => {
        const allCode = `<!-- HTML -->\n${currentGeneratedHTML}\n\n/* CSS */\n${currentGeneratedCSS}\n\n// JavaScript \n${currentGeneratedJS}`;
        try {
            await navigator.clipboard.writeText(allCode);
            alert('All code copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy: ', err);
            alert('Failed to copy code. Please copy manually.');
        }
    });

    // Initial generation on load (optional, to show something by default)
    updateOutput(
        `<div>\n    <h1>Welcome!</h1>\n    <p>Describe your component above and click 'Generate'.</p>\n</div>`,
        `div {\n    padding: 20px;\n    border: 2px dashed #007bff;\n    border-radius: 8px;\n    text-align: center;\n    background-color: #e6f2ff;\n    color: #333;\n    font-family: sans-serif;\n}\n\nh1 {\n    color: #007bff;\n}\n\np {\n    max-width: 400px;\n    margin: 10px auto;\n}`,
        `console.log('Generator ready!');`
    );
});
