const ws = new WebSocket('ws://'+location.host);
const message = JSON.stringify(
    { 'gameSessionId': document.getElementById('gameSessionID').value});

function announceUpdate() {
    ws.send(message);
}