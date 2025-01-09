let express = require('express');
let app = express();

// app.use("/", express.static(__dirname + "/public"));
app.use("/public", express.static(__dirname + "/public/css-files"));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

module.exports = app;