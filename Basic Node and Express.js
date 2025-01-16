const express = require('express');
const app = express();
require('dotenv').config();
const bodyParser = require('body-parser');

const MESSAGE = 'Hello json';

const loggerMiddleware = (req, res, next) => {
  console.log(req.method + ' ' + req.path + ' - ' + req.ip);
  next();
};

app.use(loggerMiddleware);
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/json', (req, res) => {
  const responseMessage = process.env.MESSAGE_STYLE === 'uppercase' ? MESSAGE.toUpperCase() : MESSAGE;

  res.json({ message: responseMessage });
});

app.get('/:word/echo', (req, res) => {
  const { word } = req.params;

  res.json({ echo: word });
});

const namePostHandlerFn = (req, res) => {
  res.json({ name: `${req.body.first} ${req.body.last}` });
};

app.post('/name', namePostHandlerFn);

module.exports = app;
