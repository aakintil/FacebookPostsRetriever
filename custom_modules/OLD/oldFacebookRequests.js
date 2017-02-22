/* TODO */
// -- UPDATE -- // 
var express = require('express')
    , path = require('path')
    , Datastore = require('nedb')
    , _ = require('underscore')
    , moment = require('moment')
    , fs = require('fs')
    , request = require('request')
    , app = express();
var indexOf = [].indexOf || function (item) {
        for (var i = 0, l = this.length; i < l; i++) {
            if (i in this && this[i] === item) return i;
        }
        return -1;
    }
    , appDB = new Datastore({
        filename: 'db/app.db.json'
        , autoload: true
    })
    , _SMI = new Datastore({
        filename: 'db/save.my.inbox.js'
        , autoload: false
    })
    , _FUNC = new Datastore({
        filename: 'db/function.js'
        , autoload: false
    })
    , _SUPR = new Datastore({
        filename: 'db/superior.js'
        , autoload: false
    });
// Removing all documents with the 'match-all' query
// weird persistent access token hack that doesn't work 
// https://graph.facebook.com/oauth/access_token?client_id=766241740105535&client_secret=9a58c535db3b7e9c8bd26b2179d91a85&grant_type=fb_exchange_token&fb_exchange_token=CAACEdEose0cBAH7zWnDqWlRSkc3xcI9aUjLSobttOA1o3662qhEEYn5X1zaUuH2UDTOZBhHUMlbEh2WfRRh8p3NiiLH554CilHnnvxbkcNJlalqOZB3tI0rZAv8ZBWhl9FdrLdLUfy2FMZB6ULQv8pth2sYstMXsR0MNgFv8B7AwaO0Tk5U7YiubPHAm9nObkS0qOqwHPYgZDZD
function APIRequest() {
    this.res_data = [];
    this.exportDatabase = [];
    this.downloadSince = null;
    this.group_id = "";
    this.groupIDs = [];
    this.count = 0;
    this.accessToken = 'EAACEdEose0cBAA76Nfm1XoyVGPAacrPHp7ZCKLIssmVP76x7IGeimHRrtRiTTPN1NkzE2yZApBeMsbNMhcVPGUczLScnveC8ApQFrHJlPqn2lIeST3s0oIeYAB3ZBtRC9bOk7kJe9coXUyFybA95zvfZBIrHkIMpcL6DpAm0r6ZBQU6catoXiXys9Hq8cXx4ZD';
    this.posts = [];
    this.new_until = null;
    this.getGroupURL = "https://graph.facebook.com/me/groups?access_token=" + this.accessToken;
    this.currentPostIndex = 0;
}
// Main logic for all requests to put posts into a local db
APIRequest.prototype = {
    // check to see if accessToken is still valid
    checkAccessToken: function () {
        // come back and finish
    }, // if accessToken is invalid, we have to get a new one 
    getAccessToken: function () {
        // come back and finish 
    }, // store all group ids for future reference 
    storeAllGroupIDs: function (name, id, index) {
        this.groupIDs[index] = {
            name: name
            , id: id
        };
    }, // get all group ids
    getGroupIDs: function () {
        return this.groupIDs;
    }, // get the facebook group posts
    getGroups: function () {
        var url = this.getGroupURL
            , group_id = this.group_id
            , self = this;
        return request(url, function (error, response, body) {
            // grab the body response
            groups = JSON.parse(body);
            // catch and scream about errors...
            // don't understand what the indexOf.call does though
            if (error) {
                console.log("error ", error);
                process.exit();
            }
            else if (indexOf.call(groups, "error") >= 0) {
                console.log("posts error ", groups.error);
                process.exit();
            }
            // now we have a list of groups
            // find save mah inbox group
            // save it's id so we can create an actual req to SMI posts
            console.log("\n1. successful graph explorer api call \n");
            for (var i in groups.data) {
                // grabbing all necessary group ids for future reference
                self.storeAllGroupIDs(groups.data[i].name, groups.data[i].id, i);
                if (groups.data[i].name === 'Save Mah Inbox') {
                    self.saveCurrentGroupId(groups.data[i].id);
                    console.log("---- ASYNCHRONOUS CALL ... #3 is actually called before #2 ----");
                    console.log("2. successfully got group id...moving on... \n");
                    var getPostsURL = self.timeParamUrl();
                    self.getPostsForGroup(getPostsURL);
                }
            }
        })
    }, // save a specific group id
    // might delete we have a db / storage of all MY groups and their ids
    saveCurrentGroupId: function (group_id) {
        this.group_id = group_id;
    }, // get all the music posts for a specific group
    getPostsForGroup: function (url) {
        console.log("\n 3. passing group id \n", this.group_id, "\n");
        // retrieve all updated times from the post object & sort it
        function sortedUpdated(posts) {
            return _.pluck(posts.data, 'updated_time').sort();
        }
        var group_id = this.group_id
            , accessToken = this.accessToken
            , new_until = this.new_until
            , _POSTS = this.res_data
            , count = this.count
            , currentPostIndex = 0
            , numPostsFetched = "", //            currentPostIndex = this.currentPostIndex,
            self = this;
        return request(url, function (error, response, body) {
            // grab the body response
            posts = JSON.parse(body);
            // catch and scream about errors...
            // don't understand what the indexOf.call does though
            if (error) {
                console.log("error ", error);
                process.exit();
            }
            else if (indexOf.call(groups, "error") >= 0) {
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
                var newUntil = moment(_.first(sortedUpdated(posts))).unix() - 1
                    , newUntilDate = moment(_.first(sortedUpdated(posts))).format("dddd, MMMM Do YYYY, h:mm:ss a")
                    , newURL = self.timeParamUrl(undefined, newUntil);
                // console.log( ' \n ====== current posts fetch length [ ', numPostsFetched, ' ] ====== ' ); 
                console.log(" \n getting posts from: [", 0, "]   --> until : [", newUntilDate, "] ");
                // console.log( ' \n hopefully a newer url with date [ ', newURL, ' ]' ); 
                currentPostIndex++;
                self.getPostsForGroup(newURL);
            }
            else {
                console.log("\nfinished grabbing all posts");
                console.log("\n....about to export to a file");
                fs.writeFile('db/test.js', JSON.stringify(self.exportDatabase), function (err) {
                    if (err) {
                        console.error('YOU FUCKED UP');
                    }
                    else {
                        console.log("Output saved to /test.js");
                        process.exit()
                    }
                });
            };
        });
        //        console.log( "\nwe have... ", appDB.count( {}, function( err, count ) { 
        //            if ( err ) 
        //                console.log( "you don fucked up..."); 
        //            else 
        //                console.log( count ); 
        //        }) , " posts ------- fin -------" );
    }, // edit the url to append Until Specific Date clause
    // so that we can loop through facebook until there are no more posts in the group
    timeParamUrl: function (since, untilTime) {
        var url = "https://graph.facebook.com/" + this.group_id + "/feed?limit=100&access_token=" + this.accessToken + "&fields=from,to,message,full_picture,link,name,caption,description,created_time,updated_time,likes,comments.limit(999)"
            , untilDate = moment(untilTime).format("dddd, MMMM Do YYYY, h:mm:ss a");
        if (untilTime === undefined) {
            untilTime = "&until=" + (moment().unix());
            url += untilTime;
        }
        else {
            url += "&until=" + untilTime;
        }
        if (since !== undefined) {
            url += "&since=" + since;
        }
        else {
            if (this.downloadSince !== null) {
                since = "&since=" + this.downloadSince;
                url += since;
            }
            else {
                since = "&since=0";
                url += since;
            }
        }
        return url;
    }, // export db
    exportDB: function (array) {
        console.log(array.length);
        require('fs').writeFile('db/test.json', JSON.stringify(array), function (err) {
            if (err) {
                console.error('Crap happens');
            }
        });
    }
}

function boundedWrapper(object, method) {
    return function () {
        return method.apply(object, arguments);
    };
}

function getGroups(accessToken) {
    var url = "https://graph.facebook.com/me/groups?access_token=" + accessToken;
}
a = new APIRequest();
a.getGroups();