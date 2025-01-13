let express = require('express');
let app = express();
require('dotenv').config();

const MESSAGE = 'Hello json';

const loggerMiddleware = (req, res, next) => {
  console.log(req.method + ' ' + req.path + ' - ' + req.ip);
  next();
};

app.use(loggerMiddleware);

app.use('/public', express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/json', (req, res) => {
  const responseMessage = process.env.MESSAGE_STYLE === 'uppercase' ? MESSAGE.toUpperCase() : MESSAGE;

  res.json({ message: responseMessage });
});


app.get(
  '/now',
  (req, res, next) => {
    req.time = new Date().toString();
    next();
  },
  (req, res) => {
    res.json({ time: req.time });
  },
);


// app.get('/now', (req, res, next) => {
//   req.time = new Date().toString();
//   next();
// });
//
// app.get('/placeholder', (req, res) => {
//   res.send('placeholder');
// });
//
// app.get('/now', (req, res, next) => {
//   res.json({ time: req.time });
// });

module.exports = app;
