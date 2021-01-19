var GameMaster = require('../models/gamemaster');
var async = require('async');
var GameSession = require('../models/gamesession');
var TimeLineEvent = require('../models/timelineevent');
var ActionTimeDefault = require('../models/atd');

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

    console.log('playerSession');

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
        },
        actionTimes: function(callback) {
            ActionTimeDefault.find({}, 'name time')
                .exec(callback)
        },
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

        var lastEventId = results.gameSession.lastEventId;
        if (lastEventId) {
            var lastEventTime;
            for (var item of results.timeline) {
                if (lastEventId.equals(item._id)) {
                    console.log('last event was for:'+item.name);
                    lastEventTime = item.time;
                    item.lastEvent = true;
                }
            }
            for (var item of results.timeline) {
                item.reactTime = lastEventTime - item.time;
            }
        }
        else {
            for (var item of results.timeline) {
                item.reactTime = 0;
            }
        }
        if (!results.gameSession.lastEventDate) {
            results.gameSession.lastEventDate = Date();
        }
        res.render('playerSession', { title: 'Timeline',
            gameSession: results.gameSession,
            timeline: results.timeline,
            gm: results.gameMaster,
            actionTimes: results.actionTimes,
            refresh: 'refresh'
        } );
    });
};


exports.lastEventDate = function(req, res) {
    GameSession.findById(req.params.gsid, function(err, gameSession) {
        if (err) {
            return next(err);
        }
        if (gameSession==null) { // No results.
            var err = new Error('GameSession not found');
            err.status = 404;
            return next(err);
        }
        else {
            var time = gameSession.lastEventDate ? gameSession.lastEventDate.getTime() : 0;
            res.json({lastEventDate: time });
        }
    });
};
