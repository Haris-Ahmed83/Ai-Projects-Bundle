document.addEventListener('DOMContentLoaded', () => {
    const diagramInput = document.getElementById('diagramInput');
    const generateBtn = document.getElementById('generateBtn');
    const outputArea = document.getElementById('outputArea');

    generateBtn.addEventListener('click', generateDiagram);

    function generateDiagram() {
        const inputText = diagramInput.value.toLowerCase();
        let mermaidSyntax = '';
        let disclaimer = '<p><em>To render this visually, you would typically integrate a library like Mermaid.js or a similar diagramming tool.</em></p>';

        if (inputText.includes('flowchart') || inputText.includes('flow chart')) {
            mermaidSyntax = `graph TD
    A[Start Process] --> B{User Authentication?}
    B -- Yes --> C(Check Credentials)
    C -- Valid --> D[Access Granted]
    C -- Invalid --> E[Show Error]
    B -- No --> F[Guest Access]
    D --> G[End]
    E --> H[Try Again?]
    H -- Yes --> B
    H -- No --> G
    F --> G`;
        } else if (inputText.includes('sequence diagram') || inputText.includes('sequence')) {
            mermaidSyntax = `sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database

    User->>Frontend: Request Data
    Frontend->>Backend: API Call
    Backend->>Database: Query Data
    Database-->>Backend: Data Response
    Backend-->>Frontend: API Response
    Frontend->>User: Display Data`;
        } else if (inputText.includes('class diagram') || inputText.includes('class')) {
            mermaidSyntax = `classDiagram
    class User {
        +String userId
        +String username
        +String email
        +login()
        +logout()
    }
    class Product {
        +String productId
        +String name
        +double price
        +int stockQuantity
        +getProductDetails()
    }
    class Order {
        +String orderId
        +Date orderDate
        +double totalAmount
        +addProducts()
        +calculateTotal()
    }

    User "1" -- "*" Order : places
    Order "1" -- "*" Product : contains`;
        } else if (inputText.includes('state diagram') || inputText.includes('state')) {
            mermaidSyntax = `stateDiagram-v2
    [*] --> Idle
    Idle --> Authenticating: user logins
    Authenticating --> LoggedIn: success
    Authenticating --> Idle: failure
    LoggedIn --> Browsing: view products
    Browsing --> Shopping: add to cart
    Shopping --> Checkout: proceed
    Checkout --> Paid: payment success
    Paid --> Delivered: item shipped
    Delivered --> [*]
    LoggedIn --> Idle: logout`;
        } else if (inputText.includes('erd') || inputText.includes('entity relationship diagram')) {
            mermaidSyntax = `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    PRODUCT ||--o{ LINE-ITEM : "ordered in"
    CATEGORY ||--o{ PRODUCT : contains
    CUSTOMER { 
        VARCHAR(50) customer_id PK
        VARCHAR(100) name
        VARCHAR(100) email
    }
    ORDER {
        VARCHAR(50) order_id PK
        VARCHAR(50) customer_id FK
        DATE order_date
        DECIMAL(10,2) total_amount
    }
    PRODUCT {
        VARCHAR(50) product_id PK
        VARCHAR(100) name
        DECIMAL(10,2) price
        INT stock
        VARCHAR(50) category_id FK
    }
    CATEGORY {
        VARCHAR(50) category_id PK
        VARCHAR(100) name
    }
    LINE-ITEM {
        VARCHAR(50) line_item_id PK
        VARCHAR(50) order_id FK
        VARCHAR(50) product_id FK
        INT quantity
        DECIMAL(10,2) unit_price
    }`; 
        } else {
            mermaidSyntax = `graph TD
    A[User Input] --> B(AI Processing - Concept Extraction)
    B --> C{Determine Diagram Type?}
    C -- Flowchart --> D[Generate Flowchart Syntax]
    C -- Sequence --> E[Generate Sequence Syntax]
    C -- Class --> F[Generate Class Syntax]
    C -- Others --> G[Generate Generic Diagram]
    D & E & F & G --> H[Mermaid Syntax Output]
    H --> I(Display Text)`;
            disclaimer = '<p><em>No specific diagram type detected. Displaying a generic process flow. To render this visually, you would typically integrate a library like Mermaid.js or a similar diagramming tool.</em></p>';
        }

        outputArea.innerHTML = `
            <p>The AI generated the following Mermaid syntax:</p>
            <pre><code>${mermaidSyntax}</code></pre>
            ${disclaimer}
        `;
    }
});
