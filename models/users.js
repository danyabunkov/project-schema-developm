'use strict'
const mongoose = require('mongoose');


const horseSchema = new mongoose.Schema({
  username: String,
  login: String,
  password: String
});


module.exports = mongoose.model('Users', horseSchema);
