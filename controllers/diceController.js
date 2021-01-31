const GameMaster = require('../models/gamemaster');

function rollD10() {
    return Math.floor(Math.random() * Math.floor(10)) + 1;
}
function calcPercent(sum, count) {
    return Math.floor((sum/(10 * Math.min(count, 10)))*100)
}

exports.load = function(req, res) {
    res.render('dice' , {
            title: 'Dice Roller',
            maxDice: 10
        });
};

exports.roll = function(req, res) {
    let count, sum = 0;
    let dice = [];
    for (count = 0;count < req.body.diceCount; ++count) {
        let roll = rollD10();
        sum += roll;
        //console.log('roll #'+count+': '+roll);
        dice.push(roll);
    }
    dice.sort(function(a, b){return a-b});
    let lowest = [];
    while (dice.length > req.body.maxDice) {
        let val = dice.shift();
        sum -= val;
        lowest.push(val);
    }
    res.render('dice',
        { title: 'Roll Results',
          diceCount: req.body.diceCount,
          maxDice: req.body.maxDice,
          dice: JSON.stringify(dice),
          lowest: (lowest.length>0? JSON.stringify(lowest): false),
          sum: sum,
          percent: calcPercent(sum, req.body.diceCount),
          baseRoll: true});
};

exports.hero = function(req, res) {
    let sum = Number(req.body.sum);
    let dice = JSON.parse(req.body.dice);
    let roll = rollD10();
    sum += roll;
    dice.push(roll);
    dice.sort(function(a, b){return a-b});
    let lowest = dice.shift();
    sum -= lowest;
    res.render('dice',
        { title: 'Hero Roll Results',
            diceCount: req.body.diceCount,
            maxDice: req.body.maxDice,
            dice: JSON.stringify(dice),
            lowest: lowest,
            percent: calcPercent(sum, req.body.diceCount),
            oldSum: Number(req.body.sum),
            sum: sum});
};

exports.drama = function(req, res) {
    let dice = JSON.parse(req.body.dice);
    let sum = Number(req.body.sum);
    for (count = 0;count < 2; ++count) {
        let roll = rollD10();
        sum += roll;
        dice.push(roll);
    }
    dice.sort(function(a, b){return a-b});
    let lowest = [];
    do {
        let val = dice.shift();
        sum -= val;
        lowest.push(val);
    }
    while (dice.length > req.body.maxDice) ;
    res.render('dice',
        { title: 'Drama Roll Results',
            diceCount: req.body.diceCount,
            maxDice: req.body.maxDice,
            dice: JSON.stringify(dice),
            lowest: lowest,
            percent: calcPercent(sum, dice.length),
            oldSum: Number(req.body.sum),
            sum: sum});
};


