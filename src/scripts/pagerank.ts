import { Core } from "cytoscape"; // from @types/cytoscape

export function getTotalOutgoingEdges(matrix: number[][]): number[] {
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
  
export function normaliseRanks(nodeTotal: number, ranks: number[]): number[] {
    let total = 0;
    
    for (let i=0; i<nodeTotal; i++) {
      total += ranks[i];
    }
  
    for (let i=0; i<nodeTotal; i++) {
      ranks[i] = ranks[i] / total;
    }
  
    return ranks;
}
  
export function nextRanks(nodeTotal: number, ranks: number[], matrix: number[][]): number[] {
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
  
export function formProbabilityMatrix(dFactor: number, nodeTotal: number, edgeTotals: number[], matrix: number[][]): number[][] {
  
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
export function formAdjacencyMatrix(cy: Core, nodeTotal: number): number[][] {
    const matrix: number[][] = new Array(nodeTotal);
    const matrix: number[][] = new Bit Array(nodeTotal);
  
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
  
      const sourceNodeID = Number(edge.source().id());
      const targetNodeID = Number(edge.target().id());
  
      // If source and target are the same node, ignore edge
      if (sourceNodeID === targetNodeID) {
        continue;
      }
  
      matrix[targetNodeID][sourceNodeID] += 1;
    }
  
    return matrix;
}
  
  
export function calculatePagerank(cy: Core): number[] {
    let dFactor = Number((<HTMLInputElement>document.getElementById("d-factor")).value);
    
    if (isNaN(dFactor) || dFactor < 0 || dFactor > 1) {
      dFactor = 0;
    }
  
    const nodeTotal = cy.nodes().length;
  
    let matrix: number[][] = formAdjacencyMatrix(cy, nodeTotal);
    const totalOutgoingEdges: number[] = getTotalOutgoingEdges(matrix);
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

    return ranks;
}
