app.filter('momentFromNow', function() {

  	return function(time) {

		return moment(time).fromNow();

	};

});

app.filter('howFar', function() {

  	return function(meters) {

		return meters > 1000 ? Math.ceil(meters / 1000) + "km away" : meters + "m away";

	};

});

app.filter('toCountryName', function() {

  	return function(countryCode) {

		return Countries.getName(countryCode);

	};

});
