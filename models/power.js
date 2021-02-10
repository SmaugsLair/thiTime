//Require Mongoose
const mongoose = require('mongoose');

//Define a schema
let Schema = mongoose.Schema;

let PowerSchema = new Schema({
    name: {type: String, required: true},
    shortDescr:{type: String, required: true},
    fullDescr:{type: String, required: true},
    powerTag:{type: String, required: true},
    assRules_text:{type: String, required: false},
    prerequisite:{type: [String], required: false},
    maxTaken:{type: Number, required: true, default: 1},
    abilityMods: {
        type: Map, of: Number,
        default: {},
        required: true}
});

module.exports = mongoose.model('PowerModel', PowerSchema );