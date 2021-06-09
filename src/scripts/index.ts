import { Core, EdgeSingular, EventObject, NodeCollection, NodeSingular } from "cytoscape"; // from @types/cytoscape
const cytoscape = require("cytoscape");

const cy: Core = cytoscape({
    container: document.getElementById("canvas"),
    style: cytoscape.stylesheet()
      .selector("node")
        .css({
          "shape": "round-rectangle",
          "width": "100",
          "height": "120",
          "content": "data(pagename)",
          "text-valign": "center",
          "background-color": "#DEFFFF",
          "border-color": "black",
          "border-width": "1",
          "text-wrap": "wrap"
        })
      .selector("edge")
        .css({
          "target-arrow-shape": "triangle",
          "width": "6",
          "line-color": "#82DE76",
          "color": "#82DE76",
          "target-arrow-color": "#82DE76",
          "curve-style": "bezier",
        })
      .selector(":selected")
        .css({
          "line-color": "red",
          "target-arrow-color": "red",
          "source-arrow-color": "red"
        }),
    elements: {
      nodes: [],
      edges: []
    },
    layout: {
      name: "preset"
    },
});

// Number of pages added
let nodeCounter = 0;
// Used to create an edge between two nodes
let prevSelectedNodeID: string | null = null;

// Cytoscape node event handlers

// Decides to select a node to create an edge between two nodes or unselect
// it in case it was a misclick by the user, etc.
cy.on("tap", function(e: EventObject): void {
  if (e.target === cy || e.target.isEdge()) {
    unselectNode();
  } else {
    selectNode(e.target);
  }
});

function unselectNode(): void {
  cy.nodes("[id = '"+prevSelectedNodeID+"']").unselect();
  cy.nodes("[id = '"+prevSelectedNodeID+"']").style("border-color", "black");
  prevSelectedNodeID = null;
}

function selectNode(selectedNode: NodeSingular): void {
  
  const selectedNodeID: string = selectedNode.id();

  cy.nodes("[id = '"+selectedNodeID+"']").style("border-color", "red");

  if (prevSelectedNodeID !== null && prevSelectedNodeID !== selectedNodeID) {
    cy.add({
      group: "edges",
      data: {
        target: selectedNodeID,
        source: prevSelectedNodeID
      }
    });
    
    cy.nodes("[id = '"+prevSelectedNodeID+"']").style("border-color", "black");
    cy.nodes("[id = '"+selectedNodeID+"']").style("border-color", "black");
    
    selectedNode.unselect();
    prevSelectedNodeID = null;

    calculatePagerank();

  } else {
    selectedNode.select();
    prevSelectedNodeID = selectedNodeID; 
  }
}

// Event handlers

const addPageButton = <HTMLButtonElement>document.getElementById("add-button");
const deletePageButton = <HTMLButtonElement>document.getElementById("delete-button");
const resetButton = <HTMLButtonElement>document.getElementById("reset-button");
const dFactorInput = <HTMLInputElement>document.getElementById("d-factor");

dFactorInput?.addEventListener("input", function(): void {
  calculatePagerank();
});

deletePageButton?.addEventListener("click", function(): void {
  const selectedObj: NodeSingular | EdgeSingular = cy.$(":selected");
  
  if(selectedObj.isNode()) {
    const edgesToRemove = selectedObj.connectedEdges();
    edgesToRemove.remove();
  }

  selectedObj.remove();

  unselectNode();
  calculatePagerank();
});

addPageButton?.addEventListener("click", function(): void {
  cy.add({
    group: "nodes",
    data: {
      id: ""+nodeCounter,
      pagename: "Page "+nodeCounter,
    },
    position: {
      x: 100,
      y: 100
    }
  });

  nodeCounter++;
  calculatePagerank();
});

resetButton?.addEventListener("click", function(): void {
  location.reload();
});

// Page rank algorithm

function getTotalOutgoingEdges(matrix: number[][]): number[] {
  const edgeTotals: number[] = [];

  for (let c=0; c<matrix[0].length; c++) {
    let totalEdges = 0;
    for (let r=0; r<matrix[0].length; r++) {
      totalEdges += matrix[r][c];
    }
    edgeTotals[c] = totalEdges;
  }

  return edgeTotals;
}

function normaliseRanks(nodeTotal: number, ranks: number[]): number[] {
  let total = 0;
  
  for (let i=0; i<nodeTotal; i++) {
    total += ranks[i];
  }

  for (let i=0; i<nodeTotal; i++) {
    ranks[i] = ranks[i] / total;
  }

  return ranks;
}

function nextRanks(nodeTotal: number, ranks: number[], matrix: number[][]): number[] {
  const nextRanks = new Array(nodeTotal);  

  for (let i=0; i<nodeTotal; i++) {
    nextRanks[i] = 0;
  }

  for (let r=0; r<nodeTotal; r++) {
    for (let c=0; c<nodeTotal; c++) {
      nextRanks[r] += matrix[r][c] * ranks[c];
    }
  }

  return normaliseRanks(nodeTotal, nextRanks);
}

function formProbabilityMatrix(dFactor: number, nodeTotal: number, edgeTotals: number[], matrix: number[][]): number[][] {

  const additionalProb = (1 - dFactor) / nodeTotal;

  for (let c=0; c<nodeTotal; c++) {
    if (edgeTotals[c] === 0) {
      for (let r=0; r<nodeTotal; r++) {
        matrix[r][c] = (1.0 / nodeTotal) + additionalProb;
      }
    } else {
      for (let r=0; r<nodeTotal; r++) {
        matrix[r][c] = (matrix[r][c]/edgeTotals[c]) + additionalProb;
      }
    }
  }

  return matrix;
}

// Form transposed adjacency matrix
function formAdjacencyMatrix(nodeTotal: number): number[][] {
  const matrix: number[][] = new Array(nodeTotal);

  // Initialise empty '0' matrix
  for( let r = 0; r < nodeTotal; r++ ){
    const newRow = new Array(nodeTotal);
    for( let c = 0; c < nodeTotal; c++ ){
      newRow[c] = 0;
    }
    matrix[r] = newRow;
  }

  const edges = cy.edges();
  
  for (let i=0; i<edges.length; i++) {
    const edge = edges[i];

    const sourceNodeID: number = Number(edge.source().id());
    const targetNodeID: number = Number(edge.target().id());

    // If source and target are the same node, ignore edge
    if (sourceNodeID === targetNodeID) {
      continue;
    }

    matrix[targetNodeID][sourceNodeID] += 1;
  }

  return matrix;
}


function calculatePagerank(): void {
  let dFactor = Number((<HTMLInputElement>document.getElementById("d-factor")).value);
  
  if (isNaN(dFactor) || dFactor < 0 || dFactor > 1) {
    dFactor = 0;
  }

  const nodeTotal = cy.nodes().length;

  let matrix: number[][] = formAdjacencyMatrix(nodeTotal);
  let totalOutgoingEdges: number[] = getTotalOutgoingEdges(matrix);
  matrix = formProbabilityMatrix(dFactor, nodeTotal, totalOutgoingEdges, matrix);

  let ranks: number[] = new Array(nodeTotal);
  for (let i=0; i<nodeTotal; i++) {
    ranks[i] = 1;
  }
  
  for (let i=0; i<200; i++) {
    ranks = nextRanks(nodeTotal, ranks, matrix);
  }

  for (let i=0; i<nodeTotal; i++) {
    cy.nodes("[id = '"+i+"']").style({
      "content": "Page "+i+"\n"+Math.round(ranks[i]*1000)/1000
    });
  }
}