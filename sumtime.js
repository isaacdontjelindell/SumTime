/* Copyright (c) 2013 Isaac Dontje Lindell
 * This is free software. See LICENSE for more information */



/* oauth boilerplate */
var clientId = '935106300740-kug08d5pcg9rl6u68trr5qeo4fonf1m4.apps.googleusercontent.com';
var apiKey = 'AIzaSyAgnIILA5vo46DFldSndtc6luC3Nwlj8Is';

// TODO we should only need readonly access
var scopes = ['https://www.googleapis.com/auth/calendar',
              'https://www.googleapis.com/auth/calendar.readonly'];

function handleClientLoad() {
    gapi.client.setApiKey(apiKey);
    window.setTimeout(checkAuth, 1);
}

function checkAuth() {
    gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
}

function handleAuthResult(authResult) {
    var authorizeButton = document.getElementById('authorize-button');
    if (authResult && !authResult.error) {
        authorizeButton.style.visibility = 'hidden';
        makeApiCall();
    } else {
        authorizeButton.style.visibility = '';
        authorizeButton.onclick = handleAuthClick;
    }
}

function handleAuthClick(event) {
    // get authorization to use private data
    gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
    return false;
}
/* end Oauth boilerplate */


// load the API and exercise it
function makeApiCall() {
    // load the GCalendar API
    gapi.client.load('calendar', 'v3', function () {
        // Assemble the API request to list all calendars
        var request = gapi.client.calendar.calendarList.list();
        
        // make the API request
        request.execute(displayCalendarList);
    });
}

// handle the calendar list
function displayCalendarList(resp) {
    console.log(resp); // TODO remove (eventually)

    var container = $('<div></div>');
    container.addClass('calendar-list-container');

    $.each(resp.items, function (index, item) {
        var el = $("<li></li>");

        var button = $('<button></button>');
        button.text(item.summary);
        button.attr('data-calendar-id', item.id);
        button.attr('onclick', 'sumTimes("' + item.id + '");');

        el.append(button);
        container.append(el);
    });

    $('body').append(container);
}


function sumTimes(calendarId) {
    console.log(calendarId); // TODO remove

}