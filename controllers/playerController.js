const GameMaster = require('../models/gamemaster');
const async = require('async');
const GameSession = require('../models/gamesession');
const TimeLineEvent = require('../models/timelineevent');
const ActionTimeDefault = require('../models/atd');

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
            gmList: results.gmList,
            gameMaster: req.session.gameMaster,
        } );
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
            let err = new Error('GameSession not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.

        const lastEventId = results.gameSession.lastEventId;
        if (lastEventId) {
            let lastEventTime;
            for (let item of results.timeline) {
                if (lastEventId.equals(item._id)) {
                    console.log('last event was for:'+item.name);
                    lastEventTime = item.time;
                    item.lastEvent = true;
                }
            }
            for (let item of results.timeline) {
                item.reactTime = lastEventTime - item.time;
            }
        }
        else {
            for (let item of results.timeline) {
                item.reactTime = 0;
            }
        }
        /*if (!results.gameSession.lastEventDate) {
            results.gameSession.lastEventDate = Date();
        }*/
        res.render('playerSession', { title: 'Timeline',
            gameSession: results.gameSession,
            timeline: results.timeline,
            gm: results.gameMaster,
            actionTimes: results.actionTimes,
            gameMaster: req.session.gameMaster,
            refresh: 'refresh',
            foo: 'foo'
        } );
    });
};

/*
exports.lastEventDate = function(req, res) {
    GameSession.findById(req.params.gsid, function(err, gameSession) {
        if (err) {
            return next(err);
        }
        if (gameSession==null) { // No results.
            let err = new Error('GameSession not found');
            err.status = 404;
            return next(err);
        }
        else {
            const time = gameSession.lastEventDate ? gameSession.lastEventDate.getTime() : 0;
            res.json({lastEventDate: time });
        }
    });
};*/
