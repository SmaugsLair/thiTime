//Require Mongoose
const mongoose = require('mongoose');
const crypto = require('crypto');

//Define a schema
let Schema = mongoose.Schema;

let UserSchema = new Schema({
    name: {type: String, required: true, unique:true},
    password: {type: String, required: false},
    displayName: {type: String, required: false},
    email: {type: String, required: true},
    hash: {type: String, required: true},
    salt: {type: String, required: true},
});

UserSchema.methods.setPassword = function(password) {

    // Creating a unique salt for a particular user
    this.salt = crypto.randomBytes(16).toString('hex');

    // Hashing user's salt and password with 1000 iterations, 64 length and sha512 digest
    this.hash = crypto.pbkdf2Sync(password, this.salt,
        1000, 64, `sha512`).toString(`hex`);
};

UserSchema.methods.validPassword = function(password) {
    if (this.salt) {
        let hash = crypto.pbkdf2Sync(password,
            this.salt, 1000, 64, `sha512`).toString(`hex`);
        return hash === this.hash;
    }
    return false;
};

UserSchema
    .virtual('url')
    .get(function () {
        return '/gm/' + this._id;
    });

//Export function to create "SomeModel" model class
module.exports = mongoose.model('User', UserSchema );