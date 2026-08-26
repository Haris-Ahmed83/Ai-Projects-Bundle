// Initial sample data for demonstration
const sampleData = {
    "nodes": [
        {"id": "Source A"},
        {"id": "Source B"},
        {"id": "Intermediate 1"},
        {"id": "Intermediate 2"},
        {"id": "Destination X"},
        {"id": "Destination Y"},
        {"id": "Rework Path"}
    ],
    "links": [
        {"source": "Source A", "target": "Intermediate 1", "value": 120},
        {"source": "Source A", "target": "Intermediate 2", "value": 30},
        {"source": "Source B", "target": "Intermediate 1", "value": 70},
        {"source": "Source B", "target": "Rework Path", "value": 10},
        {"source": "Intermediate 1", "target": "Destination X", "value": 90},
        {"source": "Intermediate 1", "target": "Destination Y", "value": 60},
        {"source": "Intermediate 2", "target": "Destination Y", "value": 25},
        {"source": "Intermediate 2", "target": "Rework Path", "value": 5},
        {"source": "Rework Path", "target": "Intermediate 1", "value": 15},
        {"source": "Destination X", "target": "Destination Y", "value": 5} /* Example of a small flow between final stages */
    ]
};

// Get DOM elements
const dataInput = document.getElementById('dataInput');
const renderButton = document.getElementById('renderButton');
const errorMessage = document.getElementById('errorMessage');
const svgElement = document.getElementById('sankeyDiagram');
const svg = d3.select(svgElement);
const tooltip = d3.select("#tooltip");

// Set initial data in the textarea
dataInput.value = JSON.stringify(sampleData, null, 2);

// SVG dimensions with margins
const margin = { top: 10, right: 10, bottom: 10, left: 10 };
let width = svgElement.getBoundingClientRect().width - margin.left - margin.right;
let height = svgElement.getBoundingClientRect().height - margin.top - margin.bottom;

// Create a group element for the Sankey diagram to apply margins
const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Sankey generator setup
const sankey = d3.sankey()
    .nodeWidth(15)
    .nodePadding(10)
    .extent([[0, 0], [width, height]]);

// Color scale for nodes (using D3's built-in categorical colors)
const color = d3.scaleOrdinal(d3.schemeCategory10);

/**
 * Renders the Sankey diagram based on the provided data.
 * @param {object} data - An object containing 'nodes' and 'links' arrays.
 */
function renderSankey(data) {
    errorMessage.textContent = ''; // Clear previous errors
    g.selectAll("*").remove(); // Clear previous diagram elements

    try {
        // Create a deep copy of the data to avoid modifying the original input
        // D3-Sankey adds layout properties directly to the node and link objects.
        const graph = {
            nodes: data.nodes.map(d => ({ ...d })), 
            links: data.links.map(d => ({ ...d }))
        };

        // Compute the Sankey layout: calculates positions for nodes and paths for links
        sankey(graph);

        // Draw links
        const link = g.append("g")
            .attr("class", "links")
            .attr("fill", "none")
            .attr("stroke-opacity", 0.2)
            .selectAll("g")
            .data(graph.links)
            .join("g");

        link.append("path")
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke-width", d => Math.max(1, d.width)) // Ensure minimum stroke width
            .attr("class", "link")
            .attr("stroke", d => { 
                // Assign color based on the source node (or target, depending on preference)
                // Store color on node for consistent coloring
                if (!d.source.color) d.source.color = color(d.source.id); 
                return d.source.color; 
            })
            .on("mouseover", function(event, d) {
                d3.select(this).attr("stroke-opacity", 0.6);
                tooltip.html(
                    `<strong>${d.source.id} &#8594; ${d.target.id}</strong><br>
                    Value: ${d.value.toLocaleString()}`
                )
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px")
                .classed("active", true);
            })
            .on("mouseout", function() {
                d3.select(this).attr("stroke-opacity", 0.2);
                tooltip.classed("active", false);
            });

        // Draw nodes
        const node = g.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(graph.nodes)
            .join("g")
            .attr("class", "node");

        node.append("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("fill", d => { 
                // Assign and store color for the node
                d.color = color(d.id);
                return d.color; 
            })
            .attr("stroke", "#555")
            .on("mouseover", function(event, d) {
                d3.select(this).attr("stroke", "darkred").attr("stroke-width", 2);
                 tooltip.html(
                    `<strong>${d.id}</strong><br>
                    Incoming: ${d.valueIn.toLocaleString()}<br>
                    Outgoing: ${d.valueOut.toLocaleString()}`
                )
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px")
                .classed("active", true);
            })
            .on("mouseout", function() {
                d3.select(this).attr("stroke", "#555").attr("stroke-width", 0.5);
                tooltip.classed("active", false);
            });

        node.append("text")
            .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6) // Position label to the right or left of node
            .attr("y", d => (d.y1 + d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
            .text(d => d.id)
            .style("fill", "#333");

    } catch (e) {
        errorMessage.textContent = `Error rendering Sankey diagram: ${e.message}. Check console for details.`;
        console.error("Sankey render error:", e);
    }
}

// Event listener for the render button
renderButton.addEventListener('click', () => {
    try {
        const jsonData = JSON.parse(dataInput.value);
        // Basic validation for required properties
        if (!jsonData.nodes || !Array.isArray(jsonData.nodes) || jsonData.nodes.some(n => typeof n.id === 'undefined')) {
            throw new Error("Data must contain a 'nodes' array with each node having an 'id'.");
        }
        if (!jsonData.links || !Array.isArray(jsonData.links) || jsonData.links.some(l => typeof l.source === 'undefined' || typeof l.target === 'undefined' || typeof l.value === 'undefined')) {
            throw new Error("Data must contain a 'links' array with each link having 'source', 'target', and 'value'.");
        }
        renderSankey(jsonData);
    } catch (e) {
        errorMessage.textContent = `Invalid JSON data: ${e.message}`;
        console.error("JSON parse error or data validation error:", e);
    }
});

// Initial render on page load with sample data
renderSankey(sampleData);

// Basic responsiveness: re-render on window resize
// Debounce the resize event for performance
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        const newWidth = svgElement.getBoundingClientRect().width - margin.left - margin.right;
        const newHeight = svgElement.getBoundingClientRect().height - margin.top - margin.bottom;

        // Only re-render if dimensions have actually changed significantly
        if (Math.abs(newWidth - width) > 1 || Math.abs(newHeight - height) > 1) {
            width = newWidth;
            height = newHeight;
            sankey.extent([[0, 0], [width, height]]);
            
            try {
                const currentData = JSON.parse(dataInput.value);
                renderSankey(currentData);
            } catch (e) {
                // If current input is invalid, just log error, don't block resize
                console.error("Error re-rendering on resize with current data:", e);
            }
        }
    }, 250); // Debounce time in milliseconds
});
