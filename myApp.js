let express = require('express');
let path = require('path');
let app = express();

// Normal usage
app.use(express.static(__dirname + "/public"));

// Assets at the /public route
app.use("/public", express.static(__dirname + "/public"));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

module.exports = app;
