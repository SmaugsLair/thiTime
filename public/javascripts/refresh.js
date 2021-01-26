const gsid = document.getElementById("gameSessionID").value;

const ws = new WebSocket('ws://'+location.hostname+':80');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.gameSessionId===gsid) {
        location.reload();
    }
};



