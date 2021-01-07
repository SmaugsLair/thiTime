//Require Mongoose
var mongoose = require('mongoose');
var TimeLineEvent = require('../models/timelineevent');

//Define a schema
var Schema = mongoose.Schema;

var GameSessionSchema = new Schema({
    name: {type: String, required: true},
    gameMasterId : {type: Schema.Types.ObjectId, ref: 'GameMaster', required: true},
});

GameSessionSchema.pre('deleteOne', function(next) {
    TimeLineEvent.deleteMany({gameSessionId: this.getQuery()['_id']}).exec();
    next();
});

//Export function to create "SomeModel" model class
module.exports = mongoose.model('GameSessionModel', GameSessionSchema );