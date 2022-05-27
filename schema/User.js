var mongoose = require('mongoose');

// Define schema
var Schema = mongoose.Schema;

var userSchema = new Schema({
  id: String,
  email: String,
  password: String
});

// Compile model from schema
var SomeModel = mongoose.model('User', userSchema );