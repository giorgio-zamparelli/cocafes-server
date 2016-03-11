app.controller('SettingsController', [ '$rootScope', '$scope', '$location', 'Api', 'SessionManager', function($rootScope, $scope, $location, Api, SessionManager) {

    'use strict';

    $scope.venues = [];

    Api.getVenues($rootScope.currentUserId, function (venues) {

        $scope.venues = venues;

    });

    $scope.logout = function () {

        SessionManager.clear();
        $location.path("/");

    };

    if (typeof require !== "undefined") {

        $scope.version = require('electron').remote.getGlobal("version");

        $scope.quit = function () {

            require('electron').remote.app.quit();

        };

    }

}]);
