var async = require('async');
const { body,validationResult } = require("express-validator");

var mongoose = require('mongoose');
var GameSession = require('../models/gamesession');
var TimeLineEvent = require('../models/timelineevent');
var GameMaster = require('../models/gamemaster');
var ActionTimeDefault = require('../models/atd');
var CollectedEvent = require('../models/collectedevent');




// Display timeline for one session
exports.load = function(req, res, next) {

    var gameMaster = req.session.gameMaster;

    async.parallel({
        gameSession: function(callback) {
            GameSession.findById(req.params.gsid)
                .exec(callback)
        },
        timeline: function(callback) {
            TimeLineEvent.find({ 'gameSessionId': req.params.gsid })
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
            //console.log(item.name);
           /* if (item.deltas) {
                for (var delta of item.deltas) {
                    console.log('delta:'+delta);
                }
                item.deltas.set('Repair', 5);
            }*/
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
        } );
    });
};

exports.timeline_event_create = function(req, res, next) {

    var importEventID = req.body.importEvent;
    console.log('importEventID:'+importEventID);

    if (importEventID=='unselected') {
        var timeLineEvent = new TimeLineEvent(
            {
                name: req.body.newEventName,
                gameSessionId: req.params.gsid,
                time: req.body.newEventTime,
                color: '#808080'
            }
        );

        timeLineEvent.save(function (err) {
            if (err) {
                return next(err);
            }
            res.redirect('/timeline/' + req.params.gsid );
        });
    }
    else {

        CollectedEvent.findById(importEventID)
            .exec(function (err, collectedEvent) {
                if (err) { return next(err); }
                var timeLineEvent = new TimeLineEvent(
                    {
                        name: collectedEvent.name,
                        gameSessionId: req.params.gsid,
                        time: 0,
                        color: collectedEvent.color,
                        deltas: collectedEvent.deltas
                    }
                );
                timeLineEvent.save(function (err) {
                    if (err) {
                        return next(err);
                    }
                    res.redirect('/timeline/' + req.params.gsid);
                });
            });
    }


}

exports.timeline_event_update = function(req, res, next) {


    //var gameMaster = req.session.gameMaster;

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
            var err = new Error('GameSession not found');
            err.status = 404;
            return next(err);
        }
        var actionParams;


        //Need to only change one of the time properties at a time
        var stun = req.body.stun;
        console.log('stun param :'+stun);


        if(isNaN(stun)) {
            // stun wasn't passed, try others
            var actionTime = req.body.actionTime;
            console.log('actionTime param:'+actionTime);

            if (isNaN(actionTime)) {
                //actionTime not passed, must be time
                var time = req.body.time;
                if (isNaN(time)) {
                    var color = req.body.color;
                    if (color) {
                        console.log('color param :'+color);
                        actionParams = {color: color};
                    }
                    else {
                        var hidden = req.body.hidden;
                        //because hidden is a checkbox it is only sent if checked
                        //so this should be the last param to check in this chain
                        //untill i figure out how to  update more than one model value at once
                        if (hidden) {
                            console.log('hidden param:'+hidden);
                            actionParams = {hidden: true};
                        }
                        else {
                            console.log('no hidden param, must be false');
                            actionParams = {hidden: false};
                        }

                    }
                }
                else {
                    console.log('time param:' + time);
                    actionParams = {time: time};
                }

            }
            else {
                actionTime = Number(actionTime) + Number(results.timeLineEvent.time);
                console.log('new actionTime:' + actionTime);
                actionParams = {time: actionTime};
            }

        }
        else {
            actionParams = {stun: stun};
        }
        console.log('actionParams :'+actionParams);

        if (actionParams) {
            TimeLineEvent.findByIdAndUpdate(req.params.tid, actionParams, {}, function (err) {
                if (err) {
                    return next(err);
                }
            });
        }
        res.redirect('/timeline/'+results.timeLineEvent.gameSessionId);
        //});

    });

};


exports.timeline_event_delete = function(req, res, next) {

    TimeLineEvent.deleteOne({_id:req.params.tid}, function deleteTimelineEvent(err) {
        if (err) { return next(err); }
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
                res.redirect('/timeline/' + req.params.gsid);
            });
        }
    );
};



exports.timeline_event_collect = function(req, res, next) {
    TimeLineEvent.findById(req.params.tid).exec(
        function(err, doc) {
            var collectedEvent = new CollectedEvent(
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
            var err = new Error('timeLineEvent not found');
            err.status = 404;
            return next(err);
        }
        var temp = new TimeLineEvent();

        for (var item of results.actionTimes) {
            console.log('item.name:'+item.name);
            console.log('req.body[item.name]:'+req.body[item.name]);

            temp.deltas.set(item.name, req.body[item.name]);
        }
        //console.log('temp.deltas:'+temp.deltas);

        var actionParams = {deltas: temp.deltas};

        console.log(actionParams);
        TimeLineEvent.findByIdAndUpdate(req.params.tid, actionParams, {}, function (err) {
            if (err) {
                return next(err);
            }
            res.redirect('/timeline/'+req.params.gsid);
        });

    });

};