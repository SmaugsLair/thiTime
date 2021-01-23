//Require Mongoose
const mongoose = require('mongoose');

//Define a schema
let Schema = mongoose.Schema;

let CollectedEventSchema = new Schema({
    name: {type: String, required: true},
    gameMasterId: {type: Schema.Types.ObjectId, ref: 'GameMaster', required: true},
    color: {type: String},
    deltas: {type: Map, of: Number,
        default: {'Thought': 0, 'Twitch': 0, 'Move': 0, 'Perception': 0, 'Targeted': 0, 'Full Round': 0, 'Recovery': 0, 'Repair': 0}},
    //eventType: enum //player, npc, gm
});

module.exports = mongoose.model('CollectedEventModel', CollectedEventSchema );