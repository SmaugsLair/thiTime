$(document).ready(function(){
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

