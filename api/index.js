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

const INVALID_USER_ID_ERROR = { error: 'invalid user id' }; // uuid pattern + not empty check?

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
  date: { type: Date },
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

const UserModel = mongoose.model('User', UserSchema);
const ExerciseModel = mongoose.model('Exercise', ExerciseSchema);

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

app.post('/api/users', async function (req, res) {
  const { username } = req.body;

  if (!username) {
    res.status(400).send('username required');
  }

  const newUser = new UserModel({ username });

  try {
    const { _id } = await newUser.save();
    res.json({ username, _id });
  } catch (e) {
    res.status(500).send('Something went wrong while creating user');
  }
});

app.get('/api/users', async function (req, res) {
  try {
    const users = await UserModel.find();
    res.json(users);
  } catch (e) {
    res.status(500).send('Something went wrong while retrieving users');
  }
});

app.post('/api/users/:id/exercises', async function (req, res) {
  const { description, duration, date } = req.body;
  const userId = req.params.id;

  if (!description || !duration || !userId) {
    res.status(400).send('some of necessary params is missed: description, duration, user id');
  }

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(400).send('user with provided ID is not found');
    }

    const dateInNecessaryFormat = date ? new Date(date) : new Date();

    const newExercise = new ExerciseModel({
      description,
      duration,
      date: dateInNecessaryFormat,
      username: user.username,
    });

    const resultObject = await newExercise.save();

    /*
    username: "fcc_test",
    description: "test",
    duration: 60,
    date: "Mon Jan 01 1990",
    _id: "5fb5853f734231456ccb3b05"
   */

    res.json({
      username: resultObject.username,
      description: resultObject.description,
      duration: resultObject.duration,
      date: resultObject.date,
      _id: user._id,
    });
  } catch (e) {
    res.status(500).send('Something went wrong while creating an exercise');
  }
});

app.get('/api/users/:id/logs', async function (req, res) {
  const userId = req.params.id;
  const { from, to, limit } = req.query;

  console.log('🆘 { from, to, limit }', { from, to, limit });

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(400).send('user with provided ID is not found');
    }

    const requestedUsername = user.username;
    const fromTimestamp = from ? Date.parse(from) : null;
    const toTimestamp = to ? Date.parse(to) : null;

    const exercises = await ExerciseModel.find({ username: requestedUsername });
    const aggregatedLogs = exercises.reduce((acc, currentEx) => {
      const currentExTimestamp = Date.parse(currentEx.date);

      if (fromTimestamp && toTimestamp && limit) {
        if (fromTimestamp < currentExTimestamp && toTimestamp > currentExTimestamp && acc.length <= Number(limit)) {
          acc.push({
            description: currentEx.description,
            duration: currentEx.duration,
            date: currentEx.date.toDateString(),
          });
        }
      }

      acc.push({
        description: currentEx.description,
        duration: currentEx.duration,
        date: currentEx.date.toDateString(),
      });

      return acc;
    }, []);

    const returnResult = {
      username: requestedUsername,
      count: exercises.length,
      _id: userId,
      log: aggregatedLogs,
    };

    res.json(returnResult);
  } catch (e) {
    res.status(500).send('Something went wrong while getting user logs');
  }
});

const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
