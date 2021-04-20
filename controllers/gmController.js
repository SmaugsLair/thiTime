const GameMaster = require('../models/user');
const async = require('async');
const GameSession = require('../models/gamesession');
const CollectedEvent = require('../models/collectedevent');
const ActionTimeDefault = require('../models/atd');
const secQs = require('../data/securityQuestions');


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

    const user = req.session.user;

    console.log('gameMaster:'+user.name);

    async.parallel({
        gm_sessions: function(callback) {
            GameSession.find({ 'gameMasterId': user._id },'name')
                .exec(callback)
        }
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        // Successful, so render.
        res.render('gm_detail', { title: 'Game Master Sessions',
            user: req.session.user,
            gm_sessions: results.gm_sessions } );
    });

};


exports.gm_collection = function(req, res, next) {

    const gameMaster = req.session.user;
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
            user: gameMaster,
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
    const gameMaster = req.session.user;
    res.render('gm_update',
        { title: 'Game Master Update',
            securityQuestions: secQs.securityQuestions,
            user: gameMaster}
            );
}

exports.applyUpdate = function (req, res, next) {

    const gameMaster = req.session.user;
    const params = {
        name: req.body.username,
        displayName: req.body.displayName,
        email: req.body.email,
        question: req.body.question,
        answer: req.body.answer
    };
    GameMaster.findByIdAndUpdate(gameMaster._id, params, {new:true}, function (err, result) {
        if (err) {
            return next(err);
        }
        req.session.user = result;
        res.redirect('/updateGM');
    });
}

exports.updatePassword = function (req, res, next) {
    const gameMaster = req.session.user;
    res.render('password_update',
        { title: 'Password Update',
            user: gameMaster}
    );
}

exports.applyUpdatePassword = function (req, res, next) {
    const gameMaster = req.session.user;
    let error = passwordUpdate(req, res,next, gameMaster._id);
    if (error) {
        res.render('password_update',
            {
                title: 'Password Update',
                user: gameMaster,
                error: error
            }
        );
    }
}

exports.forgotPassword = function(req, res) {
    res.render('forgotPassword',
        { title: 'Reset forgotten password',
            securityQuestions: secQs.securityQuestions});
}

exports.resetForgottenPassword = function (req, res, next) {
    const params = {
        question: req.body.question,
        answer: req.body.answer
    };
    if (req.body.idtype === 'email') {
        params.email = req.body.username;
    }
    else {
        params.name = req.body.username;
    }
    GameMaster.findOne(params, function(err, user) {
        let error;
        if (user) {
            error = passwordUpdate(req, res, next, user._id);
        }
        else {
            error = 'Invalid user details'
        }
        if (error) {
            res.render('forgotPassword',
                {
                    title: 'Reset forgotten password',
                    error: error,
                    securityQuestions: secQs.securityQuestions
                }
            );
        }
    });

}

function passwordUpdate(req, res, next, userID) {
    const password = req.body.password1;
    const confirm = req.body.password2;
    let error;
    if (password) {
        if (password === confirm) {
            const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}$/;
            if (password.match(regex)) {
                let temp = new GameMaster();
                temp.setPassword(password);
                const params = {
                    hash: temp.hash,
                    salt: temp.salt
                };
                GameMaster.findByIdAndUpdate(userID, params, {}, function (err, result) {
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
    return error;
}

