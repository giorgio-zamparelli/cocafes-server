app.filter('momentFromNow', function() {

  	return function(time) {

		return moment(time).fromNow();

	};

})
