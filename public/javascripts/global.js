// Userlist data array for filling in info box
var atdData = [];

// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the user table on initial page load
    //populateAtdTable();

    // Username link click
    //$('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);

    // Add User button click
    //$('#btnAddUser').on('click', addUser);

    // Delete User link click
    //$('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);

});

// Functions =============================================================

// Fill table with data
function populateAtdTable() {

    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/atd', function( data ) {

        // Stick our user data array into a userlist variable in the global object
        atdData = data;

        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td>'+this.name+'</td>';
            tableContent += '<td>'+this.time+'</td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#atdTable table tbody').html(tableContent);
    });
};

function validateNewSession() {
    var sessionName = document.forms["newSessionForm"]["sessionName"].value;
    if (sessionName == "") {
        alert("Please provide a session name");
        return false;
    }
    else return true;
};


function validateNewEvent() {
    var eventName = document.forms["newEventForm"]["newEventName"].value;
    var eventTime = document.forms["newEventForm"]["newEventTime"].value;
    if (eventName == "") {
        alert("Please provide an event name");
        return false;
    }
    if (eventTime == "") {
        alert("Please provide an event time");
        return false;
    }
    if (isNaN(eventTime)) {
        alert("Event Time must be a number");
        return false;
    }
    else return true;
};

function stunChange(id) {
    document.getElementById('tlbtn'+id).disabled = false;
    //document.getElementById('stun'+id).disabled = true;
    document.getElementById('actionTime'+id).disabled = true;
    document.getElementById('time'+id).disabled = true;
    document.getElementById('color'+id).disabled = true;
    document.getElementById('hidden'+id).disabled = true;
};

function actionChange(id) {
    document.getElementById('tlbtn'+id).disabled = false;
    document.getElementById('stun'+id).disabled = true;
    //document.getElementById('actionTime'+id).disabled = true;
    document.getElementById('time'+id).disabled = true;
    document.getElementById('color'+id).disabled = true;
    document.getElementById('hidden'+id).disabled = true;
};

function timeChange(id) {
    document.getElementById('tlbtn'+id).disabled = false;
    document.getElementById('stun'+id).disabled = true;
    document.getElementById('actionTime'+id).disabled = true;
    //document.getElementById('time'+id).disabled = true;
    document.getElementById('color'+id).disabled = true;
    document.getElementById('hidden'+id).disabled = true;
};

function colorChange(id) {
    document.getElementById('tlbtn'+id).disabled = false;
    document.getElementById('stun'+id).disabled = true;
    document.getElementById('actionTime'+id).disabled = true;
    document.getElementById('time'+id).disabled = true;
    //document.getElementById('color'+id).disabled = true;
    document.getElementById('hidden'+id).disabled = true;
};

function hiddenChange(id) {
    document.getElementById('tlbtn'+id).disabled = false;
    document.getElementById('stun'+id).disabled = true;
    document.getElementById('actionTime'+id).disabled = true;
    document.getElementById('time'+id).disabled = true;
    document.getElementById('color'+id).disabled = true;
    //document.getElementById('hidden'+id).disabled = true;
};

function showOverlay(id) {
    document.getElementById('overlay'+id).style.display = "block";
};
function hideOverlay(id) {
    document.getElementById('overlay'+id).style.display = "none";
};