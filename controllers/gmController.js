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
            if (err) {
                return next(err);
            }
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

exports.update = function (req, res, next) {
    var gameMaster = req.session.gameMaster;
    res.render('gm_update',
        { title: 'Game Master Update',
            gameMaster: gameMaster}
            );
}

exports.applyUpdate = function (req, res, next) {

    var gameMaster = req.session.gameMaster;
    var params = {
        name: req.body.username,
        displayName: req.body.displayName,
        email: req.body.email
    };
    GameMaster.findByIdAndUpdate(gameMaster._id, params, {new:true}, function (err, result) {
        if (err) {
            return next(err);
        }
        req.session.gameMaster = result;
        res.redirect('/updateGM');
    });
}

exports.updatePassword = function (req, res, next) {
    var gameMaster = req.session.gameMaster;
    res.render('password_update',
        { title: 'Password Update',
            gameMaster: gameMaster}
    );
}

exports.applyUpdatePassword = function (req, res, next) {
    var gameMaster = req.session.gameMaster;
    var password = req.body.password1;
    var confirm = req.body.password2;
    var error;
    if (password) {
        if (password === confirm) {
            var regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}$/;
            if (password.match(regex)) {
                var temp = new GameMaster()
                temp.setPassword(password);
                var params = {
                    hash: temp.hash,
                    salt: temp.salt
                };
                GameMaster.findByIdAndUpdate(gameMaster._id, params, {}, function (err, result) {
                    if (err) {
                        return next(err);
                    }
                    req.session.reset();
                    res.render('login', {title: 'Login', error:'Successful update! Please login again.'});
                });
            }
            else {
                error = 'Password must be between 8 and 16 characters and contain at least one of each:'
                    +' digit, lower case character, upper case character.';
            }
        }
        else {
            error = 'Password mismatch';
        }
    }
    else {
        error = 'Supply a password';
    }
    if (error) {
        res.render('password_update',
            {
                title: 'Password Update',
                gameMaster: gameMaster,
                error: error
            }
        );
    }

}

