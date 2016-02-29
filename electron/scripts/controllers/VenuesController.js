app.controller('VenuesController', [ '$rootScope', '$scope', '$location', '$interval', 'Api', function($rootScope, $scope, $location, $interval, Api) {

    'use strict';

    $scope.venues = [];

    $scope.showGoogleMaps = function (venue) {

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

    $scope.showVenue = function (venue) {

        $location.path("/venues/" + venue._id);

    };

    var getVenues = function () {

        Api.getVenues().subscribe(venues => {

            $scope.venues = venues;

            if (venues) {

                for (let venue of venues) {
                    venue.initial = venue.name[0];
                    venue.color = StringToColorConverter.convertToColorString(venue._id);
                }

            }

        }, error => {

            //TODO

        });

    };

    var intervalVenues = $interval(getVenues, 60000);
    $scope.$on('$destroy', function () { $interval.cancel(intervalVenues); });

    getVenues();

}]);
