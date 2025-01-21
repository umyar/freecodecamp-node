const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
const cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

app.use(express.static(path.join(__dirname, '..', 'public')));
// app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

/*
  1) { original_url : 'https://freeCodeCamp.org', short_url : 1}
  2) when visit YOUR_APP_URL/api/shorturl/<short_url> you should be redirected to the original_url
  3) dns.lookup(host, cb) from the dns core module to verify a submitted URL
  4) BE validation of the original_url: http://www.example.com, or just send { error: 'invalid url' } - try 4xx?
 */

app.post('/api/shorturl', (req, res) => {
  console.log('req.body', req.body);

  const originalUrl = req.body.original_url;

  res.json({ original_url: originalUrl, short_url: 'lol' });
});

const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
