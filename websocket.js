const WebSocket = require("ws");

let wss;

exports.newServer= function(server) {
    //console.log('new WS server');
    wss = new WebSocket.Server({ server });
    wss.on('connection', (webSocketClient) => {
        console.log('WS client connection ');
        webSocketClient.on('message', (message) => {
           if (message !== 'keepAlive') {
               wss.clients.forEach((client) => {
                   if (client.readyState === WebSocket.OPEN) {
                       client.send(message);
                   }
               });
           }
        });
    });
}


exports.diceRoll = function(gameSessionId, rollText) {
   //console.log('diceRoll:'+gameSessionId);
    //console.log('diceRoll:'+rollText);
    const message = JSON.stringify(
        { 'gameSessionId': gameSessionId,
            'rollText': rollText,
            'action': 'diceRoll'
        });
    sendMessage(message);
}

exports.gameUpdate = function(gameSessionId) {
    //console.log('api:'+gameSessionId);
    const message = JSON.stringify(
        { 'gameSessionId': gameSessionId,
        'action': 'update'
        });
    sendMessage(message);
}

function sendMessage(message) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}