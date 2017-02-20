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

//    , url = "http://www.billboard.com/articles/columns/hip-hop/7480161/frank-ocean-visually-stunning-nikes-video-endless-boys-dont-cry-asap-rocky-apple-music";
//scrape(url).then(function (metadata) {
//    console.log("wtf", metadata);
//});

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
        }
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
        console.log("scraping posts for metadata");
        //        console.log(posts[22]);
        var scrapedPosts = [],
            sPArray = this.defaults.scrapedPosts,
            self = this,
            doNothing = function () {}, // does nothing
            // scrape it and save the open graph data
            initScraping = function (url) {
                // if the url exists and is valid
                if (url !== undefined && url.length > 0) {
                    scrape(url, function (error, metadata) {
                        if (metadata && metadata.openGraph !== undefined) {
                            console.log(metadata.openGraph)
                                // this is all we want...
                            return metadata.openGraph;
                        } else
                            return;
                    });

                }
                // otherwise just return something unimportant
                else {
                    return false;
                }
            };

        // ERRORS
        // -- 30 - 35
        // non occur from 
        // -- 0 - 25 
        // -- 25 - 30
        var isNotEmpty = function (obj) {
            for (var i in obj) {
                console.log(i)
                if (i)
                    return true;
            }
            return false;
        }
        eventEmitter.on('finished', function (array) {
            console.log("finished scraping urls from posts")
            console.log("openGraph: ", array[5].openGraph)
                //            var x = _.uniq(_.collect(sPArray, function (x) {
                //                //                console.log(x)
                //                return JSON.stringify(x);
                //            }));
                //            console.log(x)
        });
        // go through each post's url object. 
        // if it's a message or a link attribute, then scrape it
        // else, don't do anything
        var messages = [],
            links = [],
            invalid = [],
            testPost = {};
        for (var i = 0; i < posts.length; i++) {
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
                    openGraph: {}
                };


                // if it has an array of urls, we want to scrape all that information
                if (attr === "urls") {
                    // store the url array
                    var urlsArray = post[attr];
                    // loop through
                    // -- TODO -- 
                    // have to think about this logic again!
                    for (var index in urlsArray) {
                        var url = urlsArray[index];

                        // if we have a url in the link, scrape it
                        if (url['link']) {
                            // if it returns false, then there was some kind of error and we don't want to messup the original object
                            // otherwise, the openGraph attribute is now the metadata information 
                            // and we have far more context
                            (initScraping(url['link']) === false ? doNothing() : newPost.openGraph = initScraping(url['link']))

                            //                            console.log("\n\n======================")
                            //                            console.log(newPost)
                            //                            console.log("======================\n\n")
                        }
                        // if we have a url in the message field, scrape it
                        else if (url['message']) {
                            (initScraping(url['message']) === false ? doNothing() : newPost.openGraph = initScraping(url['message']))
                        }
                        // if the previous failed and we have a url in the description field, scrape it
                        else if (url['description']) {
                            (initScraping(url['description']) === false ? doNothing() : newPost.openGraph = initScraping(url['description']))
                        }
                        // otherwise, we don't have any urls, and we can just add the object into the scrape array 
                        // insert the newpost with hopefully some open graph data into the scraped array
                        sPArray.push(newPost);
                    }
                }
            }


            if (i === posts.length - 1) {
                //                console.log(scrapedPosts, );
                eventEmitter.emit('finished', sPArray);
            }
        }
    }
}

// Module
module.exports = MetaDataRetrieval; // creating the facebook request module

// example of scraped data structure 
/*
{
    general: {
        canonical: 'https://www.youtube.com/watch?v=TwyPsUd9LAk',
        description: 'New single "I\'m Better" ft. Lamb available for streaming and download now: https://missyell.io/tt/imbetter Director: Dave Meyers & Missy Elliott Executive Pr...',
        shortlink: 'https://youtu.be/TwyPsUd9LAk',
        title: 'Missy Elliott - I\'m Better ft. Lamb [Official Video] - YouTube',
        lang: 'en'
    },
    jsonLd: {
        '@context': 'http://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [[Object]]
    },
    openGraph: {
        site_name: 'YouTube',
        url: 'https://www.youtube.com/watch?v=TwyPsUd9LAk',
        title: 'Missy Elliott - I\'m Better ft. Lamb [Official Video]',
        image: {
            url: 'https://i.ytimg.com/vi/TwyPsUd9LAk/hqdefault.jpg'
        },
        description: 'New single "I\'m Better" ft. Lamb available for streaming and download now: https://missyell.io/tt/imbetter Director: Dave Meyers & Missy Elliott Executive Pr...',
        type: 'video',
        app_id: '87741124305'
    },
    schemaOrg: {
        items: [[Object]]
    },
    twitter: {
        card: 'player',
        site: '@youtube',
        url: 'https://www.youtube.com/watch?v=TwyPsUd9LAk',
        title: 'Missy Elliott - I\'m Better ft. Lamb [Official Video]',
        description: 'New single "I\'m Better" ft. Lamb available for streaming and download now: https://missyell.io/tt/imbetter Director: Dave Meyers & Missy Elliott Executive Pr...',
        image: 'https://i.ytimg.com/vi/TwyPsUd9LAk/hqdefault.jpg',
        app: {
            name: [Object],
            id: [Object],
            url: [Object]
        },
        player: {
            url: 'https://www.youtube.com/embed/TwyPsUd9LAk',
            width: '1280',
            height: '720'
        }
    }
}
                             */