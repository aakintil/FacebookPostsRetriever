var cheerio = require('cheerio');
var preq = require('preq'); // Promisified request library
var parseDublinCore = require('html-metadata').parseDublinCore;
var scrape = require('html-metadata'),
    fs = require('file-system'), // to write to a file 
    request = require('request'), // to make actual requests to the facebook api
    pathExists = require('path-exists'), // to check whether a file exists or not, 
    childProcess = require('child_process'),
    events = require('events'),
    _ = require('underscore'),
    eventEmitter = new events.EventEmitter(),
    moment = require('moment'); // to reformat date/time so we can understand

var debug = function (name, input) {
    console.log("\n\n ======== ", name, " ========");
    console.log(input);
    console.log("================================\n\n");
}

function MetaDataRetrieval() {

    // TODO 
    // -- figure out what to do with comments and associated information with a post
    this.defaults = {
        postsWithURLsPath: 'data/postsWithURLs.json',
        scrapedPosts: [],
        newPost: {
            message: "",
            link: "",
            created_time: "",
            from: {
                name: ""
            },
            like_count: 0,
            openGraph: {

            }
        },
        iterator: 0,
        postsLength: 0
    }
}

MetaDataRetrieval.prototype = {
    retrieveData: function () {
        var file = this.defaults.postsWithURLsPath,
            self = this;

        pathExists(file).then(exists => {
            // if it's there then we already have some data, and we can just call the get groups to see if there are new posts
            if (exists) {
                var posts = JSON.parse(fs.readFileSync(file, 'utf8'));
                self.scrapePosts(posts);
            } else {
                console.warn("*********** ERROR ***********")
                console.warn(" THERE IS NO JSON FILE TO PARSE....");
            }
        })
    },

    scrapePosts: function (posts) {

        var scrapedPosts = [],
            sPArray = this.defaults.scrapedPosts,
            self = this,
            doNothing = function () {}, // does nothing
            // scrape it and save the open graph data
            initScraping = function (url, newPost, index) {
                var self = this;
                this.index = index;
                scrape.prototype.index = index;
                scrape(url, function (error, metadata) {
                    console.log("this is what the index is: ", scrape.prototype.index);
                    if (error) {
                        return;
                    } else if (metadata) {
                        newPost.openGraph = metadata.openGraph;
                    }
                });
            };

        eventEmitter.on('finished', function (postsArray) {
            console.log("finished scraping urls from posts");
            //            console.log(sPArray);
            //            var x = _.uniq(_.collect(sPArray, function (x) {
            //                //                console.log(x)
            //                return JSON.stringify(x);
            //            }));
            //            console.log(x)
        });
        var i = 0;
        this.defaults.postsLength = posts.length;
        var updatedPosts = [];

        // format the posts and create a new data structure
        updatedPosts = this.createNewDataStructure(posts);

        // now we have to figure out a way of storing the metadata 
        this.storeMetadata(updatedPosts);
    },

    createNewDataStructure: function (posts) {
        var updatedPosts = [];
        for (i = 0; i < posts.length; i++) {
            var post = posts[i];

            for (var attr in post) {
                // create a new post consolidated object
                var newPost = {
                    message: post['message'] || 'NO MESSAGE',
                    link: (post['link'] === undefined ? 'NO LINK' : post['link']),
                    created_time: moment(post['created_time']).format("MMMM Do, YYYY"),
                    from: post['from']['name'],
                    image: (post['full_picture'] === undefined ? 'NO IMAGE' : post['full_picture']),
                    likes: (post['likes'] ? post['likes']['data'].length : 0),
                    description: (post['description'] === undefined ? 'NO DESCRIPTION' : post['description']),
                    urls: (post['urls'] === undefined ? 'NO URLS' : post['urls']),
                    openGraph: {}
                };
            }
            
            var p = newPost['urls'],
                tempObj = {};
            for (var j in p) {
                // i want to store the keys and values separately in an object so i can call on them rather than looping through an array. 
                // just removes an extra step down the line
                tempObj[_.keys(Object.assign({}, p[j]))] = _.values(Object.assign({}, p[j]));
            }
            newPost['urls'] = tempObj;


            // we only want posts that have access to metadata 
            if (post['urls']) {
                updatedPosts.push(newPost);
            }
        }

        return updatedPosts;
    },

    storeMetadata: function (posts) {

        for (var i = 0; i < posts.length; i++) {

        }
    }
}


// Module
module.exports = MetaDataRetrieval; // creating the facebook request module