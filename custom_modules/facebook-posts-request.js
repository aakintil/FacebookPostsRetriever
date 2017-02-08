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

// Module
var facebookRequest = module.exports = {
    init: function() {
        
    }
}, // creating the facebook request module

    // Dependencies
    Datastore = require('nedb'), // to store our data in a customized database if necessary
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