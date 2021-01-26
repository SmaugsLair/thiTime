
const ws = new WebSocket('ws://'+location.hostname+':3030');
const message = JSON.stringify(
    { 'gameSessionId': document.getElementById('gameSessionID').value});

function announceUpdate() {
    ws.send(message);
}