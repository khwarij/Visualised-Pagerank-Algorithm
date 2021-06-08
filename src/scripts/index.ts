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

// Button event handlers

const addPageButton = <HTMLButtonElement>document.getElementById("add-button");
const deletePageButton = <HTMLButtonElement>document.getElementById("delete-button");
const resetButton = <HTMLButtonElement>document.getElementById("reset-button");

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

// Creates the adjacency matrix to store edges between all nodes
function formAdjacencyMatrix(): number[][] {
  const matrix: number[][] = [];
  
  const nodes = cy.nodes();

  for (let r=0; r<nodes.length; r++) {
    const newRow: number[] = new Array(nodes.length);
    newRow.fill(0);

    const currentSourceNode: NodeSingular = nodes[r];
    const targetNodes: NodeCollection = currentSourceNode.connectedEdges().targets();
    
    for (let i=0; i<targetNodes.length; i++) {
      const currentTargetNode: NodeSingular = targetNodes[i];

      if (currentTargetNode !== currentSourceNode) {
        newRow[Number(currentTargetNode.id())] = 1;
      }
    }

    matrix.push(newRow);
  }
  
  return matrix;
}

// Gets the total number of outgoing links a page has to another page
// used to get the full probability matrix
function getTotalOutgoingEdges(row: number[]): number {
  let rowTotal = 0;
  for (let c=0; c<row.length; c++) {
    if (row[c] > 0) {
      rowTotal++;
    }
  }

  return rowTotal;
}

// Calculate the probability of clicking target pages from a source page,
// page 1 -> pages 2,3,4 = 1/3 chance for each
function formProbabilityMatrix(dFactor: number, matrix: number[][]): number[][] {
  for (let r=0; r<matrix[0].length; r++) {
    const totalOutgoingEdges: number = getTotalOutgoingEdges(matrix[r]);
    for (let c=0; c<matrix[0].length; c++) {
      const currentEdge: number = matrix[r][c];
      if (currentEdge > 0) {
        matrix[r][c] = currentEdge/totalOutgoingEdges;
      }
    }
  }

  return matrix;
}

// function rankProbabilityMatrix(dFactor: number, matrix: number[][]): void {
  
// }

function calculatePagerank(): void {
  let dFactor = Number((<HTMLInputElement>document.getElementById("d-factor")).value);
  
  if (isNaN(dFactor) || dFactor < 0 || dFactor > 1) {
    dFactor = 0;
  }
  
  let matrix: number[][] = formAdjacencyMatrix();
  matrix = formProbabilityMatrix(dFactor, matrix);


  // console.log("----------");

  // for (let r=0; r<matrix[0].length; r++) {
  //   let row = "";
  //   for (let c=0; c<matrix[0].length; c++) {
  //     row += matrix[r][c];
  //   }
  //   console.log(row);
  // }
  
}