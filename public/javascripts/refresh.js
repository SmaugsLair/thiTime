let pageDate = document.getElementById("lastEventDate").value;
let gameSessionID = document.getElementById("gameSessionID").value;

const msBetweenChecks = 2000;
const minutesBeforeCancel = 10;
const checksBeforeCancel =  (minutesBeforeCancel * 60 * 1000)/msBetweenChecks;

const interval = setInterval(checkForNewEvent, msBetweenChecks);

let checks = 0;

async function checkForNewEvent() {
    ++checks;
    if (checks > checksBeforeCancel) {
        clearInterval(interval);
        document.getElementById('timeout').value = 'Auto-refresh has timed out. Refresh the page to reactivate.'
    }
    else {
        let response = await fetch('/lastEventDate/' + gameSessionID);
        let data = await response.json();
        if (data.lastEventDate > pageDate) {
            location.reload();
        }
    }
}



