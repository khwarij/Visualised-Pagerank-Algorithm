
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

    const dFactorInput = document.getElementById("d-factor");
    dFactorInput?.setAttribute("value", dFactor);

    const cyObj = cytoscape({
        elements: {
            nodes: nodes,
            edges: edges,
        }
    });

    return calculatePagerank(cyObj);
}

function compareRanks(ranks: number[], expectedRanks: number[]): void {
    for (let i=0; i<ranks[i]; i++) {
        const currentRank: number = Math.round(ranks[i]*1000)/1000;
        
        expect(currentRank).toBeLessThanOrEqual(expectedRanks[i]+0.005);
        expect(currentRank).toBeGreaterThanOrEqual(expectedRanks[i]-0.005);
    }
}

// To avoid scope conflicts with the functions being tested
function runTests(): void {
    //------------------------------------------------------- test 1

    const dFactorInput = document.createElement("input");
    dFactorInput.setAttribute("id", "d-factor");
    document.body.appendChild(dFactorInput);

    let nodes: INode[] = [
        { data: { id: "0", pagename: "Page 0" } },
        { data: { id: "1", pagename: "Page 1" } },
        { data: { id: "2", pagename: "Page 2" } },
        { data: { id: "3", pagename: "Page 3" } },
    ];

    let edges: IEdge[] = [
        //{ data: { source: "0", target: "0" } },
    ];

    let expectedRanks = [0.25, 0.25, 0.25, 0.25];
    let ranks: number[] = setUp("0.85", nodes, edges);

    test("Ranks of 4 unconnected nodes, with d=0.85", () => {
        compareRanks(ranks, expectedRanks);
    });

    //------------------------------------------------------- test 2

    nodes = [
        { data: { id: "0", pagename: "Page 0" } },
        { data: { id: "1", pagename: "Page 1" } },
        { data: { id: "2", pagename: "Page 2" } },
        { data: { id: "3", pagename: "Page 3" } },
    ];

    edges = [
        { data: { source: "0", target: "1" } },
        { data: { source: "1", target: "2" } },
        { data: { source: "2", target: "3" } },
        { data: { source: "3", target: "0" } },
    ];

    expectedRanks = [0.25, 0.25, 0.25, 0.25];
    ranks = setUp("0.85", nodes, edges);

    test("Ranks of 4 uni-directional circular connected nodes, with d=0.85", () => {
        compareRanks(ranks, expectedRanks);
    });
    
    //------------------------------------------------------- test 3

    nodes = [{ data: { id: "0", pagename: "Page 0" } },];
    edges = [];

    expectedRanks = [1,];
    ranks = setUp("0.85", nodes, edges);

    test("Rank of 1 unconnected node, with d=0.85", () => {
        compareRanks(ranks, expectedRanks);
    });

    //------------------------------------------------------- test 4

    nodes = [
        { data: { id: "0", pagename: "Page 0" } },
        { data: { id: "1", pagename: "Page 1" } },
        { data: { id: "2", pagename: "Page 2" } },
        { data: { id: "3", pagename: "Page 3" } },
        { data: { id: "4", pagename: "Page 4" } },
    ];

    edges = [
        { data: { source: "0", target: "1" } },
        { data: { source: "1", target: "0" } },

        { data: { source: "1", target: "2" } },
        { data: { source: "2", target: "1" } },

        { data: { source: "2", target: "3" } },
        { data: { source: "3", target: "2" } },

        { data: { source: "3", target: "0" } },
        { data: { source: "0", target: "3" } },
    ];

    expectedRanks = [0.242, 0.242, 0.242, 0.242, 0.032];
    ranks = setUp("0.85", nodes, edges);

    test("Ranks of 5 bi-directional circular connected nodes and one unconnected node, with d=0.85", () => {
        compareRanks(ranks, expectedRanks);
    });

    //------------------------------------------------------- test 5

    nodes = [
        { data: { id: "0", pagename: "Page 0" } },
        { data: { id: "1", pagename: "Page 1" } },
        { data: { id: "2", pagename: "Page 2" } },
        { data: { id: "3", pagename: "Page 3" } },
        { data: { id: "4", pagename: "Page 4" } },
    ];

    edges = [
        { data: { source: "0", target: "1" } },
        { data: { source: "1", target: "0" } },

        { data: { source: "1", target: "2" } },
        { data: { source: "2", target: "1" } },

        { data: { source: "2", target: "3" } },
        { data: { source: "3", target: "2" } },

        { data: { source: "3", target: "0" } },
        { data: { source: "0", target: "3" } },
    ];

    expectedRanks = [0.222, 0.222, 0.222, 0.222, 0.111];
    ranks = setUp("0", nodes, edges);

    test("Ranks of 5 bi-directional circular connected nodes and one unconnected node, with d=0", () => {
        compareRanks(ranks, expectedRanks);
    });

    //------------------------------------------------------- test 6

    nodes = [
        { data: { id: "0", pagename: "Page 0" } },
        { data: { id: "1", pagename: "Page 1" } },
        { data: { id: "2", pagename: "Page 2" } },
        { data: { id: "3", pagename: "Page 3" } },
    ];

    edges = [
        { data: { source: "0", target: "1" } },
        { data: { source: "0", target: "2" } },
        { data: { source: "1", target: "3" } },
        { data: { source: "2", target: "3" } },
    ];

    expectedRanks = [0.136, 0.195, 0.195, 0.475];
    ranks = setUp("0.85", nodes, edges);

    test("Ranks of 4 acyclic uni-directional nodes, with d=0.85", () => {
        compareRanks(ranks, expectedRanks);
    });

    //------------------------------------------------------- test 7

    nodes = [
        { data: { id: "0", pagename: "Page 0" } },
        { data: { id: "1", pagename: "Page 1" } },
        { data: { id: "2", pagename: "Page 2" } },
        { data: { id: "3", pagename: "Page 3" } },
        { data: { id: "4", pagename: "Page 4" } },
    ];

    edges = [
        { data: { source: "0", target: "1" } },
        { data: { source: "0", target: "2" } },

        { data: { source: "2", target: "1" } },
        { data: { source: "2", target: "3" } },
        { data: { source: "2", target: "4" } },

        { data: { source: "3", target: "0" } },
    ];

    expectedRanks = [0.233, 0.257, 0.199, 0.156, 0.156];
    ranks = setUp("0.85", nodes, edges);

    test("Ranks of 5 semi-acyclic nodes with sinks, d=0.85", () => {
        compareRanks(ranks, expectedRanks);
    });

    //------------------------------------------------------- test 8

    nodes = [
        { data: { id: "0", pagename: "Page 0" } },
        { data: { id: "1", pagename: "Page 1" } },
        { data: { id: "2", pagename: "Page 2" } },
        { data: { id: "3", pagename: "Page 3" } },
        { data: { id: "4", pagename: "Page 4" } },
    ];

    edges = [
        { data: { source: "0", target: "1" } },
        { data: { source: "0", target: "2" } },

        { data: { source: "2", target: "1" } },
        { data: { source: "2", target: "3" } },
        { data: { source: "2", target: "4" } },

        { data: { source: "3", target: "0" } },
    ];

    expectedRanks = [0.227, 0.230, 0.197, 0.173, 0.173];
    ranks = setUp("0", nodes, edges);

    test("Ranks of 5 semi-acyclic nodes with sinks, d=0", () => {
        compareRanks(ranks, expectedRanks);
    });

    //------------------------------------------------------- test 9

    nodes = [
        { data: { id: "0", pagename: "Page 0" } },
        { data: { id: "1", pagename: "Page 1" } },
        { data: { id: "2", pagename: "Page 2" } },
        { data: { id: "3", pagename: "Page 3" } },
        { data: { id: "4", pagename: "Page 4" } },
        { data: { id: "5", pagename: "Page 5" } },
        { data: { id: "6", pagename: "Page 6" } },
    ];

    edges = [
        // Group 1
        { data: { source: "0", target: "1" } },

        // Group 2
        { data: { source: "2", target: "3" } },
        { data: { source: "3", target: "2" } },

        // Group 3
        { data: { source: "4", target: "5" } },
        { data: { source: "4", target: "6" } },
        { data: { source: "5", target: "6" } },
        { data: { source: "6", target: "4" } },
    ];

    expectedRanks = [
        0.024, 0.045, 0.186,
        0.186, 0.217, 0.119,
        0.222
    ];
    ranks = setUp("0.85", nodes, edges);

    test("Ranks of separately connected node groups, with d=0.85", () => {
        compareRanks(ranks, expectedRanks);
    });

    //------------------------------------------------------- test 10

    nodes = [
        { data: { id: "0", pagename: "Page 0" } },
        { data: { id: "1", pagename: "Page 1" } },
        { data: { id: "2", pagename: "Page 2" } },
        { data: { id: "3", pagename: "Page 3" } },
        { data: { id: "4", pagename: "Page 4" } },
        { data: { id: "5", pagename: "Page 5" } },
        { data: { id: "6", pagename: "Page 6" } },
    ];

    edges = [
        // Group 1
        { data: { source: "0", target: "1" } },

        // Group 2
        { data: { source: "2", target: "3" } },
        { data: { source: "3", target: "2" } },

        // Group 3
        { data: { source: "4", target: "5" } },
        { data: { source: "4", target: "6" } },
        { data: { source: "5", target: "6" } },
        { data: { source: "6", target: "4" } },
    ];

    expectedRanks = [
        0.080, 0.120, 0.160,
        0.160, 0.172, 0.123,
        0.185

    ];
    ranks = setUp("0", nodes, edges);

    test("Ranks of separately connected node groups, with d=0", () => {
        compareRanks(ranks, expectedRanks);
    });
}

runTests();