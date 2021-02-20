//Require Mongoose
const mongoose = require('mongoose');

//Define a schema
let Schema = mongoose.Schema;

let PowerSetSchema = new Schema({
    ssid: {type:String, required: true},
    name: {type: String, required: true},
    //lastUpdate: {type: Date, required: false},
    openText:{type: String, required: true},
    abilityText:{type: String, required: true},
    powersText:{type: String, required: true},
    abilityMods: {
        type: Map, of: Number,
        default: {},
        required: true},
    powers: {
        type: Map, of: [String] //key will be the tier
    }
});

module.exports = mongoose.model('PowerSet', PowerSetSchema );