app.service('LocationManager', ['$rootScope', 'UsersStorage', function($rootScope, UsersStorage){

	'use strict';

	return {

		/**
    	 * @memberOf SessionManager
    	 * necessary on the first function to show Outline view in Eclipse
         */
    	id: 'LocationManager',

		getLocation: function() {

			let location = {};

			let user = UsersStorage.getUser($rootScope.currentUserId);

			if (user && user.latestCheckin && user.latestCheckin.venueLatitude && user.latestCheckin.venueLongitude) {
				location.latitude = user.latestCheckin.venueLatitude;
				location.longitude = user.latestCheckin.venueLongitude;
			}

	        return location;

		}

    };

}]);
