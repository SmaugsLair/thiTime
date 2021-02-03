const gsid = document.getElementById("gameSessionID").value;

const ws = new WebSocket('ws://'+location.host);

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    /*console.log('data:'+data)
    console.log('data.gameSessionId:'+data.gameSessionId)
    console.log('gsid:'+gsid)*/
    if (data.gameSessionId===gsid) {
        //location.reload();
        filltimeline();
    }
};

let rowTemplate =
    '<tr style="background-color:<%this.color%>" class="<%this.rowClass%>">' +
    '<td><input disabled value="<%this.name%>"></td>' +
    '<td class="number"><input disabled value="<%this.stun%>" size="2"></td>' +
    '<td><input disabled value="<%this.actionValue%>" size="1", title="<%this.actionTitle%>"></td>' +
    '<td class="number"><input disabled value="<%this.time%>" size="3"></td>' +
    '<td class="lastEvent"><input disabled value="<%this.reactTime%>" size="3"></td>' +
    '</tr>';

function filltimeline() {
    $.get('/playerTimeLine/'+gsid, function(data, status){
        let timeline = data.timeline;
        $('#timelineTable').renderTable({
            template: rowTemplate,
            data: timeline
        });
    });
}

$(document).ready(function() {
    filltimeline();

    $('.dice').click(function(e) {
        e.preventDefault();
        $.ajax({
            url: '/dice/'+e.target.name,
            type: 'post',
            dataType: 'application/json',
            data: $('#diceForm').serialize(),
            complete: function(data) {

                let response = JSON.parse(data.responseText);

                let sum = response.sum;
                let oldSum = response.oldSum;
                let sumString = (oldSum ? oldSum + ' ==> ' : '') + sum;
                $('#sumString').val(sumString);
                $('#sum').val(sum);

                let dice = response.dice;
                $('#dice').val(dice);
                $('#diceString').val(dice);

                let lowest = response.lowest;
                if (lowest) {
                    $('#dropped').show();
                }
                else {
                    $('#dropped').hide();
                }
                $('#droppedDice').val(lowest);

                let percent = response.percent;
                $('#rollBar').css('width', percent+ '%');
                $('#rollBar').removeClass('w3-green w3-yellow');
                $('#rollBar').addClass(percent>=55? 'w3-green': 'w3-yellow');


                $('#diceResults').show();
            }
        });
    });
});