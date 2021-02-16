//Require Mongoose
const mongoose = require('mongoose');
const TimeLineEvent = require('../models/timelineevent');

//Define a schema
let Schema = mongoose.Schema;

let GameSessionSchema = new Schema({
    name: {type: String, required: true},
    gameMasterId : {type: Schema.Types.ObjectId, ref: 'GameMaster', required: true},
    lastEventId: {type: Schema.Types.ObjectId, ref: 'TimelineEvent', required: false},
    //lastEventDate: {type: Date, required: false}
});

GameSessionSchema.pre('deleteOne', function(next) {
    TimeLineEvent.deleteMany({gameSessionId: this.getQuery()['_id']}).exec();
    next();
});

//Export function to create "SomeModel" model class
module.exports = mongoose.model('GameSession', GameSessionSchema );