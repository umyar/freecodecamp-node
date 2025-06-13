const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();
const mongoose = require('mongoose');

const app = express();

/**
 * All the code is listed below (middlewares, db stuff, utils, etc).
 * Just assume that IRL everything will probably be stored in a separate modules/files.
 */

const INVALID_URL_ERROR = { error: 'invalid url' };
const INVALID_SHORT_URL = { error: 'original url not found for a provided short url' };
const DEFAULT_PROTOCOL = 'https://';

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const ExerciseSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  date: { type: Date, required: true },
});

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
});

const LogItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  duration: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer',
    },
  },
  date: { type: Date, required: true },
});

const LogSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer',
    },
    required: true,
  },
  log: [LogItemSchema],
});


const UrlPairModel = mongoose.model('UrlPair', UrlPairSchema);

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
