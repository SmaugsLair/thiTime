var GameMaster = require('../models/gamemaster');
var async = require('async');
var GameSession = require('../models/gamesession');
var CollectedEvent = require('../models/collectedevent');
var ActionTimeDefault = require('../models/atd');


exports.index = function(req, res) {
    res.render('login');
};

exports.login = function(req, res) {
    GameMaster.findOne({ name: req.body.username }, function(err, gameMaster) {
        if (!gameMaster) {
            req.session.reset();
            res.render('login', { error: 'Invalid credentials.' });
        } else {
            //if (req.body.password == gameMaster.password) {
            //console.log('session:'+req.session);
                req.session.gameMaster = gameMaster;
                res.redirect('/gm');
            //} else {
            //    res.render('login', { error: 'Invalid credentials.' });
            //}
        }
    });
};

exports.logout = function(req, res) {
    req.session.reset();
    res.render('index');
}



