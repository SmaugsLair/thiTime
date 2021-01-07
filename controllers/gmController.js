var GameMaster = require('../models/gamemaster');
var async = require('async');
var GameSession = require('../models/gamesession');
var CollectedEvent = require('../models/collectedevent');
var ActionTimeDefault = require('../models/atd');


exports.index = function(req, res) {
    res.render('index');
};

// Display list of all gms
exports.gm_list = function(req, res) {
    GameMaster.find({}, 'name')
        .exec(function (err, gms) {
            if (err) { return next(err); }
            //Successful, so render
            console.log('returning');
            //res.json(gms);
            res.render('gms', { title: 'Game Master List', gm_list: gms });
        });
};

exports.gm_detail = function(req, res, next) {
    console.log('gm_detail');

    var gameMaster = req.session.gameMaster;

    console.log('gameMaster:'+gameMaster.name);

    async.parallel({
        gm_sessions: function(callback) {
            GameSession.find({ 'gameMasterId': gameMaster._id },'name')
                .exec(callback)
        }
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        // Successful, so render.
        res.render('gm_detail', { title: 'Game Master Sessions',
            gameMaster: gameMaster,
            gm_sessions: results.gm_sessions } );
    });

};


exports.gm_collection = function(req, res, next) {
    console.log('gm_collection');

    var gameMaster = req.session.gameMaster;

    console.log('gameMaster:'+gameMaster.name);

    async.parallel({
        actionTimes: function(callback) {
            ActionTimeDefault.find({}, 'name time')
                .exec(callback)
        },
        collectedEvents: function(callback) {
            CollectedEvent.find({ 'gameMasterId': gameMaster._id })
                .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        // Successful, so render.
        res.render('gm_collection', { title: 'Game Master Collection',
            gameMaster: gameMaster,
            actionTimes: results.actionTimes,
            collectedEvents: results.collectedEvents } );
    });

};


//POST
exports.collected_event_delete = function(req, res, next) {
    CollectedEvent.deleteOne({_id:req.params.ceid}, function deleteSession(err) {
        if (err) { return next(err); }
        res.redirect('/gm/collection');
    })
};

