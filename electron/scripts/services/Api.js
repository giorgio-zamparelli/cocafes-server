//MONGOLAB_URI: mongodb://heroku_cpslwj5x:osv1hu4kictp62jrnoepc116gh@ds059115.mongolab.com:59115/heroku_cpslwj5x

app.service('Api', [ '$http', '$window', function($http, $window){

	'use strict';

	if ($window.location.host === "localhost") {

		var host = "localhost";
		var port = 80;

	} else {

		var host = "cocafes.herokuapp.com";
		var port = 443;

	}

	const baseUrl = (port === 443 ? "https://" : "http://") + host + ":" + port + "/api/v1";
	let cache = {};
	let loading = {};

    return {

    	/**
    	 * @memberOf Api
    	 * necessary on the first function to show Outline view in Eclipse
         */
    	id: 'Api',

		loginWithFacebook: function(facebookCode, success, failure) {

			$http({method: 'POST', url: baseUrl + '/authentication/login/facebook', headers: {'Authorization': 'Facebook ' + facebookCode}}).

        		success(function(user, status, headers, config) {

        			if (success) {
                        success(user);
                    }

        		}).error(function(response, status, headers, config) {

        			console.log('Failure POST ' + baseUrl + '/authentication/login/facebook');

					if (failure) {
						failure(status + ' ' + response);
					}

        		}

			);

    	},

		getFriends: function(userId) {

			return Rx.Observable.create(function(observer) {

				observer.onNext(cache.friends);

				if (!loading.friends) {

					loading.friends = true;

					$http({method: 'GET', url: baseUrl + '/users/' + userId + '/friends'}).

		        		success(function(friends, status, headers, config) {

							cache.friends = friends;
							loading.friends = false;
		        			observer.onNext(friends);

		        		}).error(function(response, status, headers, config) {

		        			console.log('Failure GET ' + baseUrl + '/users/' + userId + '/friends');

							loading.friends = false;
							observer.onError(status + ' ' + response);

		        		}

					);

				}

			});

    	},

		getVenues: function() {

			return Rx.Observable.create(function(observer) {

				observer.onNext(cache.venues);

				if (!loading.venues) {

					loading.venues = true;

					$http({method: 'GET', url: baseUrl + '/venues'}).

		        		success(function(venues, status, headers, config) {

							cache.venues = venues;
							loading.venues = false;
		        			observer.onNext(venues);

		        		}).error(function(response, status, headers, config) {

		        			console.log('Failure GET ' + baseUrl + '/venues');

							loading.venues = false;
							observer.onError(status + ' ' + response);

		        		}

					);

				}

			});

    	},

		postVenue: function(venue) {

			return Rx.Observable.create(function(observer) {

				$http({method: 'POST', url: baseUrl + '/venues', data: venue}).

	        		success(function(venue, status, headers, config) {

	        			observer.onNext(venue);

	        		}).error(function(response, status, headers, config) {

	        			console.log('Failure POST ' + baseUrl + '/venues');

						observer.onError(status + ' ' + JSON.stringify(response));

	        		}

				);

			});

    	},

    };
}]);
