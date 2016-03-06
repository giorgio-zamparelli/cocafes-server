/*jshint unused: false, node: true */
/*jslint unparam: true, node: true */

'use strict';

const Rx = require('rx');
const http = require('http');
const https = require('https');
const express = require('express');
const compression = require('compression');
const mongojs = require('mongojs');
const swagger_node_express = require("swagger-node-express");
const bodyParser = require( 'body-parser' );
const Facebook = require('./facebook.js');
const CheckinStorage = require('./checkin-storage.js');
const UserStorage = require('./user-storage.js');
const VenueStorage = require('./venue-storage.js');
const memoryCache = require('memory-cache');
const fileSystem = require("fs");
const ejs = require('ejs');
const app = express();

const development = "development";
const production = "production";
const environment = process.env.NODE_ENV;
const host = development === environment ? "localhost" : "www.cocafes.com";
const port = development === environment ? 80 : 443;
const address = (port === 443 ? "https://" : "http://") + host + (port === 80 || port === 443 ? "" : ":" + port);
const versionManifest = process.env.SOURCE_VERSION ? "last git commit " + process.env.SOURCE_VERSION : "server started at " + new Date();

app.use(compression());
app.set('strict routing', true);
app.set('views', __dirname);
app.engine('.html', ejs.__express);
app.engine('.mf', ejs.__express);
app.set('view engine', 'ejs');

