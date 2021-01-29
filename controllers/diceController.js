const GameMaster = require('../models/gamemaster');

exports.load = function(req, res) {
    res.render('dice');
};

exports.roll = function(req, res) {
    let count, sum = 0;
    let dice = [];
    for (count = 0;count < req.body.diceCount; ++count) {
        let roll = Math.floor(Math.random() * Math.floor(10)) + 1;
        sum += roll;
        //console.log('roll #'+count+': '+roll);
        dice.push(roll);
    }
    dice.sort(function(a, b){return a-b});
    let lowest = [];
    while (dice.length > 10) {
        let val = dice.shift();
        sum -= val;
        lowest.push(val);
    }
    let percent = Math.floor((sum/(10 * Math.min(req.body.diceCount, 10)))*100);
    console.log('percent:'+percent);
    res.render('dice',
        { title: 'Roll Results',
          diceCount: req.body.diceCount,
          dice: JSON.stringify(dice),
          lowest: (lowest.length>0? JSON.stringify(lowest): false),
          sum: sum,
          percent: percent,
          baseRoll: true});
};

exports.hero = function(req, res) {
    let oldSum = Number(req.body.sum);
    let dice = req.body.dice;
    console.log('hero roll with dice:'+dice);
    let diceArray = JSON.parse(dice);
    console.log('diceArray:'+diceArray);
    let roll = Math.floor(Math.random() * Math.floor(10)) + 1;
    console.log('roll:'+roll);
    res.render('dice',
        { title: 'Hero Roll Results',
            diceCount: req.body.diceCount,
            dice: req.body.dice,
            heroRoll: roll,
            oldSum: oldSum,
            sum: oldSum + roll});
};

exports.drama = function(req, res) {
    let oldSum = Number(req.body.sum);
    let dice = JSON.parse(req.body.dice);
    let sum = Number(req.body.sum);;
    let dropped = dice.shift();
    sum -= dropped;
    let dramaRoll = [];
    for (count = 0;count < 2; ++count) {
        let roll = Math.floor(Math.random() * Math.floor(10)) + 1;
        sum += roll;
        dramaRoll.push(roll);
    }
    res.render('dice',
        { title: 'Drama Roll Results',
            diceCount: req.body.diceCount,
            dice: JSON.stringify(dice),
            dramaRoll: JSON.stringify(dramaRoll),
            oldSum: oldSum,
            sum: sum});
};


