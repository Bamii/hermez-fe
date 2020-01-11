#!/usr/bin/env node

const express = require('express');
const path = require('path');
const app = express();
const sh = require('./serverHandler.js');

app.use(express.static(path.join(__dirname, 'dist')));

// render the app
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// app routes;
sh(app);

// default port is 4387 ??.. or 9000 ??
app.listen(9000, (s) => {
  console.log("---------");
  console.log("hermez");
  console.log("---------");
  console.log("hermez is running");
  console.log();
  console.log("please navigate to localhost:9000 on your browser");
});

// TODO::
/* 
  - add cli options (port number and the likes)
  - add colors
*/