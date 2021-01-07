//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var GameMasterSchema = new Schema({
    name: {type: String, required: true},
    password: {type: String, required: true}
});

GameMasterSchema
    .virtual('url')
    .get(function () {
        return '/gm/' + this._id;
    });

//Export function to create "SomeModel" model class
module.exports = mongoose.model('GameMasterModel', GameMasterSchema );