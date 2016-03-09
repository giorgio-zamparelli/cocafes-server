app.controller('VenuesController', [ '$rootScope', '$scope', '$location', '$interval', 'Api', 'LocationManager', function($rootScope, $scope, $location, $interval, Api, LocationManager) {

    'use strict';

    $scope.venues;

    $scope.showGoogleMaps = function (venue) {

        var url;

        if (venue.googlePlaceCid) {
            url = "https://maps.google.com/?cid=" + venue.googlePlaceCid;
        } else {
            url = "https://www.google.com/maps/place/" + venue.name.split(" ").join("+");
        }

        if (typeof require !== "undefined") {

            var shell = require('electron').shell;

            shell.openExternal(url);

        } else {

            window.open(url, '_blank');

        }

    };

    $scope.showVenue = function (venue) {

        $location.path("/venues/" + venue._id);

    };

    var getVenues = function () {

        var location = LocationManager.getLocation();

        Api.getVenues(location).subscribe(function (venues) {

            $scope.venues = venues;

            if (venues) {

                for (var i = 0; i < venues.length; i++) {
                    var venue = venues[i];
                    venue.initial = venue.name[0];
                    venue.color = StringToColorConverter.convertToColorString(venue._id);

                    if (location.latitude && location.longitude && venue.location && venue.location.coordinates && venue.location.coordinates.length > 1) {
                        venue.distance = getDistanceFromLatLonInMeters(location.latitude, location.longitude, venue.location.coordinates[1], venue.location.coordinates[0]);
                    }

                }

            }

        }, function (error) {

            //TODO

        });

    };

    var intervalVenues = $interval(getVenues, 60000);
    $scope.$on('$destroy', function () { $interval.cancel(intervalVenues); });

    getVenues();

    function getDistanceFromLatLonInMeters(lat1,lon1,lat2,lon2) {

        var R = 6371000; // Radius of the earth in m
        var dLat = deg2rad(lat2-lat1);  // deg2rad below
        var dLon = deg2rad(lon2-lon1);
        var a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c; // Distance in km
        return Math.round(d);

    }

    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }

}]);
