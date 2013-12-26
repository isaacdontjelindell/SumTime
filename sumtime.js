var clientId = '935106300740-kug08d5pcg9rl6u68trr5qeo4fonf1m4.apps.googleusercontent.com';

var apiKey = 'AIzaSyAgnIILA5vo46DFldSndtc6luC3Nwlj8Is';

var scopes = ['https://www.googleapis.com/auth/calendar',
              'https://www.googleapis.com/auth/calendar.readonly'];


function handleClientLoad() {
    // Step 2: Reference the API key
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
    // Step 3: get authorization to use private data
    gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
    return false;
}

// Load the API and make an API call.  Display the results on the screen.
function makeApiCall() {
    // Step 4: Load the GCalendar API
    gapi.client.load('calendar', 'v3', function () {
        // Step 5: Assemble the API request to list all calendars
        var request = gapi.client.calendar.calendarList.list();
        // Step 6: Execute the API request
        request.execute(function (resp) {
            console.log(resp);
            $.each(resp.items, function (index, item) {
                $("body").append("<div>" + item.summary + "</div>")
            })
        });
    });
}
