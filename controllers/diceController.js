const ws = require('../websocket')

function rollD10() {
    return Math.floor(Math.random() * Math.floor(10)) + 1;
}
function calcPercent(sum, count) {
    return Math.floor((sum/(10 * Math.min(count, 10)))*100)
}

function shareRoll(gsid, charName, sum, dice, type) {
    if (charName) {
        ws.diceRoll(gsid, charName +' rolled ' + sum + ' ' + JSON.stringify(dice) + ' '+ type);
    }
}

exports.load = function(req, res) {
    res.render('dice' , {
            title: 'Dice Roller',
            maxDice: 10,
            js: 'dice.js'
        });
};

exports.roll = function(req, res) {

    //console.log(JSON.stringify(req.body));

    let count, sum = 0;
    let dice = [];
    let diceCount = Number(req.body.diceCount);
    let maxDice = Number(req.body.maxDice);
    let charName = req.body.characterName;
    for (count = 0;count < diceCount; ++count) {
        let roll = rollD10();
        sum += roll;
        //console.log('roll #'+count+': '+roll);
        dice.push(roll);
    }
    dice.sort(function(a, b){return a-b});
    let lowest = [];
    while (dice.length > maxDice) {
        let val = dice.shift();
        sum -= val;
        lowest.push(val);
    }
    shareRoll(req.body.gameSessionID, charName, sum, dice, 'Basic')
    res.setHeader('Content-Type', 'application/json');
    res.send({
        dice: JSON.stringify(dice),
        lowest: (lowest.length>0? JSON.stringify(lowest): false),
        sum: sum,
        percent: calcPercent(sum, req.body.diceCount)
        });
};

exports.hero = function(req, res) {
    //console.log(JSON.stringify(req.body));
    let sum = Number(req.body.sum);
    let diceCount = Number(req.body.diceCount);
    let maxDice = Number(req.body.maxDice);
    let charName = req.body.characterName;
    //console.log('sum:'+sum);
    //console.log('dice:'+req.body.dice);
    let dice = JSON.parse(req.body.dice);
    //console.log('dice:'+dice);
    let roll = rollD10();
    sum += roll;
    dice.push(roll);
    dice.sort(function(a, b){return a-b});
    let lowest = dice.shift();
    sum -= lowest;
    shareRoll(req.body.gameSessionID, charName, sum, dice, 'HERO')
    res.setHeader('Content-Type', 'application/json');
    res.send({
            dice: JSON.stringify(dice),
            lowest: lowest,
            percent: calcPercent(sum, req.body.diceCount),
            oldSum: Number(req.body.sum),
            sum: sum});
};

exports.drama = function(req, res) {
    let dice = JSON.parse(req.body.dice);
    let sum = Number(req.body.sum);
    let diceCount = Number(req.body.diceCount);
    let maxDice = Number(req.body.maxDice);
    let charName = req.body.characterName;
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
    while (dice.length > req.body.maxDice);

    shareRoll(req.body.gameSessionID, charName, sum, dice, 'DRAMA')

    res.setHeader('Content-Type', 'application/json');
    res.send({
            dice: JSON.stringify(dice),
            lowest: lowest,
            percent: calcPercent(sum, dice.length),
            oldSum: Number(req.body.sum),
            sum: sum});
};

