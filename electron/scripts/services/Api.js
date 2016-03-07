//MONGOLAB_URI: mongodb://heroku_cpslwj5x:osv1hu4kictp62jrnoepc116gh@ds059115.mongolab.com:59115/heroku_cpslwj5x

app.service('Api', [ '$http', '$window', function($http, $window){

	'use strict';

	if ($window.location.host === "localhost") {

		var host = "localhost";
		var port = 80;

	} else {

		var host = "www.cocafes.com";
		var port = 443;

	}

	const baseUrl = (port === 443 ? "https://" : "http://") + host + ":" + port + "/api/v1";
	let cache = {};
	cache.friends = {};
	cache.venues = {};
	let loading = {};
	loading.friends = {};
	loading.venues = {};

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

				if (Object.keys(cache.friends).length > 0) {

					let friends = [];

					for (let friendId in cache.friends) {
						friends.push(cache.friends[friendId]);
					}

					observer.onNext(friends);

				}

				if (!loading.friends.all) {

					loading.friends.all = true;

					$http({method: 'GET', url: baseUrl + '/users/' + userId + '/friends'}).

		        		success(function(friends, status, headers, config) {

							for (let friend of friends) {
								cache.friends[friend._id] = friend;
							}

							loading.friends.all = false;
		        			observer.onNext(friends);

		        		}).error(function(response, status, headers, config) {

		        			console.log('Failure GET ' + baseUrl + '/users/' + userId + '/friends');

							loading.friends.all = false;
							observer.onError(status + ' ' + response);

		        		}

					);

				}

			});

    	},

		getFriend: function(friendId) {

			return Rx.Observable.create(function(observer) {

				observer.onNext(cache.friends[friendId]);

				if (!loading.friends[friendId]) {

					loading.friends[friendId] = true;

					$http({method: 'GET', url: baseUrl + '/friends/' + friendId}).

		        		success(function(friend, status, headers, config) {

							cache.friends[friendId] = friend;
							loading.friends[friendId] = false;
		        			observer.onNext(friend);

		        		}).error(function(response, status, headers, config) {

		        			console.log('Failure GET ' + baseUrl + '/friends/' + friendId);

							loading.friends[friendId] = false;
							observer.onError(status + ' ' + response);

		        		}

					);

				}

			});

    	},

		getVenues: function(location) {

			return Rx.Observable.create(function(observer) {

				if (Object.keys(cache.venues).length > 0) {

					let venues = [];

					for (let venueId in cache.venues) {
						venues.push(cache.venues[venueId]);
					}

					observer.onNext(venues);

				}

				if (!loading.venues.all) {

					loading.venues.all = true;

					$http({method: 'GET', url: baseUrl + '/venues', params: location}).

		        		success(function(venues, status, headers, config) {

							for (let venue of venues) {
								cache.venues[venue._id] = venue;
							}

							loading.venues.all = false;
		        			observer.onNext(venues);

		        		}).error(function(response, status, headers, config) {

		        			console.log('Failure GET ' + baseUrl + '/venues');

							loading.venues.all = false;
							observer.onError(status + ' ' + response);

		        		}

					);

				}

			});

    	},

		getVenue: function(venueId) {

			return Rx.Observable.create(function(observer) {

				observer.onNext(cache.venues[venueId]);

				if (!loading.venues[venueId]) {

					loading.venues[venueId] = true;

					$http({method: 'GET', url: baseUrl + '/venues/' + venueId}).

		        		success(function(venue, status, headers, config) {

							cache.venues[venueId] = venue;
							loading.venues[venueId] = false;
		        			observer.onNext(venue);

		        		}).error(function(response, status, headers, config) {

		        			console.log('Failure GET ' + baseUrl + '/venues/' + venueId);

							loading.venues[venueId] = false;
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
