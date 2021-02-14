//Require Mongoose
const mongoose = require('mongoose');

//Define a schema
let Schema = mongoose.Schema;


function numberOrFormula (value) {
    if (value) {
        if (isNaN(value)) {
            return value.startsWith('formula=');
        }
        return true;
    }
    return false;
}

let PowerSchema = new Schema({
    name: {type: String, required: true},
    shortDescr:{type: String, required: false},
    fullDescr:{type: String, required: false},
    powerTag:{type: String, required: false},
    assRules:{type: String, required: false},
    prerequisite:{type: [String], required: false},
    maxTaken:{type: String, required: true,
        validate: {
            validator: val => numberOrFormula(val),
            message: 'Must be a Number or a formula'
}
    },
    abilityMods: {type: [String], required: true},
    powerSets: {type: [String], required:false}
});


module.exports = mongoose.model('Power', PowerSchema );