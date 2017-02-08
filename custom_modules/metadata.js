var scrape = require('html-metadata')
    , url = "http://www.billboard.com/articles/columns/hip-hop/7480161/frank-ocean-visually-stunning-nikes-video-endless-boys-dont-cry-asap-rocky-apple-music";
scrape(url).then(function (metadata) {
    console.log("wtf", metadata);
});