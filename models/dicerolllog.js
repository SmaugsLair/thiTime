//Require Mongoose
const mongoose = require('mongoose');

//Define a schema
let Schema = mongoose.Schema;

let DiceRollLogSchema = new Schema({
    entry: {type: String, required: true},
    gameSessionId: {type: Schema.Types.ObjectId, ref: 'GameSession', required: true},
    time: {type: Date, required: true}
});

module.exports = mongoose.model('DiceRollLog', DiceRollLogSchema );