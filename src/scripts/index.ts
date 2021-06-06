import { Core, EventObject, NodeSingular } from "cytoscape";
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
let nodeCounter: number = 0;
let prevSelectedNodeID: string | null = null;

// cytoscape node event handlers

cy.on('tap', 'node', function(e: EventObject): void {
  
  let selectedNode: NodeSingular = e.target;
  let selectedNodeID: string = selectedNode.id();

  console.log(selectedNodeID);

  if (prevSelectedNodeID !== null && prevSelectedNodeID !== selectedNodeID) {
    cy.add({
      group: "edges",
      data: {
        target: selectedNodeID,
        source: prevSelectedNodeID
      }
    })
  }
  
  selectedNode.select();
  prevSelectedNodeID = selectedNodeID;
});

// button event handlers

const addPageButton = <HTMLButtonElement>document.getElementById("add-button");
const deletePageButton = <HTMLButtonElement>document.getElementById("delete-button");

deletePageButton?.addEventListener("click", function(): void {
  let selectedNode = cy.$(":selected");
  console.log();
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


// Page rank algorithm

function calculatePagerank(): void {
  console.log("real time calculate pagerank");
}