var facebookRequest = require('./custom_modules/facebook-posts-request'),
    postsURLStripper = require('./custom_modules/facebook-posts-url-stripper'),
    metadata = require('./custom_modules/metadata.js')
_FR = new facebookRequest();
_PF = new postsURLStripper();
_MD = new metadata();

// get the posts
// _FR.retrievePostsFromGroup();

// format the results
// _PF.retrieveData(); 

// get more meta data 
_MD.retrieveData();

//console.log(_MD)