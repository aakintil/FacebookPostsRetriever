var scrape = require('html-metadata'),
    fs = require('file-system'), // to write to a file 
    request = require('request'), // to make actual requests to the facebook api
    pathExists = require('path-exists'), // to check whether a file exists or not, 
    childProcess = require('child_process');
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
            title: "",
            site_name: "",
            type: "",
            message: "",
            link: "",
            description: "",
            image: {
                url: "",
                width: 0,
                height: 0,
            },
            duration: "",
            album: "",
            musician: "",
            audio: {
                url: "",
                type: ""
            },
            created_time: "",
            from: {
                name: ""
            },
            like_count: 0
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
        var post = posts[0];

        for (var attr in post) {
            if (attr === "urls") {
                var urlsArray = post[attr];
                for (var index in urlsArray) {
                    var url = urlsArray[index];
                    if (url['message']) {
                        scrape(url['message']).then(function (metadata) {
                            // console.log("meta data for a messsage link\n", metadata);
                            // then we create data object that will store all the necessary information in order to create the ultimat post 
                            // --- 
                            // if this openGraph.type === 'video', 'song', or 'blog'
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
                        });
                    }
                }
            }
        }
    }
}

// Module
module.exports = MetaDataRetrieval; // creating the facebook request module