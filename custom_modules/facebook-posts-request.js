//// https://github.com/request/request
//var request = require('request');
//// =============================================================================
//// USE REQUEST TO GET THE DATA
//// =============================================================================
//request('http://www.aderinsola.com', function (error, response, body) {
//  if (!error && response.statusCode == 200) {
//    console.log("request is running") // Show the HTML for the Google homepage.
//    console.log(body) // Show the HTML for the Google homepage.
//  }
//})


// Dependencies
var Datastore = require('nedb'), // to store our data in a customized database if necessary
    _ = require('underscore'), // underscore for helper functions
    moment = require('moment'), // to reformat date/time so we can understand
    fs = require('fs'), // to write to a file 
    request = require('request'), // to make actual requests to the facebook api

    // Custom variables
    indexOf = [].indexOf || function (item) {
        for (var i = 0, l = this.length; i < l; i++) {
            if (i in this && this[i] === item) return i;
        }
        return -1;
    };


function FacebookRequest() {
    this.defaults = {
        downloadedSince: null,
        groupID: "155134491340908", // save my inbox default group id
        groupIDs: {
            "save my inbox": "155134491340908", // we can get other group ids and store them here but that's not a priority right now
            "function": ""
        },
        count: 0,
        accessToken: 'EAAP77vQBZAhMBAPim8DOAs3ZCHZC2NPzNGDbMZCf6ISWc7rap1hiq1G6ikWZAFuSYVfo570BQlcZC34ZCESDh934iAZA2CgfUKbxfkwZB9wngklszAW3YEmcJVXZClm4urfZCDZAgd4NMs8sJufgIaeRUOJb', // need this in order to get ANY posts. should work and should never expire
        tempAccessToken: 'EAACEdEose0cBAAEgcntLtIWfxFneC8hCTB8ZAfUdAzEvx6YcZAAY0o2JSKNkcX6ZAnZCClVxPQ8npqAWTctNRKm2oLZAyR0nxjOpy62HaFZAMM3EZA75ZAQ14txtR7ZCvxLyOfLfmrKGoelrL7ifgKiAkLx7hoXILJrEp9NKTOFbIl9QeNsXMRGYOtguwdAwA45cZD', // need to go to https://developers.facebook.com/tools/explorer/ & change the access token every 2 hours 
        retrievedPosts: [],
        newUntil: null,
        getGroupURL: 'https://graph.facebook.com/me/groups?access_token=',
        currentPostIndex: ''
    }

    // apparently it's not needed, but it felt weird without it
    return this;
}

// functions for the request object
FacebookRequest.prototype = {

    // eventually this will make an api call that gathers all the groups in a user's account and stores their ids
    getGroupIDs: function () {
        return this.defaults["groupID"];
    },

    // makes a call to the SMI group
    // logic could be that if there are any unread messages, then update the data. 
    checkForUpdates: function () {
        var url = this.defaults['getGroupURL'] + this.defaults['tempAccessToken'],
            group_id = this.group_id,
            self = this;
        return request(url, function (error, response, body) {
            // grab the body response
            // contains all groups and looks like...
            groups = JSON.parse(body);
            /*
                data returns something of the sorts
                    { 
                        name: 'Save Mah Inbox',
                        privacy: 'SECRET',
                        id: '155134491340908',
                        administrator: true,
                        bookmark_order: 999999999,
                   **** unread: 14 ****
                    }
            */

            // catch and scream about errors...
            // don't understand what the indexOf.call does though
            if (error) {
                console.log("error ", error);
                process.exit();
            } else if (indexOf.call(groups, "error") >= 0) {
                console.log("posts error ", groups.error);
                process.exit();
            }
        })
    }, 
    
    // where the magic happens. recursive 
    retrievePostsFromGroup: function( groupID, url ) {
        
    }
}

// Module
module.exports = FacebookRequest; // creating the facebook request module