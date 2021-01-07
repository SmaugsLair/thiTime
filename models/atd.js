//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var ActionTimeDefaultSchema = new Schema({
    name: {type: String, required: true},
    time: {type: Number, required: true}
});

//Export function to create "SomeModel" model class
module.exports = mongoose.model('ActionTimeDefaultModel', ActionTimeDefaultSchema );