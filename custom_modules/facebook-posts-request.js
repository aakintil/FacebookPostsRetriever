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
    fs = require('file-system'), // to write to a file 
    request = require('request'), // to make actual requests to the facebook api
    pathExists = require('path-exists'), // to check whether a file exists or not

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
    retrievePostsFromGroup: function (groupID, url) {
        // check json file for the most recent data
        var self = this;
        pathExists('data/saveMyInbox.json').then(exists => {
            // if it's there then we already have some data, and we can just call the get groups to see if there are new posts
            if (exists) {
                // get group status
                // see if there are any unread posts
                // this.untilTime = moment(jsonFile[0].created_time) // figure out format
                // self.getRecentPosts( untilTime ); 
            }
            // else begin looping through the entirety of the facebook posts
            else {
                //                self.saveCurrentGroupId(groups.data[i].id);
                //                console.log("---- ASYNCHRONOUS CALL ... #3 is actually called before #2 ----");
                //                console.log("2. successfully got group id...moving on... \n");
                //                var getPostsURL = self.timeParamUrl();
                var url = "";
                self.getAllPosts(url);
            }
        });
    },

    storeFacebookPosts: function (posts) {
        console.log("storing facebook posts");
    },

    getAllPosts: function (url) {
        console.log("getting all posts");
        /*
        function sortedUpdated(posts) {
            return _.pluck(posts.data, 'updated_time').sort();
        }
         */
        // ** Variables **
        // custom sort by function
        var sortBy = function (posts, type) {
                return _.pluck(posts, type).sort();
            },
            vars = this.defaults;

        /*
                    return request(url, function (error, response, body) {
                        // grab the body response
                        posts = JSON.parse(body);
                        // catch and scream about errors...
                        // don't understand what the indexOf.call does though
                        if (error) {
                            console.log("error ", error);
                            process.exit();
                        } else if (indexOf.call(groups, "error") >= 0) {
                            console.log("posts error ", groups.error);
                            process.exit();
                        }
                        // number of posts fetched
                        var numPostsFetched = posts.data.length;
                        // now we have a list of groups
                        // find save mah inbox group
                        // save it's id so we can create an actual req to SMI posts
                        console.log("\n5. looping through posts data \n");
                        if (numPostsFetched > 0) {
                            // save items into db
                            for (var i = 0; i < posts.data.length; i++) {
                                self.exportDatabase.push(posts.data[i]);
                                console.log('\n newly inserted post ', posts.data[i].id)
                                    // appDB.insert( posts.data[ i ], function( err, newPost ) {
                                    //     console.log( '\n newly inserted post ', newPost.id )
                                    // });    
                            }
                            var newUntil = moment(_.first(sortedUpdated(posts))).unix() - 1,
                                newUntilDate = moment(_.first(sortedUpdated(posts))).format("dddd, MMMM Do YYYY, h:mm:ss a"),
                                newURL = self.timeParamUrl(undefined, newUntil);
                            // console.log( ' \n ====== current posts fetch length [ ', numPostsFetched, ' ] ====== ' ); 
                            console.log(" \n getting posts from: [", 0, "]   --> until : [", newUntilDate, "] ");
                            // console.log( ' \n hopefully a newer url with date [ ', newURL, ' ]' ); 
                            currentPostIndex++;
                            self.getPostsForGroup(newURL);
                        } else {
                            console.log("\nfinished grabbing all posts");
                            console.log("\n....about to export to a file");
                            fs.writeFile('db/test.js', JSON.stringify(self.exportDatabase), function (err) {
                                if (err) {
                                    console.error('YOU FUCKED UP');
                                } else {
                                    console.log("Output saved to /test.js");
                                    process.exit()
                                }
                            });
                        };
                    */
    },

    getRecentPosts: function (untilTime) {
        console.log("getting recent posts")
    }
}

// Module
module.exports = FacebookRequest; // creating the facebook request module