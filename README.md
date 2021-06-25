# Visualised-Pagerank-Algorithm

Have a go via <a href="https://unknown807.github.io/Visualised-Pagerank-Algorithm/">GitHub pages</a>

## Description

After learning about pagerank I always wanted to understand it in more detail and how exactly to implement it in code myself. So using <a href="https://computerscience.chemeketa.edu/cs160Reader/_static/pageRankApp/index.html">this example</a> written in Javascript
, and the cytoscape.js source code for pagerank I tried both implementing visualised page rank simulation and also learning typescript with which to write it in.

## Dependencies

For more information look in package.json

- cytoscape - ^3.19.0
- typescript - ^4.3.2
- browserify - ^17.0.0 (to bundle all dependencies into compiled js files)
- jest - ^27.0.4
- eslint - ^7.28.0

## How To Use

There are three buttons, to add pages, delete selected pages and links (by clicking on them then the button), to reset the whole graph (page refresh) and an input field between 0 and 1 for the dampening factor.

![](/imgs/img.PNG)

