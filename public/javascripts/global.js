function showOverlay(id) {
    document.getElementById('overlay'+id).style.display = "block";
}
function hideOverlay(id) {
    document.getElementById('overlay'+id).style.display = "none";
}

function showDiceRoll(rollLog) {
    //console.log(rollText);
    /*let dt = new Date();
    let hours = dt.getHours();
    let minutes = dt.getMinutes();
    let seconds = dt.getSeconds();
    if (hours > 12) {
        hours -=12;
    }
    let time = hours+':';
    if (minutes < 10) {
        time += '0'
    }
    time += minutes+':';
    if (seconds < 10) {
        time += '0';
    }
    time += seconds;*/
    $('#diceMessages ul').empty();
    let i;
    for (i = 0; i < Math.min(10, rollLog.length); i++) {
        $('#diceMessages ul').append('<li>'+rollLog[i].entry+'</li>')
    }

}