app.controller('VenuesController', [ '$rootScope', '$scope', 'Api', function($rootScope, $scope, Api) {

    'use strict';

    $scope.venues = [];

    Api.getVenues($rootScope.currentUserId, function (venues) {

        $scope.venues = venues;

    });

    $scope.showVenue = function (venue) {

        var url;

        if (venue.googlePlaceCid) {
            url = "https://maps.google.com/?cid=" + venue.googlePlaceCid;
        } else {
            url = "https://www.google.com/maps/place/" + venue.name.split(" ").join("+");
        }

        if (typeof require !== "undefined") {

            const shell = require('electron').shell;

            shell.openExternal(url);

        } else {

            window.open(url, '_blank');

        }

    };

}]);
