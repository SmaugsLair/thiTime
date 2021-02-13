const PowerSet = require('../models/powerSet');
const Power = require('../models/power');

//view all powerSets
exports.viewPowerSets = function(req, res, next) {
    PowerSet.find({})
        .exec(function (err, powerSets) {
            if (err) { return next(err); }
            res.render('powerSetBrowser',
                { title: 'PowerSets',
                    user: req.session.user,
                    powerSets: powerSets });
        });
}
exports.viewPowerSet = function(req, res, next) {
    let psId = req.params.psid;
    PowerSet.findOne({_id:psId}).exec(function (err, powerSet) {
        if (err) {
            return next(err);
        }
        let abMods = [];
        for (let [key, val] of powerSet.abilityMods) {
            abMods.push(key+':'+val);
        }
        let powers = [];
        for (let [key, val] of powerSet.powers) {
            powers.push(key+':'+val);
        }
        res.render('powerSet', { title: 'Power Set:' + powerSet.name,
            powerSet: powerSet,
            abMods: abMods,
            powers: powers,
            user: req.session.user
        });
    });
}

function logMapElements(value, key, map) {
    console.log(`m[${key}] = ${value}`);
}

//view all powers
exports.viewPowers = function(req, res, next) {
    Power.find({})
        .exec(function (err, powers) {
            if (err) { return next(err); }
            res.render('powerBrowser',
                { title: 'Powers',
                    user: req.session.user,
                    tabulator: true});
        });
}

exports.powerList = function(req, res, next) {
    Power.find({})
        .exec(function (err, powers) {
            if (err) { return next(err); }
            res.setHeader('Content-Type', 'application/json');
            res.send(powers);
        });
}

exports.viewPower = function(req, res, next) {

}