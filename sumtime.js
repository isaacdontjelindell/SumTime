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

function handleAuthResult (authResult) {
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
function makeApiCall () {
    // load the GCalendar API
    gapi.client.load('calendar', 'v3', function () {
        // Assemble the API request to list all calendars
        var request = gapi.client.calendar.calendarList.list();
        
        // make the API request
        request.execute(displayCalendarList);
    });
}

// handle the calendar list
function displayCalendarList (resp) {
    console.log(resp); // TODO remove (eventually)

    var container = $('<div></div>');
    container.addClass('calendar-list-container');

    $.each(resp.items, function (index, item) {
        var el = $("<li></li>");

        var button = $('<button></button>');
        button.text(item.summary);
        button.attr('data-calendar-id', item.id);
        button.attr('onclick', 'handleCalendarSelection("' + item.id + '");');

        el.append(button);
        container.append(el);
    });

    $('body').append(container);
}


function handleCalendarSelection (calendarId) {
    console.log(calendarId); // TODO remove

    // remove the calendar list
    $('.calendar-list-container').remove();

    // get all events on the selected calendar
    gapi.client.load('calendar', 'v3', function () {
        var request = gapi.client.calendar.events.list({
            'calendarId':calendarId
        });

        request.execute(displayCalendarEventList);
    });
}

function displayCalendarEventList (eventsResp) {
    console.log(eventsResp);  // TODO remove eventually

    var events = eventsResp.items;

    var container = $('<div></div>');
    container.addClass('calendar-event-list-container');

    var totals = {};
    $.each(events, function(index, event) {
        var eventName = event.summary;

        if (!totals[eventName]) {
            totals[eventName] = moment.duration(0);
        }

        var start = moment(event.start.dateTime);
        var end = moment(event.end.dateTime);
        var duration = moment.duration(end.diff(start, 'minutes'), 'minutes');
        console.log('Event length: ' + duration.asMinutes()); // TODO remove

        if (event.recurrence) {
            var recurrence = event.recurrence[0].split(';'); // TODO can there ever be more than 1 recurrence rule??
            var recurrenceCount = parseInt(recurrence[1].split('=')[1]);

            for (var i=0; i<recurrenceCount-1; i++) {
                duration = duration.add(duration);
            }
        }

        totals[eventName].add(duration);
        console.log('Total event length: ' + duration.asMinutes());

    });

    console.log('totals:'); // TODO remove
    console.log(totals);

    $.each(totals, function (key, item) {
        var el = $('<li></li>');
        var text = key + ': ' + item.asHours() + ' hours';

        el.text(text);

        container.append(el);
    });

    $('body').append(container);
}