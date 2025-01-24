type Node_ = {
    name: string,
}

type Link = {
    from: Node_['name'],
    to: Node_['name'],
    linkName: string,
}

type Graph = {
    nodes: Node_[],
    links: Link[],
}

export function parseSstTree(tree): Graph {
    // Get top-level nodes from tree.children
    const nodes = Object.keys(tree).map((name) => ({ name }));

    // Find all import values and their relationships
    const links = findImportValues(tree);

    return { nodes, links }
}

// Function to find all Fn::ImportValue occurrences and their paths
function findImportValues(obj, currentPath: string[] = [], results: Link[] = []) {
    if (typeof obj !== 'object' || obj === null) {
        return results;
    }

    for (const [key, value] of Object.entries(obj)) {
        if (key === 'Fn::ImportValue' && typeof value === 'string') {
            // Extract source node and link name
            const [sourceNode, linkName] = value.split(':');
            if (sourceNode && linkName) {
                // Find the top-level parent node where this import is located
                const parentNode = currentPath[0];
                results.push({
                    from: sourceNode,
                    to: parentNode,
                    linkName: linkName
                });
            }
        } else if (typeof value === 'object' && value !== null) {
            findImportValues(value, [...currentPath, key], results);
        }
    }
    return results;
}