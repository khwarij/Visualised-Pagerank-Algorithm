# Visualised-Pagerank-Algorithm

Have a go via GitHub pages - https://unknown807.github.io/Visualised-Pagerank-Algorithm/

## Description

After learning about pagerank I always wanted to understand it in more detail and how exactly to implement it in code myself. So using this example written in Javascript:
https://computerscience.chemeketa.edu/cs160Reader/_static/pageRankApp/index.html, and the cytoscape.js source code for pagerank I tried both implementing visualised page rank simulation and also learning typescript with which to write it in.

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

