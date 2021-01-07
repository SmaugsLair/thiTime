var GameMaster = require('../models/gamemaster');
var async = require('async');
var GameSession = require('../models/gamesession');
var TimeLineEvent = require('../models/timelineevent');

exports.playerSessions = function(req, res) {

    async.parallel({
        sessionList: function(callback) {
            GameSession.find({})
                .exec(callback)
        },
        gmList: function(callback) {
            GameMaster.find({})
                .exec(callback)
        }
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        // Successful, so render.

        res.render('playerSessions', { title: 'Player Sessions',
            sessionList: results.sessionList,
            gmList: results.gmList } );
    });
};


exports.playerSession = function(req, res) {

    async.parallel({
        gameMaster: function(callback) {
            GameMaster.findById(req.params.gmid)
                .exec(callback)
        },
        gameSession: function(callback) {
            GameSession.findById(req.params.gsid)
                .exec(callback)
        },
        timeline: function(callback) {
            TimeLineEvent.find({ 'gameSessionId': req.params.gsid, 'hidden': false })
                //.populate('deltas')
                .sort('time')
                .exec(callback)
        }
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        if (results.gameSession==null) { // No results.
            var err = new Error('GameSession not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        var firstTime = null;
        for (var item of results.timeline) {
            if (firstTime == null) {
                firstTime = item.time;
            }
            item.nextAction = item.time - firstTime;
        }
        res.render('playerSession', { title: 'Timeline',
            gameSession: results.gameSession,
            timeline: results.timeline,
            gm: results.gameMaster
        } );
    });
};


