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
        Power.find({}, 'name shortDescr fullDescr').exec(function (err, docs) {
            if (err) {
                return next(err);
            }
            let powerMap = new Map();
            docs.forEach(function(p){
                powerMap.set(p.name, p);
            });
            let powers = [];
            for (i = 0; i < 10; ++i) {
                powers.push([]);
            }
            for (let [key, powerList] of powerSet.powers) {
                powerList.forEach(function (powerName) {
                    let power = powerMap.get(powerName);
                    powers[key - 1].push(power);
                });
            }
            res.render('powerSet', { title: 'Power Set:' + powerSet.name,
                powerSet: powerSet,
                abMods: abMods,
                powers: powers,
                tabulatorJS: true,
                powerSetJS: true,
                user: req.session.user
            });
        });
    });
}

//view all powers
exports.viewPowers = function(req, res, next) {
    Power.find({})
        .exec(function (err, powers) {
            if (err) { return next(err); }
            res.render('powerBrowser',
                { title: 'Powers',
                    user: req.session.user,
                    tabulatorJS: true,
                    powerBrowserJS: true,
                });
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