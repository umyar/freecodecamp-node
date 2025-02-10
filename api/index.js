const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
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

const UrlPairSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortUrl: {
    type: String,
    required: true,
    unique: true,
  },
  uniqSubstring: {
    type: String,
    required: true,
    unique: true,
  },
  ip: String,
  ipVersion: String,
});

const UrlPairModel = mongoose.model('UrlPair', UrlPairSchema);

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const submittedUrlValidationMiddleware = async (req, res, next) => {
  const originalUrl = req.body.url;
  const domainOnlyUrl = originalUrl;

  // const isValidUrl = originalUrl ? checkTheUrl(originalUrl) : false;
  //
  // if (!isValidUrl) {
  //   return res.json(INVALID_URL_ERROR);
  // }

  // console.log('originalUrl', originalUrl);

  dns.lookup(domainOnlyUrl, (error, address, ipVersion) => {
    if (error) {
      console.log(error);
      return res.json(INVALID_URL_ERROR);
    }

    req.urlData = {
      originalUrl: domainOnlyUrl,
      ip: address,
      ipVersion,
    };

    next();
  });
};

const newUniqShortSubstringGeneratorMiddleware = async (req, res, next) => {
  /**
   * For sure here should be something better than just number of links increment XD
   */
  try {
    const totalRecordsNumber = await UrlPairModel.countDocuments().exec();
    const substring = String(totalRecordsNumber + 1);

    const existingUrlData = await UrlPairModel.findOne({ uniqSubstring: substring }).exec();
    if (existingUrlData) {
      req.shortUrlSubstring = substring + 'a';
    } else {
      req.shortUrlSubstring = substring;
    }
  } catch (e) {
    res.json({ error: e || 'Something went wrong. (ERR_CODE: uniqSubstringGeneration)' });
  }

  next();
};

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

app.post(
  '/api/shorturl',
  submittedUrlValidationMiddleware,
  newUniqShortSubstringGeneratorMiddleware,
  async (req, res) => {
    const {
      urlData: { originalUrl, ip, ipVersion },
      shortUrlSubstring,
    } = req;

    const shortUrl = new URL(shortUrlSubstring, process.env.SHORTENER_SERVICE_BASE_URL);

    const newUrlPair = new UrlPairModel({ originalUrl, shortUrl, ip, ipVersion, uniqSubstring: shortUrlSubstring });

    try {
      await newUrlPair.save();
      res.json({ original_url: originalUrl, short_url: shortUrl });
    } catch (e) {
      res.json({ error: e || 'Something went wrong. (ERR_CODE: newUrlPair)' });
    }
  },
);

app.get('/api/shorturl/:substring', async (req, res) => {
  const { substring } = req.params;

  const foundUrlData = await UrlPairModel.findOne({ uniqSubstring: substring }).exec();

  if (foundUrlData) {
    // TODO: handle protocol better
    const redirectUrl = DEFAULT_PROTOCOL + foundUrlData.originalUrl;
    res.redirect(redirectUrl);
  } else {
    res.json(INVALID_SHORT_URL);
  }
});

const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

/**
 * temp implementation
 */
const checkTheUrl = urlString => {
  try {
    return Boolean(new URL(urlString));
  } catch (e) {
    return false;
  }
};
