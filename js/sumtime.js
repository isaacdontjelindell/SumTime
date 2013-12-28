/* Copyright (c) 2013 Isaac Dontje Lindell
 * This is free software. See LICENSE for more information */

/* oauth boilerplate */
var clientId = '935106300740-kug08d5pcg9rl6u68trr5qeo4fonf1m4.apps.googleusercontent.com';
var apiKey = 'AIzaSyAgnIILA5vo46DFldSndtc6luC3Nwlj8Is';

var scopes = [
              'https://www.googleapis.com/auth/calendar.readonly'
             ];

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
        authorizeButton.style.display = 'none';
        makeApiCall();
    } else {
        authorizeButton.style.display = 'inherit';
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
    var instructionsHeading = $('<div></div>');
    instructionsHeading.addClass('instructions');
    var text = '1. Choose the calendar below for which you wish to summarize total times.';
    instructionsHeading.text(text);

    var container = $('<ul></ul>');
    container.addClass('calendar-list-container');

    $.each(resp.items, function (index, item) {
        var el = $("<li></li>");
        el.addClass('calendar-list-item');


        var button = $('<button></button>');
        button.text(item.summary);
        button.attr('data-calendar-id', item.id);
        button.addClass('btn btn-default');
        button.attr('onclick', 'handleCalendarSelection("' + item.id + '");');

        el.append(button);
        container.append(el);
    });

    $('#page-content').append(instructionsHeading);
    $('#page-content').append(container);
}


function handleCalendarSelection (calendarId) {
    // remove the calendar list
    $('.calendar-list-container').remove();

    // ask for the date range
    var start = $('<input />');
    start.attr('type', 'text');
    start.addClass('datepicker start-date');
    start.attr('placeholder', 'Start date');

    var end = $('<input />');
    end.attr('type', 'text');
    end.addClass('datepicker end-date');
    end.attr('placeholder', 'End date');

    var submitButton = $('<button></button>');
    submitButton.attr('type', 'button');
    submitButton.attr('onclick', 'getEvents("' + calendarId + '");');
    submitButton.addClass('submit-button btn btn-success');
    submitButton.text('Sum Event Times');

    var body = $('#page-content');
    body.append(start);
    body.append(end);
    body.append(submitButton);
    var text = '2. Choose the range of dates for which you wish to summarize total times.';
    $('.instructions').text(text);

    // activate datepicker
    $('.datepicker.start-date').datepicker({format: "mm/dd/yyyy"});
    $('.datepicker.end-date').datepicker({format: "mm/dd/yyyy"});
}

function getEvents(calendarId) {
    var start = moment($('.start-date').val());
    var end = moment($('.end-date').val());

    // set end datetime to midnight
    end.hour('24');

    // remove the start, end, and submit button
    $('.start-date').remove();
    $('.end-date').remove();
    $('.submit-button').remove();

    // get all events on the selected calendar
    gapi.client.load('calendar', 'v3', function () {
        var request = gapi.client.calendar.events.list({
            'calendarId': calendarId,
            'singleEvents': true,
            'orderBy': 'startTime',
            'timeMin': start.toDate(),
            'timeMax': end.toDate()
        });

        request.execute(sumEventTimes);
    });
}

function sumEventTimes (eventsResp) {
    var events = eventsResp.items;

    var totals = {};
    $.each(events, function(index, event) {
        var eventName = event.summary;

        var start = moment(event.start.dateTime);
        var end = moment(event.end.dateTime);
        var duration = moment.duration(end.diff(start, 'minutes'), 'minutes');

        if (!totals[eventName]) {
            totals[eventName] = moment.duration(0);
        }
        totals[eventName].add(duration);
    });

    displayEventTimeTotals(totals);
}

function displayEventTimeTotals (totals) {
    $('.instructions').remove();

    var container = $('<div></div>');
    container.addClass('calendar-event-list-container');

    $.each(totals, function (key, item) {
        var el = $('<li></li>');

        var text = key + ': ' + item.asHours() + ' hours';
        el.text(text);

        container.append(el);
    });

    $('#page-content').append(container);
}