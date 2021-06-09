
interface INode {
    data: {
        id: string,
        pagename: string,
    }
}

interface IEdge {
    data: {
        source: string,
        target: string,
    }
}

// Used to set the arrangment of nodes, edges and the dampening factor before each test
function setUp(dFactor: string, nodes: INode[], edges: IEdge[]): number[] {
    const cytoscape = require("cytoscape");
    const { calculatePagerank } = require("../scripts/pagerank");

    const dFactorInput = document.createElement("input");
    dFactorInput.setAttribute("id", "d-factor");
    dFactorInput.setAttribute("value", dFactor);
    
    document.body.appendChild(dFactorInput);

    const cyObj = cytoscape({
        elements: {
            nodes: nodes,
            edges: edges,
        }
    });

    return calculatePagerank(cyObj);
}

// To avoid scope conflicts with the functions being tested
function runTests(): void {
    
    let nodes: INode[] = [
        //{ data: {id: "0", pagename: "Page 0"} },
    ];

    let edges: IEdge[] = [
        //{ data: {source: "0", target: "0"} },
    ];

    let ranks: number[] = setUp("0", nodes, edges);

    for (let i=0; i<ranks[i]; i++) {
        console.log("Page "+i+": "+Math.round(ranks[i]*1000)/1000);
    }
    
}

runTests();