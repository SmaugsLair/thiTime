const gsid = document.getElementById("gameSessionID").value;

const ws = new WebSocket('ws://'+location.host);

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    /*console.log('data:'+data)
    console.log('data.gameSessionId:'+data.gameSessionId)
    console.log('gsid:'+gsid)*/
    if (data.gameSessionId===gsid) {
        location.reload();
    }
};

