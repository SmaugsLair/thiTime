//Require Mongoose
const mongoose = require('mongoose');

//Define a schema
let Schema = mongoose.Schema;

let ActionTimeDefaultSchema = new Schema({
    name: {type: String, required: true},
    time: {type: Number, required: true}
});

//Export function to create "SomeModel" model class
module.exports = mongoose.model('ActionTimeDefaultModel', ActionTimeDefaultSchema );