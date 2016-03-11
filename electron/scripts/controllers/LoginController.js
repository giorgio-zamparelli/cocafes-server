app.controller('LoginController', [ '$rootScope', '$scope', '$location', '$window', 'Api', 'SessionManager', function($rootScope, $scope, $location, $window, Api, SessionManager) {

    'use strict';

    if (typeof require !== "undefined") {

        $scope.quit = function () {

            require('electron').remote.getGlobal("app").quit();

        };

    }

    $scope.loginWithFacebook = function () {

        if (!$scope.code) {

            showFacebookAuthenticationPopup();

        } else {

            Api.loginWithFacebook($scope.code, function success(user) {

                onLoggedIn(user)

            }, function failure() {



            });

        }

    };

    var onLoggedIn = function (user) {

        SessionManager.storeNewSession(user);

        $location.path('/users');

    };

    var showFacebookAuthenticationPopup = function () {

        var redirect_uri = $window.location.origin + "/facebook_login_success.html";
        var facebookUrl = "https://www.facebook.com/dialog/oauth?client_id=1707859876137335&scope=email,public_profile,user_friends&redirect_uri=" + redirect_uri;

        if (typeof require == "undefined") {

            console.log("show Facebook oauth using window.open");

            var facebookWindow = $window.open(facebookUrl, "", "width=1000, height=670");

            facebookWindow.focus();

        } else {

            let serverUrl;

            if ($window.location.host === "localhost") {

        		serverUrl = "http://localhost";

        	} else {

        		serverUrl = "https://www.cocafes.com";

        	}

            var socket = io.connect(serverUrl);
            socket.on('sessionId', function (sessionId) {

                console.log("sessionId " + sessionId);
                facebookUrl += "&state=" + sessionId;
                require("remote").require("shell").openExternal(facebookUrl);

            });

            socket.on('login', function (user) {

                require('electron').remote.getGlobal("window").show();

                if($scope.$$phase || ($scope.$root && $scope.$root.$$phase)) {

                    onLoggedIn(user);

        		} else {

        			$scope.$apply(function () {
                        onLoggedIn(user);
            		});

        		}

                socket.io.disconnect();

            });

        }

    };

}]);
