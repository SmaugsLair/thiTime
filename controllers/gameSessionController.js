const async = require('async');
const GameSession = require('../models/gamesession');
const TimeLineEvent = require('../models/timelineevent');

// Start new session
exports.game_session_create = function(req, res) {
    res.render('newSession', { title: 'New Session', gameMaster: req.session.gameMaster });
};

exports.game_session_save = function(req, res, next) {

    const session = new GameSession(
        {name: req.body.sessionName, gameMasterId: req.session.gameMaster._id}
    );

    session.save(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/gm');
    });
}

//GET
exports.game_session_delete = function(req, res, next) {

    async.parallel({
        gameSession: function(callback) {
            GameSession.findById(req.params.id).exec(callback)
        },
        sessionEvents: function(callback) {
            TimeLineEvent.find({ 'gameSessionId': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.gameSession==null) { // No results.
            res.redirect('/gm');
        }
        // Successful, so render.
        res.render('sessionDelete', { title: 'Delete Session',
            gameSession: results.gameSession,
            sessionEvents: results.sessionEvents,
            gameMaster: req.session.gameMaster} );
    });

};

//POST
exports.game_session_confirm_delete = function(req, res, next) {
    //GameSession.findOneAndDelete({_id:req.body.gameSessionId}, function deleteSession(err) {
    GameSession.deleteOne({_id:req.body.gameSessionId}, function deleteSession(err) {
        if (err) { return next(err); }
        res.redirect('/gm');
    })
};

