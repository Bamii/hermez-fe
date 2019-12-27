const express = require('express');
const path = require('path');
const app = express();
const sh = require('./serverHandler');

app.use(express.static(path.join(__dirname, 'dist')));

// render the app
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// app routes;
sh(app);

app.listen(9000, (s) => {
  // listening
  // open the browser.
  console.log('server is running on ' + 9000);
});
