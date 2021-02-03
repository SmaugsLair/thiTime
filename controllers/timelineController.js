const async = require('async');

const mongoose = require('mongoose');
const GameSession = require('../models/gamesession');
const TimeLineEvent = require('../models/timelineevent');
const ActionTimeDefault = require('../models/atd');
const CollectedEvent = require('../models/collectedevent');
const ws = require('../websocket')




// Display timeline for one session
exports.load = function(req, res, next) {

    const gameMaster = req.session.gameMaster;
    const gsid = req.params.gsid;

    async.parallel({
        gameSession: function(callback) {
            GameSession.findById(gsid)
                .exec(callback)
        },
        timeline: function(callback) {
            TimeLineEvent.find({ 'gameSessionId': gsid })
                //.populate('deltas')
                .sort('time')
                .exec(callback)
        },
        actionTimes: function(callback) {
            ActionTimeDefault.find({}, 'name time')
                .exec(callback)
        },
        collectedEvents: function(callback) {
            CollectedEvent.find({ 'gameMasterId': gameMaster._id })
                .exec(callback)
        },
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        if (results.gameSession==null) { // No results.
            const error = new Error('GameSession not found');
            error.status = 404;
            return next(error);
        }
        // Successful, so render.
        const lastEventId = results.gameSession.lastEventId;
        if (lastEventId) {
            let lastEventTime;
            for (let item of results.timeline) {
                if (lastEventId.equals(item._id)) {
                    lastEventTime = item.time;
                    item.lastEvent = true;
                }
            }
            for (let event of results.timeline) {
                event.reactTime = lastEventTime - event.time;
            }
        }
        else {
            for (let item of results.timeline) {
                item.reactTime = 0;
            }
        }
        //Added in the pug, keeping this here to remind me how to do it if needed elsewhere
        //var unselected = new ActionTimeDefault(
        //    {name: 'Choose one', time: 0}
        //);
        //results.actionTimes.unshift(unselected);
        //console.log(results.actionTimes);
        res.render('timeline', { title: 'Timeline',
            gameSession: results.gameSession,
            timeline: results.timeline,
            gameMaster: gameMaster,
            actionTimes: results.actionTimes,
            collectedEvents: results.collectedEvents,
            //announce: true
        } );
    });
};

exports.timeline_event_create = function(req, res, next) {
    const timeLineEvent = new TimeLineEvent(
        {
            name: req.body.newEventName,
            gameSessionId: req.params.gsid,
            time: req.body.newEventTime,
            color: req.body.color,
            stun: req.body.stun,
            hidden: (req.body.hidden? true : false)
        });

    timeLineEvent.save(function (err) {
        if (err) {
            return next(err);
        }
        ws.gameUpdate(req.params.gsid);
        res.redirect('/timeline/' + req.params.gsid);
    });
}



exports.timeline_event_import = function(req, res, next) {

    const importEventID = req.body.importEvent;
    CollectedEvent.findById(importEventID)
        .exec(function (err, collectedEvent) {
            if (err) { return next(err); }
            const timeLineEvent = new TimeLineEvent(
                {
                    name: collectedEvent.name,
                    gameSessionId: req.params.gsid,
                    time: 0,
                    color: collectedEvent.color,
                    deltas: collectedEvent.deltas,
                    hidden: true
                }
            );
            timeLineEvent.save(function (err) {
                if (err) {
                    return next(err);
                }
                ws.gameUpdate(req.params.gsid);
                res.redirect('/timeline/' + req.params.gsid);
            });
        });
}

exports.timeline_event_update = function(req, res, next) {

    async.parallel({
        timeLineEvent: function(callback) {
            TimeLineEvent.findById(req.params.tid)
                .exec(callback)
        },
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        if (results.timeLineEvent == null) { // No results.
            let err = new Error('GameSession not found');
            err.status = 404;
            return next(err);
        }
        let sessionParam;/* = {
            lastEventDate: Date()
        };*/

        let name = req.body.name;
        if (!name) {
            name = results.timeLineEvent.name;
        }

        let stun = req.body.stun;
        if (isNaN(stun)) {
            stun = results.timeLineEvent.stun;
        }

        let time = req.body.time;
        if (isNaN(time)) {
            time = Number(results.timeLineEvent.time);
        }
        else {
            time = Number(time);
        }


        let color = req.body.color;
        if (!color) {
            color = results.timeLineEvent.color;
        }

        let actionTime = req.body.actionTime;
        if (!isNaN(actionTime) && actionTime > 0) {
            time = Number(actionTime) +time;
            sessionParam = {
                lastEventId: results.timeLineEvent._id
                /*lastEventDate: Date()*/
            };
        }


        const hidden = (req.body.hidden? true: false);


        let actionParams = {
            name: name,
            stun: stun,
            time: time,
            color: color,
            hidden: hidden
        };
        async.parallel({
            gameSessionUpdate: function(callback) {
                if (sessionParam) {
                    GameSession.findByIdAndUpdate(results.timeLineEvent.gameSessionId, sessionParam, {})
                        .exec(callback);
                }
            },
            timelineUpdate: function(callback) {
                if (actionParams) {
                    TimeLineEvent.findByIdAndUpdate(req.params.tid, actionParams, {})
                        .exec(callback);
                }
            }
        }, function(err, updates) {
            if (err) {
                return next(err);
            }
        });
        ws.gameUpdate(results.timeLineEvent.gameSessionId);
        res.redirect('/timeline/'+results.timeLineEvent.gameSessionId);

    });

};


exports.timeline_event_delete = function(req, res, next) {

    TimeLineEvent.deleteOne({_id:req.params.tid}, function deleteTimelineEvent(err) {
        if (err) { return next(err); }
        ws.gameUpdate(req.params.gsid);
        res.redirect('/timeline/'+req.params.gsid);
    })
};


exports.timeline_event_clone = function(req, res, next) {
    TimeLineEvent.findById(req.params.tid).exec(
        function(err, doc) {
            doc._id = mongoose.Types.ObjectId();
            doc.isNew = true; //<--------------------IMPORTANT
            doc.save(function (err) {
                if (err) {
                    return next(err);
                }
                ws.gameUpdate(req.params.gsid);
                res.redirect('/timeline/' + req.params.gsid);
            });
        }
    );
};



exports.timeline_event_collect = function(req, res, next) {
    TimeLineEvent.findById(req.params.tid).exec(
        function(err, doc) {
            const collectedEvent = new CollectedEvent(
                { name: doc.name,
                    gameMasterId: req.session.gameMaster._id,
                    color: doc.color,
                    deltas: doc.deltas
                }
            )
            collectedEvent.save(function (err) {
                if (err) {
                    return next(err);
                }
                res.redirect('/timeline/' + req.params.gsid);
            });
        }
    );
};



exports.timeline_event_updateDeltas = function(req, res, next) {

    async.parallel({
        timeLineEvent: function(callback) {
            TimeLineEvent.findById(req.params.tid)
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
        if (results.timeLineEvent == null) { // No results.
            let err = new Error('timeLineEvent not found');
            err.status = 404;
            return next(err);
        }
        let temp = new TimeLineEvent();

        for (let item of results.actionTimes) {
            temp.deltas.set(item.name, req.body[item.name]);
        }

        let actionParams = {deltas: temp.deltas};

        TimeLineEvent.findByIdAndUpdate(req.params.tid, actionParams, {}, function (err) {
            if (err) {
                return next(err);
            }
            ws.gameUpdate(req.params.gsid);
            res.redirect('/timeline/'+req.params.gsid);
        });

    });

};