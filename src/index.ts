const fs = require('fs');
const Viz = require('@viz-js/viz');
import { parseSstTree } from './parseSstTree';


async function generateGraph(treeFile) {
    // Read and parse the tree JSON file
    const inputFile = `script_IO/input_trees/${treeFile}.json`;
    const outputFile = `script_IO/output_graphs/${treeFile}.svg`;
    const treeData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    const {nodes, links} = parseSstTree(treeData.tree.children);
    const linkNames = [...new Set(links.map(l=>l.linkName))]
    console.log({linkNames})
    
    // OPTIONAL - link reducer
    // links.forEach(link => link.linkName = "LINK");
    const linksDeduplicated = Array.from(
        new Set(links.map(obj => JSON.stringify(obj)))
      ).map(str => JSON.parse(str));


    // Create DOT language representation
    let dotContent = 'digraph G {\n';
    dotContent += '  node [shape=box style=filled fillcolor="#f0f0f0"];\n';
    
    // Add nodes
    nodes.forEach(node => {
        // Escape quotes in node names if they exist
        const escapedNode = node.name.replace(/"/g, '\\"');
        dotContent += `  "${escapedNode}";\n`;
    });

    // Add edges (deduplicate by linkName for each pair of nodes)
    const addedEdges = new Set();
    linksDeduplicated.forEach(rel => {
        const edgeKey = `${rel.from}-${rel.to}-${rel.linkName}`;
        if (!addedEdges.has(edgeKey)) {
            // Escape quotes in names if they exist
            const escapedFrom = rel.from.replace(/"/g, '\\"');
            const escapedTo = rel.to.replace(/"/g, '\\"');
            const escapedLabel = rel.linkName.replace(/"/g, '\\"');
            
            dotContent += `  "${escapedFrom}" -> "${escapedTo}" [label="${escapedLabel}" fontsize=10];\n`;
            addedEdges.add(edgeKey);
        }
    });

    dotContent += '}\n';

    try {
        // Initialize viz.js
        const viz = await Viz.instance();
        
        // Generate SVG
        const svg = viz.renderString(dotContent);
        
        // Write to file
        fs.writeFileSync(outputFile, svg);
        console.log('Graph generated successfully as tree-visualization.svg');
    } catch (error) {
        console.error('Error generating graph:', error);
    }
}

// Run the graph generation
const inputTreeFile = 'example_tree';
generateGraph(inputTreeFile).catch(console.error);