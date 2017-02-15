var cheerio = require('cheerio');
var preq = require('preq'); // Promisified request library
var parseDublinCore = require('html-metadata').parseDublinCore;
var scrape = require('html-metadata'),
    fs = require('file-system'), // to write to a file 
    request = require('request'), // to make actual requests to the facebook api
    pathExists = require('path-exists'), // to check whether a file exists or not, 
    childProcess = require('child_process'),
    _ = require('underscore'),
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
            self = this,
            doNothing = function () {}, // does nothing
            // scrape it and save the open graph data
            initScraping = function (url, newPost) {


                scrape(url, function (error, metadata) {
                    if (error) {
                        doNothing();
                    } else {
                        newPost.openGraph = metadata.openGraph;
                        // then we create data object that will store all the necessary information in order to create the ultimate post 
                        // console.log("----------------------- \n", newPost, "----------------------- \n\n");
                        scrapedPosts.push(newPost);
                        console.log(scrapedPosts.length)
                    }
                });
                //                scrape(url).then(function (metadata) {
                //                    // save the open graph data
                //                    console.log(url)
                //                        // if no issues
                //                    if (metadata) {
                //                        newPost.openGraph = metadata.openGraph;
                //                        // then we create data object that will store all the necessary information in order to create the ultimate post 
                //                        //                    console.log("----------------------- \n", newPost, "----------------------- \n\n");
                //                        //                        scrapedPosts.push(newPost);
                //                        //                        console.log(scrapedPosts.length)
                //                    }
                //                    // --- 
                //                    // if this openGraph.type === 'video', 'song', or 'blog'
                //                })
            };

        //        console.log( post )
        // ERRORS
        // -- 30 - 35
        // non occur from 
        // -- 0 - 25 
        // -- 25 - 30
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
                    for (var index in urlsArray) {
                        var url = urlsArray[index],
                            type = '';

                        if (url['message']) {
                            initScraping(url['message'], newPost)
                        } else if (url['link']) {
                            initScraping(url['link'], newPost)
                        } else {
                            break;
                        }
                        // TODO !!!! ----- **** 
                        // what happens if there's no link or message? 
                    }
                }
            }
        }

        console.log("done scraping and creating new objects \n");
//                setTimeout(function () {
//                    console.log(scrapedPosts);
//                }, 10000)

    }
}

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
// Module
module.exports = MetaDataRetrieval; // creating the facebook request module