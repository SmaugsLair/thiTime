//Require Mongoose
const mongoose = require('mongoose');

//Define a schema
let Schema = mongoose.Schema;

let TimeLineEventSchema = new Schema({
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
    //below are workarounds for virtual class not working in JQuery table library
    rowClass: {type: String, default:''},
    actionValue: {type: String, default:''},
    actionTitle: {type: String, default:''}
    //eventType: enum //player, npc, gm
});


TimeLineEventSchema
    .virtual('deltaCount')
    .get(function () {
        let count = 0;
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
        let value = 'Adjust Deltas'
        this.deltas.forEach((delta, key) => {
            if (delta != 0) {
                value += '\n'+key+':'+delta;
            }
        })
        return value;
    });
/*
TimeLineEventSchema.methods.rowClass = function() {
    if (this.lastEvent) {
        return 'lastEvent';
    }
    return '';
  };*/

module.exports = mongoose.model('TimeLineEventModel', TimeLineEventSchema );