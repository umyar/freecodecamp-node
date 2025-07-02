const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');

require('dotenv').config();

// const mongoose = require('mongoose');
const app = express();
// const upload = multer({ dest: 'uploads/' });
const upload = multer({
  dest: path.join('/tmp'),
});

/**
 * All the code is listed below (middlewares, db stuff, utils, etc).
 * Just assume that IRL everything will probably be stored in a separate modules/files.
 */

// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

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

app.post('/api/fileanalyse', upload.single('upfile'), async function (req, res) {
  const { file } = req;

  res.json({ name: file.originalname, type: file.mimetype, size: file.size });
});

const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
