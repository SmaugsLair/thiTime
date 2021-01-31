const WebSocket = require("ws");

let wss;

exports.newServer= function(server) {

    console.log('new WS server');
    wss = new WebSocket.Server({ server });
    wss.on('connection', (webSocketClient) => {
        //send feedback to the incoming connection
        //webSocketClient.send('{ "connection" : "ok"}');
        //console.log('WS connection ');
        //console.log('ws.url:'+webSocketClient.url);

        //when a message is received
        webSocketClient.on('message', (message) => {
           // console.log('message:'+message);
           wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        });
    });
}

exports.gameUpdate = function(gameSessionId) {
    //console.log('api:'+gameSessionId);
    const message = JSON.stringify(
        { 'gameSessionId': gameSessionId});

    //console.log('api message:'+message);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}