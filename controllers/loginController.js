const GameMaster = require('../models/gamemaster');

exports.index = function(req, res) {
    res.render('login');
};

exports.login = function(req, res) {
    GameMaster.findOne({ name: req.body.username}, function(err, gameMaster) {
        if (!gameMaster) {
            req.session.reset();
            res.render('login', {error: 'Invalid credentials.'});
        }
        else if (gameMaster.validPassword(req.body.password)) {
            req.session.user = gameMaster;
            res.redirect('/gm');
        }
        else if (req.body.password == gameMaster.password) {
            console.log('Using insecure password, redirecting to better model');
            req.session.user = gameMaster;
            res.render('password_update',
                {error: 'Please update your password.',
                    gameMaster: gameMaster });
        }
        else {
            req.session.reset();
            res.render('login', { error: 'Invalid credentials.' });
        }
    });
};

exports.logout = function(req, res) {
    req.session.reset();
    res.render('index');
}



