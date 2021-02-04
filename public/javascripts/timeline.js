const ws = new WebSocket('ws://'+location.host);
const gsid = document.getElementById("gameSessionID").value;

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    //console.log(JSON.stringify(data));
    if (data.gameSessionId === gsid) {
        if (data.action === 'diceRoll') {
            showDiceRoll(data.rollText);
        }
    }
};