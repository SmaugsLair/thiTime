#! /usr/bin/env node

console.log('This script populates the users times. Specified database as argument - e.g.: gmSetup mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var GameMaster = require('./models/gamemaster')

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var gms = []

function gmCreate(name, cb) {
    var gm = new GameMaster({name:name, password:name});
    //authordetail = {first_name:first_name , family_name: family_name }
    //if (d_birth != false) authordetail.date_of_birth = d_birth
    //if (d_death != false) authordetail.date_of_death = d_death

    //var author = new Author(authordetail);

    gm.save(function (err) {
        if (err) {
            cb(err, null)
            return
        }
        console.log('New gm: ' + gm);
        gms.push(gm)
        cb(null, gm)
    }  );
}



function createGms(cb) {
    async.series([
            function(callback) {
                gmCreate('deadandy', callback);
            },
            function(callback) {
                gmCreate('naganalf', callback);
            }
        ],
        // optional callback
        cb);
}

async.series([
        createGms,
    ],
// Optional callback
    function(err, results) {
        if (err) {
            console.log('FINAL ERR: '+err);
        }
        else {
            console.log('gms: '+gms);

        }
        // All done, disconnect from database
        mongoose.connection.close();
    });



