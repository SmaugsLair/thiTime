const GameMaster = require('../models/user');
const async = require('async');
const GameSession = require('../models/gamesession');
const TimeLineEvent = require('../models/timelineevent');
const ActionTimeDefault = require('../models/atd');
const DiceRollLog = require('../models/dicerolllog')

exports.playerSessions = function(req, res, next) {

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
            user: req.session.user,
        } );
    });
};


exports.playerSession = function(req, res, next) {
    async.parallel({
        gameMaster: function(callback) {
            GameMaster.findById(req.params.gmid)
                .exec(callback)
        },
        gameSession: function(callback) {
            GameSession.findById(req.params.gsid)
                .exec(callback)
        },
        diceLog: function(callback) {
            DiceRollLog.find({ 'gameSessionId': req.params.gsid })
                .sort('-time')
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

        res.render('playerSession', { title: 'Timeline',
            gameSession: results.gameSession,
            gm: results.gameMaster,
            user: req.session.user,
            diceLog: results.diceLog,
            js: 'playerSession.js'
        } );
    });
};



exports.playerTimeline = function(req, res, next) {
    async.parallel({
        gameSession: function(callback) {
            GameSession.findById(req.params.gsid)
                .exec(callback)
        },
        timeline: function(callback) {
            TimeLineEvent.find({ 'gameSessionId': req.params.gsid, 'hidden': false })
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
                    //console.log('last event was for:'+item.name);
                    lastEventTime = item.time;
                    item.lastEvent = true;
                    item.rowClass = 'lastEvent';
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

        for (let item of results.timeline) {
            let titleString = 'Action (TU) *=Can react\n__________________\n';
            let foundOne = false;
            for (let actionTime of results.actionTimes) {
                let total = actionTime.time + item.stun + (item.deltas ? item.deltas.get(actionTime.name) : 0);
                let reaction = (total <= item.reactTime ? '*' : '');
                foundOne = (reaction ? true : foundOne);
                titleString += '\n' + actionTime.name + ' (' + total + ') ' + reaction;
            }
            item.actionValue = foundOne ? '*' : '';
            item.actionTitle = titleString;
        }
        res.setHeader('Content-Type', 'application/json');
        res.send({
            timeline: results.timeline,
            actionTimes: results.actionTimes,
        } );
    });
};
