#! /usr/bin/env node

console.log('This script populates the default action times. Specified database as argument - e.g.: defaultSetup mongodb://127.0.0.1/thiTime');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var ActionTimeDefault = require('./models/atd')

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var atds = []

function atdCreate(name, time, cb) {
    var atd = new ActionTimeDefault({name:name, time:time});
    //authordetail = {first_name:first_name , family_name: family_name }
    //if (d_birth != false) authordetail.date_of_birth = d_birth
    //if (d_death != false) authordetail.date_of_death = d_death

    //var author = new Author(authordetail);

    atd.save(function (err) {
        if (err) {
            cb(err, null)
            return
        }
        console.log('New atd: ' + atd);
        atds.push(atd)
        cb(null, atd)
    }  );
}



function createAtds(cb) {
    async.series([
            function(callback) {
                atdCreate('Thought', 3, callback);
            },
            function(callback) {
                atdCreate('Twitch', 4, callback);
            },
            function(callback) {
                atdCreate('Move', 5, callback);
            },
            function(callback) {
                atdCreate('Perception', 5, callback);
            },
            function(callback) {
                atdCreate('Targeted', 7, callback);
            },
            function(callback) {
                atdCreate('Full Round', 10, callback);
            },
            function(callback) {
                atdCreate('Recovery', 10, callback);
            },
            function(callback) {
                atdCreate('Repair', 10, callback);
            }
        ],
        // optional callback
        cb);
}

async.series([
        createAtds,
    ],
// Optional callback
    function(err, results) {
        if (err) {
            console.log('FINAL ERR: '+err);
        }
        else {
            console.log('atds: '+atds);

        }
        // All done, disconnect from database
        mongoose.connection.close();
    });



