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
    pathExists = require('path-exists'), // to check whether a file exists or not, 
    childProcess = require('child_process')

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
        // works for getting posts, doesn't work for getting more info about groups
        tempAccessToken: 'EAACEdEose0cBABTbpZBQURYmfR2uZCLsZAKfnTVEJDpum45Hd0HsC9iPNriOD5qCHMgXWAGS4fdFjE6kzduRZAVZCQqoge25LnDlZBbqgvsWmWSaYEE8KHChUxKvqDm77pWhtPdQdM1F8WjgOZCouUUvMSZBGbx9yLeWg9mxkcclRKupvwkEALuARPSylQKtNVcZD', // need to go to https://developers.facebook.com/tools/explorer/ & change the access token every 2 hours || works for getting more group info ( like unread posts ), but isn't perminent 
        retrievedPostsArray: [],
        newUntil: null,
        getGroupURL: 'https://graph.facebook.com/me/groups?access_token=',
        currentPostIndex: '',
        numberOfRetrievedPosts: 0,
        postsJSONPath: 'data/saveMyInbox.json'
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
            groupID = this.defaults.groupID,
            self = this;
        return request(url, function (error, response, body) {
            // grab the body response
            // contains all groups and looks like...
            var g = JSON.parse(body),
                groups = g.data;

            // catch and scream about errors...
            // don't understand what the indexOf.call does though
            if (error) {
                console.log("error ", error);
                process.exit();
            } else if (indexOf.call(groups, "error") >= 0) {
                console.log("posts error ", groups.error);
                process.exit();
            }

            //            console.log( groups)
            for (var i in groups) {
                if (groups[i].id === self.defaults.groupID) {
                    console.log(groups[i])
                }
            }
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

        })
    },

    // where the magic happens. recursive 
    retrievePostsFromGroup: function (groupID, url) {
        var file = this.defaults.postsJSONPath,
            url = this.generateDynamicURL();
        this.getAllPosts(url);

        // ---- TODO ----
        // when we figure out how to get new posts do something like this
        /*
        // check json file for the most recent data
        pathExists(file).then(exists => {
            // if it's there then we already have some data, and we can just call the get groups to see if there are new posts
            if (exists) {
                // get group status
                // see if there are any unread posts
                // this.untilTime = moment(jsonFile[0].created_time) // figure out format
                // self.getRecentPosts( untilTime ); 
                
                // store the results
                // have to specify UTF8 or else it'll return buffers...which i dunno how to deal with
                var posts = JSON.parse(fs.readFileSync(file, 'utf8'));

                // console.log(self.defaults.retrievedPostsArray)
                self.checkForUpdates();
            }
            // else begin looping through the entirety of the facebook posts
            else {
                //                console.log("---- ASYNCHRONOUS CALL ... #3 is actually called before #2 ----");
                //                console.log("2. successfully got group id...moving on... \n");
                var url = self.generateDynamicURL();
                self.getAllPosts(url);
            }
        });
        */
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
        var sortBy = function (posts, attr) {
                return _.pluck(posts, attr).sort();
            },
            vars = this.defaults,
            p = "",
            posts = [],
            self = this;

        // Return the npm request result
        return request(url, function (error, response, body) {
            // grab the body response
            p = JSON.parse(body);
            posts = p.data;

            // catch and scream about errors...
            // don't understand what the indexOf.call does though
            if (error) {
                console.log("error ", error);
                process.exit();
            } else if (indexOf.call(posts, "error") >= 0) {
                console.log("posts error ", posts.error);
                process.exit();
            }

            // number of posts fetched
            var numberOfPostsFetched = posts.length;

            // if we successfully retrieved posts
            if (numberOfPostsFetched > 0) {

                // tally how many posts we have 
                self.defaults.numberOfRetrievedPosts += numberOfPostsFetched;

                // add the posts into an array for storage. 
                self.defaults.retrievedPostsArray = self.defaults.retrievedPostsArray.concat(posts);

                // get the oldest post
                var oldestPost = _.last(posts).created_time,
                    // create a new until variable for generating the URL
                    updatedUntilVar = moment(oldestPost).unix() - 1,
                    // show us what that date is just for debugging purposes
                    updatedUntilDate = moment(oldestPost).format("dddd, MMMM Do YYYY, h:mm:ss a"),
                    // generate an updated url with a new until variable
                    updatedURL = self.generateDynamicURL(undefined, updatedUntilVar);
                console.log(" \n just fetched ", numberOfPostsFetched, " posts \n getting posts starting from: [ ", updatedUntilDate, " ] ");

                // recursively call this function until we have all the posts
                self.getAllPosts(updatedURL);
            }
            // we've finished retrieving all the posts 
            else {
                console.log("\n\n\n ********* SUCCESS ********* \n --- finished grabbing ", self.defaults.numberOfRetrievedPosts, "posts ---");
                console.log("newest post: ", moment(_.first(self.defaults.retrievedPostsArray).created_time).format("MMMM Do YYYY"));
                console.log("oldest post: ", moment(_.last(self.defaults.retrievedPostsArray).created_time).format("MMMM Do YYYY"));
                console.log("---------------------------------------------------");

                fs.writeFile('data/saveMyInbox.json', JSON.stringify(self.defaults.retrievedPostsArray), function (err) {
                    console.warn("\n ...exporting posts to a json file")
                    if (err) {
                        console.error('there was an error outputting the file');
                    } else {
                        console.log("Output saved to data/saveMyInbox.json");
                        process.exit(1); 
                    }
                });
            };


        })
    },

    getRecentPosts: function (untilTime) {
        console.log("getting recent posts")
    },

    // function that creates a url that appends a new until time so that we can keep looping through 
    // facebook posts as far back as the group was created. 
    generateDynamicURL: function (since, untilTime) {
        var url = "https://graph.facebook.com/" + this.defaults.groupID + "/feed?limit=100&access_token=" + this.defaults.accessToken + "&fields=from,to,message,full_picture,link,name,caption,description,created_time,updated_time,likes,comments.limit(999)",
            untilDate = moment(untilTime).format("dddd, MMMM Do YYYY, h:mm:ss a");
        // if there's no until time, then it should be the number of seconds since the Unix Epoch
        if (untilTime === undefined) {
            untilTime = "&until=" + (moment().unix());
            url += untilTime;
        } else { // otherwise just keep it as is. 
            url += "&until=" + untilTime;
        }
        // if since is undefined, 
        // then just leave it as undefined
        // TODO 
        // ---------
        // a little unsure about this, but figure out this logic!
        if (since !== undefined) {
            url += "&since=" + since;
        } else {
            if (this.defaults.downloadedSince !== null) {
                since = "&since=" + this.defaults.downloadedSince;
                url += since;
            } else {
                since = "&since=0";
                url += since;
            }
        }
        return url;
    }
}

// Module
module.exports = FacebookRequest; // creating the facebook request module