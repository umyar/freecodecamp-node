require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const PersonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: Number,
  favoriteFoods: [String],
});

let Person = mongoose.model('Person', PersonSchema);

const createAndSavePerson = async done => {
  const newPerson = new Person({ name: 'John', age: 25, favoriteFoods: ['shaurma'] });

  try {
    const personDoc = await newPerson.save();
    done(null, personDoc);
  } catch (error) {
    done(error);
  }
};

const createManyPeople = async (arrayOfPeople, done) => {
  try {
    const newPersons = await Person.create(arrayOfPeople);
    done(null, newPersons);
  } catch (error) {
    done(error);
  }
};

const findPeopleByName = async (personName, done) => {
  try {
    const foundEntries = await Person.find({ name: personName }).exec();
    done(null, foundEntries);
  } catch (error) {
    done(error);
  }
};

const findOneByFood = async (food, done) => {
  try {
    const foundEntry = await Person.findOne({ favoriteFoods: food }).exec();
    done(null, foundEntry);
  } catch (error) {
    done(error);
  }
};

const findPersonById = async (personId, done) => {
  try {
    const foundEntry = await Person.findById({ _id: personId });
    done(null, foundEntry);
  } catch (error) {
    done(error);
  }
};

const findEditThenSave = async (personId, done) => {
  const foodToAdd = 'hamburger';

  try {
    const neededPerson = await Person.findById({ _id: personId });
    neededPerson.favoriteFoods = [...neededPerson.favoriteFoods, foodToAdd];
    const saveResult = await neededPerson.save();
    done(null, saveResult);
  } catch (e) {
    done(e);
  }
};

const findAndUpdate = async (personName, done) => {
  const ageToSet = 20;

  try {
    const updatedPerson = await Person.findOneAndUpdate(
      { name: personName },
      {
        $set: { age: ageToSet },
      },
      { new: true },
    );

    done(null, updatedPerson);
  } catch (e) {
    done(e);
  }
};

const removeById = async (personId, done) => {
  try {
    const deletionResult = await Person.findByIdAndDelete(personId);
    done(null, deletionResult);
  } catch (e) {
    done(e);
  }
};

const removeManyPeople = async done => {
  const nameToRemove = 'Mary';

  try {
    const deletionResult = await Person.deleteMany({ name: nameToRemove }).exec();
    done(null, deletionResult);
  } catch (e) {
    done(e);
  }
};

const queryChain = async done => {
  const foodToSearch = 'burrito';

  try {
    const foundItems = await Person.find({ favoriteFoods: foodToSearch }).sort('name').limit(2).select('-age').exec();
    done(null, foundItems);
  } catch (e) {
    done(e);
  }
};

/** **Well Done !!**
 /* You completed these challenges, let's go celebrate !
 */

//----- **DO NOT EDIT BELOW THIS LINE** ----------------------------------

exports.PersonModel = Person;
exports.createAndSavePerson = createAndSavePerson;
exports.findPeopleByName = findPeopleByName;
exports.findOneByFood = findOneByFood;
exports.findPersonById = findPersonById;
exports.findEditThenSave = findEditThenSave;
exports.findAndUpdate = findAndUpdate;
exports.createManyPeople = createManyPeople;
exports.removeById = removeById;
exports.removeManyPeople = removeManyPeople;
exports.queryChain = queryChain;
