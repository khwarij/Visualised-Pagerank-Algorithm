import { Core, EdgeSingular, EventObject, NodeSingular } from "cytoscape"; // from @types/cytoscape
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

//let dFactor: number = Number((<HTMLInputElement>document.getElementById("d-factor")).value);

// number of pages added
let nodeCounter = 0;
let prevSelectedNodeID: string | null = null;

// cytoscape node event handlers

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

// button event handlers

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

function calculatePagerank(): void {
  console.log("real time calculate pagerank");
}