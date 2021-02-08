const ws = new WebSocket('ws://'+location.host);
const gsid = document.getElementById("gameSessionID").value;

let start = Date.now();
var wsPing = setInterval(pinger, 55000);

function pinger() {
    console.log('pinger:' + (Date.now() - start));
    ws.send('ping');
}

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    //console.log(JSON.stringify(data));
    if (data.gameSessionId === gsid) {
        if (data.action === 'diceRoll') {
            showDiceRoll(data.rollText);
        }
    }
};