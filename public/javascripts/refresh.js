var load = new Date().getTime();

// Update the count down every 1 second
var x = setInterval(function() {

    // Get today's date and time
    var now = new Date().getTime();

    // Find the distance between now and the count down date
    var distance = load - now;

    // Time calculations for days, hours, minutes and seconds
    var thirdseconds = 180 + Math.floor((distance % (1000 * 60)) / 333);

    var dots = ''
    while (thirdseconds >= 0) {
        dots += '.'
        thirdseconds -= 1;
    }

    // Output the result in an element with id="demo"
    document.getElementById("timeout").innerHTML = dots;

    // If the count down is over, write some text
    //if (distance < 0) {
    //  clearInterval(x);
    //  document.getElementById("demo").innerHTML = "EXPIRED";
    //}
}, 333);