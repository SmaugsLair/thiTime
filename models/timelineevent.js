//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var TimeLineEventSchema = new Schema({
    name: {type: String, required: true},
    gameSessionId: {type: Schema.Types.ObjectId, ref: 'GameSession', required: true},
    time: {type: Number, required: true},
    reactTime: {type: Number},
    stun: {type: Number, required: true, default: 0, min: 0},
    color: {type: String},
    deltas: {type: Map, of: Number,
        default: {'Thought': 0, 'Twitch': 0, 'Move': 0, 'Perception': 0, 'Targeted': 0, 'Full Round': 0, 'Recovery': 0, 'Repair': 0}},
    hidden: {type: Boolean, required: true, default: false},
    lastEvent: {type: Boolean, required: false, default: false},
    //eventType: enum //player, npc, gm
});


TimeLineEventSchema
    .virtual('deltaCount')
    .get(function () {
        var count = 0;
        this.deltas.forEach((delta, key) => {
            if (delta != 0) {
                count += 1;
            }
        })
        return count;
    });

TimeLineEventSchema
    .virtual('deltaString')
    .get(function () {
        var value = 'Adjust Deltas'
        this.deltas.forEach((delta, key) => {
            if (delta != 0) {
                value += '\n'+key+':'+delta;
            }
        })
        return value;
    });

module.exports = mongoose.model('TimeLineEventModel', TimeLineEventSchema );