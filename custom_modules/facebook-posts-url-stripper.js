var scrape = require('html-metadata'),
    fs = require('file-system'), // to write to a file 
    request = require('request'), // to make actual requests to the facebook api
    pathExists = require('path-exists'), // to check whether a file exists or not, 
    childProcess = require('child_process'),
    extractURL = require('get-urls');

function FacebookPostsURLStripper() {

    this.defaults = {
        rawData: [],
        rawDataPath: 'data/saveMyInbox.json',
        postsWithURLs: [],
        formattedData: [],
        formattedDataPath: 'data/formatted.json'
    }
}

FacebookPostsURLStripper.prototype = {
    // get data from file and store it
    retrieveData: function () {
        var file = this.defaults.rawDataPath,
            self = this;

        pathExists(file).then(exists => {
            // if it's there then we already have some data, and we can just call the get groups to see if there are new posts
            if (exists) {
                var posts = JSON.parse(fs.readFileSync(file, 'utf8'));
                self.stripOutURLs(posts);
            } else {
                console.warn("*********** ERROR ***********")
                console.warn(" THERE IS NO JSON FILE TO PARSE....");
            }
        })
    },

    // start to parse and find all the urls in an object and save it in a new object
    stripOutURLs: function (posts) {

        // testing purposes
        // grab  apost
        var post = posts[0];
        // create a post url attr
        post.urls = [];

        // loop through each attr in the post
        for (var attr in post) {
            // if the attribute is a string
            if (typeof post[attr] === "string") {
                // then see if there's a url, and extract it
                var extractedURL = extractURL(post[attr]),
                    obj = {};
                // loop through each "Set" object that contains a url
                extractedURL.forEach(function (url) {
                    // store the post attr and url in a new object
                    obj[attr] = url;
                    // push that object into an array in the post 
                    post.urls.push(obj);
                });
            }
        }
        console.log(post);

        // loop through all the posts
        for (var p in posts) {
            // store each post
            var post = posts[p];

            // loop through each attr in the post
            for (var attr in post) {
                // copy and paste the above code. 
            }
        }

        // this method
        // this.savePosts( posts, 'postsWithURLs' ); 
        // this.retrieveMetaData( this.defaults.postsWithURLs);
        
        // OR
        // this.savePostsToFile( "saveMyInboxURLs.json" );
        // then call metadata npm in the init.js file
    },

    retrieveMetaData: function () {

    },

    restructurePost: function (data) {
        var post = {

        };

        return post;
    },

    savePosts: function (posts, array) {
        this.defaults[array] = this.defaults[array].concat(posts);
    }
}

// Module
module.exports = FacebookPostsURLStripper; // creating the facebook request module