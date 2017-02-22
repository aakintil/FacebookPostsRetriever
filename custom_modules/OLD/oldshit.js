            if (post['urls']['link'] !== undefined) {
                var url = post['urls']['link'][0];
                (function (url, post) {
                    scrape(url, function (error, metadata) {
                        if (error) {
                            // console.log(error.name, "\n\n")
                        } else if (metadata) {
                            post.openGraph = metadata.openGraph;
                            _LINKS.push(post);
                        }
                        if (++index >= (self.defaults.tallies.links + self.defaults.tallies.messages)) {
                            links();
                            //                            eventEmitter.emit("final");
                        }
                        console.log(index + '*');
                    });
                })(url, post);
            }
            // go through and only scrape one url attribute. 
            // else move onto the messages attribute and try those
            else if (post['urls']['message'] !== undefined) {
                var url = post['urls']['message'][0];
                (function (url, post) {
                    scrape(url, function (error, metadata) {
                        if (error) {
                            // console.log(error.name, "\n\n")
                        } else if (metadata) {
                            post.openGraph = metadata.openGraph;
                            _MESSAGES.push(post);
                        }
                        if (++index >= (self.defaults.tallies.links + self.defaults.tallies.messages)) {
                            messages();
                        }
                        console.log(index + '-');
                    });
                })(url, post);
            }