app.controller('SearchPlaceController', [ '$rootScope', '$scope', '$location', 'Api', function($rootScope, $scope, $location, Api) {

    'use strict';

    var mapDiv = document.getElementById('map');
    var map = new google.maps.Map(mapDiv, {

        center: {lat: 18.79646, lng: 98.9723142},
        zoom: 15,
        streetViewControl: false,
        mapTypeControl: false

    });

    var input = document.getElementById('pac-input');

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    var infowindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
        map: map
    });
    marker.addListener('click', function() {
        infowindow.open(map, marker);
    });

    autocomplete.addListener('place_changed', function() {

        infowindow.close();

        var place = autocomplete.getPlace();
        window.lastSearchedPlace = place;

        if (!place.geometry) {
            return;
        }

        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }

        // Set the position of the marker using the place ID and location.
        marker.setPlace({
            placeId: place.place_id,
            location: place.geometry.location
        });

        marker.setVisible(true);

        infowindow.setContent(
            '<div><strong>' + place.name + '</strong><br><br>' +
            place.formatted_address + '<br><br>' +
            '<div class="addVenueLink" onclick="clickedAddVenue()">Add to Cocafes</div>'

        );

        infowindow.open(map, marker);

    });

    var addVenue = function (place) {

        console.log(place);

        $location.path("/add-venue").search({
            googlePlaceId : place.place_id,
            googlePlaceCid : place.url.split("cid=")[1],
            googlePlaceName : place.name,
            latitude : place.geometry.location.lat(),
            longitude : place.geometry.location.lng()
        });

    };

    window.clickedAddVenue = function () {

        if($scope.$$phase || ($scope.$root && $scope.$root.$$phase)) {

            addVenue(window.lastSearchedPlace);

		} else {

			$scope.$apply(function () {
                addVenue(window.lastSearchedPlace);
    		});

		}

    }

}]);