app.all('*', function(request, response, next) {

    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Methods', '*');
    response.header('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization');
    response.header('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
    response.header('Access-Control-Max-Age', '1000');

    response.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    response.header('Expires', '-1');
    response.header('Pragma', 'no-cache');

    next();

});

const dependencies = [

    "bower_components/angular/angular.js",
    "bower_components/angular-route/angular-route.js",
    "bower_components/moment/moment.js",
    "bower_components/rxjs/dist/rx.all.js",

    "scripts/app.js",

    "scripts/model/User.js",
    "scripts/model/UUID.js",

    "scripts/helpers/StringToColorConverter.js",

    "scripts/filters/filters.js",

    "scripts/directives/directives.js",

    "scripts/services/UsersStorage.js",

    "scripts/services/Api.js",
    "scripts/services/NodeLocalStorage.js",
    "scripts/services/SessionManager.js",
    "scripts/services/SessionPreferences.js",

    "scripts/controllers/HeaderController.js",
    "scripts/controllers/LoginController.js",
    "scripts/controllers/UsersController.js",
    "scripts/controllers/UserController.js",
    "scripts/controllers/SettingsController.js",
    "scripts/controllers/VenuesController.js",
    "scripts/controllers/VenueController.js",
    "scripts/controllers/AddVenueController.js",
    "scripts/controllers/SearchPlaceController.js",

    "bower_components/material-design-icons/iconfont/MaterialIcons-Regular.woff2",
    "bower_components/material-design-icons/iconfont/MaterialIcons-Regular.woff",
    "bower_components/material-design-icons/iconfont/MaterialIcons-Regular.ttf",

    "views/header.html",
    "views/login.html",
    "views/settings.html",
    "views/user.html",
    "views/users.html",
    "views/venue.html",
    "views/venues.html"

];

app.get('/electron', function (request, response, next) {

    response.redirect('/electron/index.html');

});

app.get(['/electron/', '/electron/index.html'], function (request, response, next) {

    let dependenciesString = "";

    if (development === environment) {

        for (let dependency of dependencies) {

            if (dependency.indexOf(".js") > -1) {
                dependenciesString += `<script src="./${dependency}"></script>\n\t`;
            }

        }

    } else {

        dependenciesString = `<script src="./scripts/main.min.js"></script>`;

    }

    response.render('electron/index.html', {"dependencies": dependenciesString});

});

app.get('/electron/scripts/main.min.js', function (request, response, next) {

    var cached = memoryCache.get('/electron/scripts/main.min.js');

    if (!cached) {

        cached = "";

        for (let dependency of dependencies) {

            if (dependency.indexOf(".js") > -1) {
                cached += fileSystem.readFileSync("./electron/" + dependency);
            }

        }

        memoryCache.put('/electron/scripts/main.min.js', cached);

    }

    response.header('content-type', 'application/javascript');
    response.send(cached);

});

app.get('/electron/appcache.mf', function (request, response, next) {

    var cached = memoryCache.get('/electron/appcache.mf');

    if (!cached) {

        let dependenciesList = "\n";

        if (development !== environment) {
            dependenciesList += "scripts/main.min.js"
        }

        // for (let dependency of dependencies) {
        //     if (dependency.indexOf(".js") === -1 || development === environment) {
        //         dependenciesList += "\n" + dependency;
        //     }
        // }

        cached =   `CACHE MANIFEST
                    #${versionManifest}

                    CACHE:
                    index.html
                    ${dependenciesList}

                    NETWORK:
                    *
                    `;

        memoryCache.put('/electron/appcache.mf', cached);

    }

    response.header('content-type', 'text/cache-manifest');
    response.send(cached);

});

app.use(function (request, res, next) {

    if (!request.secure && developemnt !== environment) {

        return response.redirect('https://' + request.get('host') + request.url);

    }

    next();

});

app.use('/electron', express.static(__dirname + '/electron'));

app.get('/facebook_login_success.html', function (request, response, next) {

    response.render('facebook_login_success.html');

});

app.use('/favicon.ico', express.static(__dirname + '/favicon.ico'));
app.get('/', function (request, response, next) {

    venueStorage.getVenues().subscribe(venues => {

        response.render('website/index.html', {"venues": venues});

    });

});

app.get('/thailand/chiang-mai', function (request, response, next) {

    venueStorage.getVenues({countryCode : "TH", city : "Chiang Mai"}).subscribe(venues => {

        response.render('website/index.html', {"venues": venues});

    });

});

app.get('/thailand/koh-lanta', function (request, response, next) {

    venueStorage.getVenues({countryCode : "TH", city : "Koh Lanta"}).subscribe(venues => {

        response.render('website/index.html', {"venues": venues});

    });

});

var swagger = swagger_node_express.createNew(app);

var facebook = new Facebook("1707859876137335", address + "/facebook_login_success.html", "bfc74d90801f5ca51febb8c47d4f146b");



let mongouri;

if (development === environment) {

    mongouri = process.env.COCAFES_MONGO_PRODUCTION_URI;
    //mongouri = "mongodb://localhost:27017/cocafes"; //mongod --dbpath ~/mongodb/cocafes/

} else {

    mongouri = process.env.COCAFES_MONGO_PRODUCTION_URI;

}

const database = mongojs(mongouri);

var checkinStorage = new CheckinStorage(database);
var userStorage = new UserStorage(database);
var venueStorage = new VenueStorage(database);

app.set('port', (process.env.PORT || 3000));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Swagger https://github.com/swagger-api/swagger-node/issues/189

swagger.addPost({

    'spec': {
        path : "/api/v1/authentication/login/facebook",
        nickname : "users"
    },
    'action': function(request, response, next) {

        var facebookCode = request.headers.authorization.replace("Facebook ", "");

        facebook.getAccessToken(facebookCode).subscribe(function(accessTokenResponse) {

            facebook.access_token = accessTokenResponse.access_token;

            if (facebook.access_token) {

                facebook.getUserProfile().subscribe(function(facebookUser) {

                    //console.log(facebookUser);

                    if (facebookUser) {

                        userStorage.getUserByFacebookId(facebookUser.id, function(user) {

                            if (user) {

                                response.json(user);

                            } else {

                                user = {};
                                user.facebookId = facebookUser.id;
                                user.facebookToken = facebook.access_token;
                                user.firstname = facebookUser.first_name;
                                user.lastname = facebookUser.last_name;

                                if (facebookUser.picture && facebookUser.picture.data && facebookUser.picture.data.url) {
                                    user.picture = facebookUser.picture.data.url;
                                }

                                user.friendsIds = {};

                                if (facebookUser.friends && facebookUser.friends.data) {

                                    for (let facebookFriend of facebookUser.friends.data) {

                                        if (facebookFriend && facebookFriend.id && facebookFriend.id.length > 0) {

                                            user.friendsIds[facebookFriend.id] = true;

                                            userStorage.getUserByFacebookId(facebookFriend.id, function(userFriend) {

                                                if (!userFriend.friendsIds[facebookUser.id]) {

                                                    userFriend.friendsIds[facebookUser.id] = true;

                                                    userStorage.addOrUpdateUser(userFriend);

                                                }

                                            });

                                        }

                                    }

                                }

                                userStorage.addOrUpdateUser(user, function(user) {

                                    response.json(user);

                                });

                            }

                        });

                    } else {

                        console.trace();

                        response.status(404).send({ "error" : "Could not retrieve facebook user"});

                    }

                });

            } else {

                console.trace(accessTokenResponse);

                response.status(500).send({ "error" : "Could not fetch facebook access token"});

            }

        });

    }

});

swagger.addPost({

    'spec': {
        path : "/api/v1/checkins",
        "parameters": [{"name": "body","description": "Add Checking Request","required": true,"type": "AddCheckinRequest","paramType": "body"}],
        nickname : "checkins"
    },
    'action': function(request, response, next) {

        let addCheckinRequest = request.body;

        if (addCheckinRequest.connectedWifi && addCheckinRequest.connectedWifi.mac) {

            let checkin = {};

            venueStorage.getVenueByMac(addCheckinRequest.connectedWifi.mac).subscribe(venue => {

                if (venue) {

                    checkin.creationTime = new Date().getTime();
                    checkin.lastEditTime = checkin.creationTime;
                    checkin.userId = addCheckinRequest.userId.replace("\"", "").replace("\"", "");
                    checkin.venueId = venue._id;
                    checkin.venueName = venue.name;

                    checkinStorage.addCheckin(checkin, function(checkin) {

                        response.json(checkin);

                    });

                } else {

                    response.status(204).send();

                }

            });

        } else {

            response.status(204).send();

        }

    }

});

swagger.addGet({

    'spec': {
        path : "/api/v1/users/{userId}",
        parameters : [swagger_node_express.pathParam("userId", "ID of user that needs to be fetched", "string")],
        nickname : "users"
    },
    'action': function(request, response, next) {

        var userId = request.params.userId;

        userStorage.getUserById(userId, function(user) {

            if (user) {
                response.json(user);
            } else {
                response.status(404).send();
            }

        });

    }

});

swagger.addGet({

    'spec': {
        path : "/api/v1/users/{userId}/friends",
        parameters : [swagger_node_express.pathParam("userId", "ID of user that needs to be fetched", "string")],
        nickname : "friends"
    },
    'action': function(request, response, next) {

        var userId = request.params.userId;

        userStorage.getUserById(userId, function(user) {

            if (user) {

                userStorage.getUsersByFacebookIds(Object.keys(user.friendsIds)).flatMap(Rx.Observable.from)
                .flatMap(user => {

                    return checkinStorage.getLatestCheckinByUserId(user._id).map(checkin => {

                        user.latestCheckin = checkin;

                        return user;

                    });

                })
                .toArray()
                .map(users => {

                    return users.sort(function(userLeft, userRight) {

                        var result = 0;

                        var latestCheckinCreationTimeLeft = userLeft && userLeft.latestCheckin && userLeft.latestCheckin.creationTime ? userLeft.latestCheckin.creationTime : -1;

                        var latestCheckinCreationTimeRight = userLeft && userRight.latestCheckin && userRight.latestCheckin.creationTime ? userRight.latestCheckin.creationTime : -1;

                        if (result === 0) {
                            result = latestCheckinCreationTimeRight - latestCheckinCreationTimeLeft;
                        }

                        return result;

                    });

                })
                .subscribe(users => response.json(users));

            } else {
                response.status(404).send();
            }

        });

    }

});

swagger.addGet({

    'spec': {
        path : "/api/v1/venues",
        nickname : "users"
    },
    'action': function(request, response, next){

        venueStorage.getVenues().subscribe(venues => {
            response.json(venues);
        });

    }

});

swagger.addGet({

    'spec': {
        path : "/api/v1/venues/{venueId}",
        parameters : [swagger_node_express.pathParam("venueId", "ID of venue that needs to be fetched", "string")],
        nickname : "venues"
    },
    'action': function(request, response, next) {

        var venueId = request.params.venueId;

        venueStorage.getVenueById(venueId).subscribe(venue => {

            if (venue) {
                response.json(venue);
            } else {
                response.status(404).send();
            }

        });

    }

});

swagger.addPost({

    'spec': {
        path : "/api/v1/venues",
        "parameters": [{"name": "body","description": "Add Venue","required": true,"type": "Venue","paramType": "body"}],
        nickname : "checkins"
    },
    'action': function(request, response, next) {

        let venue = request.body;

        if (!venue) response.status(400).send({ "error" : "Missing venue object in the request body"});
        if (!venue.name) response.status(400).send({ "error" : "Missing venue name"});

        venueStorage.addVenue(venue).subscribe(venue => {

            response.json(venue);

        }, error => {

            response.status(500).send({ error : error});

        });

    }

});

swagger.setApiInfo({
    title: "Cocafes API",
    description: "Cocafes API description",
    termsOfServiceUrl: "",
    contact: "giorgio.zamparelli@gmail.com",
    license: "",
    licenseUrl: ""
});
swagger.configureSwaggerPaths("", "docs/api-docs.json", "");
swagger.configure("http://localhost:" + app.get('port'), "1.0.0");

// Serve up swagger ui at /docs via static route
var docs_handler = express.static(__dirname + '/swagger-ui/');
app.get(/^\/docs(\/.*)?$/, function(req, res, next) {

    if (req.url === '/docs') { // express static barfs on root url w/o trailing slash
        res.writeHead(302, { 'Location' : req.url + '/' });
        res.end();
        return;
    }
    // take off leading /docs so that connect locates file correctly
    req.url = req.url.substr('/docs'.length);
    return docs_handler(req, res, next);

});

let onStartServer = function () {

    var port = server.address().port;
    var protocol = port === 80 ? "http" : "https";
    var host = server.address().address !== "::" ? server.address().address : "localhost";


    console.log('cocafes server listening on %s://%s:%s', protocol, host, port);

};

let server;

// if (development === environment) {

    server = http.createServer(app).listen(app.get('port'), onStartServer);

// } else {
//
//     let options = {
//
//         key: fileSystem.readFileSync('./ssl/server.key'),
//         certificate: fileSystem.readFileSync('./ssl/www.cocafes.com.crt'),
//         ca: [fileSystem.readFileSync('./ssl/gd_bundle-g2-g1.crt')]
//
//     };
//
//     server = https.createServer(options, app).listen(app.get('port'), onStartServer);
//
// }
