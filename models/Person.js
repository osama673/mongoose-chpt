const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PersonSchema = new Schema({
  name: {
    type: String,
    required: [true, "The field is required"],
  },
  age: Number,
  favoriteFoods: [String],
});

module.exports = Person = mongoose.model("Person", PersonSchema);
