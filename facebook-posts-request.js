// https://github.com/request/request
var request = require('request');
// =============================================================================
// USE REQUEST TO GET THE DATA
// =============================================================================
request('http://www.aderinsola.com', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log("request is running") // Show the HTML for the Google homepage.
        console.log(body) // Show the HTML for the Google homepage.
    }
})