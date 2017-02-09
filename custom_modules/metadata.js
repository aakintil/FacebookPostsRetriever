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

    this.defaults = {

    }
}

MetaDataRetrieval.prototype = {

}

// Module
module.exports = MetaDataRetrieval; // creating the facebook request module