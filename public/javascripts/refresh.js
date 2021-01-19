let pageDate = document.getElementById("lastEventDate").value;
let gameSessionID = document.getElementById("gameSessionID").value;

var x = setInterval(function() {
    checkForNewEvent();
}, 2000);

//getText();

//checkForNewEvent();

async function checkForNewEvent() {
    let response = await fetch('/lastEventDate/'+gameSessionID);
    let data = await response.json();
    if (data.lastEventDate > pageDate) {
        location.reload();
    }
};



