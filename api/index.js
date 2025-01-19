// index.js
// where your node app starts

// init project
const express = require('express');
const path = require('path');
const app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
const cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static(path.join(__dirname, '..', 'public')));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

// your first API endpoint...
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api', function (req, res) {
  const now = new Date();

  res.json({ unix: now.valueOf(), utc: now.toUTCString() });
});

app.get('/api/:time', (req, res) => {
  const { time } = req.params;

  try {
    if (isDateInvalid(time) && isDateInvalid(time * 1000)) {
      res.json({ error: 'Invalid Date' });
    }

    if (isDateInvalid(time) && !isDateInvalid(time * 1000)) {
      const parsedTime = new Date(time * 1000);
      res.json({ unix: time, utc: parsedTime.toUTCString() });
    } else {
      const parsedTime = new Date(time);
      res.json({ unix: parsedTime.valueOf(), utc: parsedTime.toUTCString() });
    }
  } catch (e) {
    res.json({ error: e });
  }
});

function isDateInvalid(dateStr) {
  return isNaN(new Date(dateStr));
}

// Listen on port set in environment variable or default to 3000
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
