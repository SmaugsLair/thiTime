
const Power = require('../models/power');

exports.viewPowers = function(req, res, next) {
    Power.find({})
        .exec(function (err, powers) {
            if (err) { return next(err); }
            res.render('powerAdmin',
                { title: 'Power Admin',
                    user: req.session.user,
                    tabulatorJS: true,
                    powerAdminJS: true,
                });
        });
}

exports.powerDelete = function(req, res, next) {
    //GameSession.findOneAndDelete({_id:req.body.gameSessionId}, function deleteSession(err) {
    Power.deleteOne({_id:req.params.powerId}, function deleteSession(err) {
        if (err) {
            return next(err);
        }
        res.redirect('/powersAdmin');
    })
};