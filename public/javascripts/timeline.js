const ws = new WebSocket('ws://'+location.host);
const gsid = document.getElementById("gameSessionID").value;

//Evennode has a 60 second timeout on websockets
let start = Date.now();
var wsPing = setInterval(pinger, 55000);
function pinger() {
    ws.send('keepAlive');
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