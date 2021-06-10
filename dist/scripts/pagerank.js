(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePagerank = exports.formAdjacencyMatrix = exports.formProbabilityMatrix = exports.nextRanks = exports.normaliseRanks = exports.getTotalOutgoingEdges = void 0;
function getTotalOutgoingEdges(matrix) {
    const edgeTotals = [];
    for (let c = 0; c < matrix[0].length; c++) {
        let totalEdges = 0;
        for (let r = 0; r < matrix[0].length; r++) {
            totalEdges += matrix[r][c];
        }
        edgeTotals[c] = totalEdges;
    }
    return edgeTotals;
}
exports.getTotalOutgoingEdges = getTotalOutgoingEdges;
function normaliseRanks(nodeTotal, ranks) {
    let total = 0;
    for (let i = 0; i < nodeTotal; i++) {
        total += ranks[i];
    }
    for (let i = 0; i < nodeTotal; i++) {
        ranks[i] = ranks[i] / total;
    }
    return ranks;
}
exports.normaliseRanks = normaliseRanks;
function nextRanks(nodeTotal, ranks, matrix) {
    const nextRanks = new Array(nodeTotal);
    for (let i = 0; i < nodeTotal; i++) {
        nextRanks[i] = 0;
    }
    for (let r = 0; r < nodeTotal; r++) {
        for (let c = 0; c < nodeTotal; c++) {
            nextRanks[r] += matrix[r][c] * ranks[c];
        }
    }
    return normaliseRanks(nodeTotal, nextRanks);
}
exports.nextRanks = nextRanks;
function formProbabilityMatrix(dFactor, nodeTotal, edgeTotals, matrix) {
    const additionalProb = (1 - dFactor) / nodeTotal;
    for (let c = 0; c < nodeTotal; c++) {
        if (edgeTotals[c] === 0) {
            for (let r = 0; r < nodeTotal; r++) {
                matrix[r][c] = (1.0 / nodeTotal) + additionalProb;
            }
        }
        else {
            for (let r = 0; r < nodeTotal; r++) {
                matrix[r][c] = (matrix[r][c] / edgeTotals[c]) + additionalProb;
            }
        }
    }
    return matrix;
}
exports.formProbabilityMatrix = formProbabilityMatrix;
// Form transposed adjacency matrix
function formAdjacencyMatrix(cy, nodeTotal) {
    const matrix = new Array(nodeTotal);
    // Initialise empty '0' matrix
    for (let r = 0; r < nodeTotal; r++) {
        const newRow = new Array(nodeTotal);
        for (let c = 0; c < nodeTotal; c++) {
            newRow[c] = 0;
        }
        matrix[r] = newRow;
    }
    const edges = cy.edges();
    for (let i = 0; i < edges.length; i++) {
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
exports.formAdjacencyMatrix = formAdjacencyMatrix;
function calculatePagerank(cy) {
    let dFactor = Number(document.getElementById("d-factor").value);
    if (isNaN(dFactor) || dFactor < 0 || dFactor > 1) {
        dFactor = 0;
    }
    const nodeTotal = cy.nodes().length;
    let matrix = formAdjacencyMatrix(cy, nodeTotal);
    const totalOutgoingEdges = getTotalOutgoingEdges(matrix);
    matrix = formProbabilityMatrix(dFactor, nodeTotal, totalOutgoingEdges, matrix);
    let ranks = new Array(nodeTotal);
    for (let i = 0; i < nodeTotal; i++) {
        ranks[i] = 1;
    }
    for (let i = 0; i < 200; i++) {
        ranks = nextRanks(nodeTotal, ranks, matrix);
    }
    for (let i = 0; i < nodeTotal; i++) {
        cy.nodes("[id = '" + i + "']").style({
            "content": "Page " + i + "\n" + Math.round(ranks[i] * 1000) / 1000
        });
    }
    return ranks;
}
exports.calculatePagerank = calculatePagerank;

},{}]},{},[1]);
