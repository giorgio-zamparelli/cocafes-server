app.controller('LoginController', [ '$rootScope', '$scope', '$location', '$window', 'Api', 'SessionManager', function($rootScope, $scope, $location, $window, Api, SessionManager) {

    'use strict';

    $scope.loginWithFacebook = function () {

        if (!$scope.code) {

            showFacebookAuthenticationPopup();

        } else {

            loginInCoworkerServer();

        }

    };

    var loginInCoworkerServer = function () {

        Api.loginWithFacebook($scope.code, function success(user) {

            SessionManager.storeNewSession(user);

            $location.path('/users');

        }, function failure() {



        });

    }

    var showFacebookAuthenticationPopup = function () {

        var redirect_uri = $window.location.origin + "/facebook_login_success.html";

        var facebookWindow = $window.open(  'https://www.facebook.com/dialog/oauth?client_id=1707859876137335&scope=email,public_profile,user_friends&redirect_uri=' + redirect_uri,
                                            "Login with Facebook",
                                            "width=1000, height=670"
                                        );

        facebookWindow.focus();

    };

    $window.onFacebookLoginSuccess = function (facebookWindow) {

        var url = facebookWindow.location.href;
        var raw_code = /code=([^&]*)/.exec(url) || null;
        var code = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
        var error = /\?error=(.+)$/.exec(url);

        if (code || error) {

            $window.focus();

        }

        // If there is a code, proceed to get token from github
        if (code) {

            $scope.code = code;
            loginInCoworkerServer();

        } else if (error) {
            alert('Oops! Something went wrong and we couldn\'t log you in using Github. Please try again.');
        }

    };

}]);
