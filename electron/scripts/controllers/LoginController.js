app.controller('LoginController', [ '$rootScope', '$scope', '$location', '$window', 'Api', 'SessionManager', function($rootScope, $scope, $location, $window, Api, SessionManager) {

    'use strict';

    $scope.loginWithFacebook = function () {

        if (!$scope.code) {

            showFacebookAuthenticationPopup();

        } else {

            loginInCocafesServer();

        }

    };

    var loginInCocafesServer = function () {

        Api.loginWithFacebook($scope.code, function success(user) {

            SessionManager.storeNewSession(user);

            $location.path('/users');

        }, function failure() {



        });

    }

    var showFacebookAuthenticationPopup = function () {

        var redirect_uri = $window.location.origin + "/facebook_login_success.html";
        var facebookUrl = "https://www.facebook.com/dialog/oauth?client_id=1707859876137335&scope=email,public_profile,user_friends&redirect_uri=" + redirect_uri;

        console.log(facebookUrl);

        if (typeof require == "undefined") {

            console.log("show Facebook oauth using window.open");

            var facebookWindow = $window.open(  facebookUrl,
                "",
                "width=1000, height=670"
            );

            facebookWindow.focus();

        } else {

            console.log("show Facebook oauth using electron BrowserWindow");

            var BrowserWindow = require('electron').remote.BrowserWindow;
            var facebookWindow = new BrowserWindow({ "width": 1000, "height": 670, "show": false, "node-integration": false });
            facebookWindow.loadURL(facebookUrl);
            facebookWindow.show();

            facebookWindow.webContents.on('will-navigate', function (event, url) {

                //console.log("facebookWindow on will-navigate event");
                $window.onFacebookLoginSuccess(url, facebookWindow);

            });

            facebookWindow.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl) {

                //console.log("facebookWindow on did-get-redirect-request event");
                $window.onFacebookLoginSuccess(newUrl, facebookWindow);

            });

            facebookWindow.on('close', function() {
                facebookWindow = null;
            }, false);

        }

    };

    $window.onFacebookLoginSuccess = function (url, facebookWindow) {

        var raw_code = /code=([^&]*)/.exec(url) || null;
        var code = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
        var error = /\?error=(.+)$/.exec(url);

        if (code || error) {

            $window.focus();

            if (facebookWindow && facebookWindow.destroy) {
                facebookWindow.destroy();
            }

        }

        // If there is a code, proceed to get token from github
        if (code) {

            $scope.code = code;
            loginInCocafesServer();

        } else if (error) {
            alert('Oops! Something went wrong and we couldn\'t log you in using Facebook. Please try again.');
        }

    };

}]);
