const cytoscape = require("cytoscape");

var cy = cytoscape({
    container: document.getElementById('canvas'),
    elements: [
      { data: { id: 'a' } },
      { data: { id: 'b' } },
      {
        data: {
          id: 'ab',
          source: 'a',
          target: 'b'
        }
      }]
});