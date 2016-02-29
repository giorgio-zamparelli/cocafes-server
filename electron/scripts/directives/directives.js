app.directive('ngNavigate', [ '$location', function($location) {

	'use strict';

	return {
		restrict : 'A',
		link : function(scope, element, attrs) {

			var path;

			attrs.$observe( 'ngNavigate', function (val) {
				path = val;
			});

			element.bind( 'click', function () {
				scope.$apply( function () {
					$location.path( path );
				});
			});


		}

	};

} ]);

app.directive('ngRightClick', function($parse) {

    return function($scope, element, attrs) {

        var fn = $parse(attrs.ngRightClick);

        element.bind('contextmenu', function(event) {

            $scope.$apply(function() {

				$scope.longPress = false;
                event.preventDefault();
                fn($scope, {$event:event});

            });

        });

    };

});

app.directive('ngLongClick', function($timeout) {

	return {

		restrict: 'A',
		link: function($scope, $elm, $attrs) {

			$elm.bind('mousedown', function(evt) {

				// Locally scoped variable that will keep track of the long press
				$scope.longPress = true;

				// We'll set a timeout for 600 ms for a long press
				$timeout(function() {

					if ($scope.longPress) {

						// If the touchend event hasn't fired, apply the function given in on the element's on-long-press attribute
						$scope.$apply(function() {
							$scope.$eval($attrs.ngLongClick)
						});

					}

				}, 600);

			});

			$elm.bind('mouseup', function(evt) {

				// Prevent the onLongPress event from firing
				$scope.longPress = false;

				// If there is an on-touch-end function attached to this element, apply it
				if ($attrs.onTouchEnd) {

					$scope.$apply(function() {
						$scope.$eval($attrs.onTouchEnd)
					});

				}

			});
		}

	};

});

app.directive('ngLongTouch', function($timeout) {

	return {

		restrict: 'A',
		link: function($scope, $elm, $attrs) {

			$elm.bind('touchstart', function(evt) {

				// Locally scoped variable that will keep track of the long press
				$scope.longPress = true;

				// We'll set a timeout for 600 ms for a long press
				$timeout(function() {

					if ($scope.longPress) {

						// If the touchend event hasn't fired, apply the function given in on the element's on-long-press attribute
						$scope.$apply(function() {
							$scope.$eval($attrs.ngLongTouch)
						});

					}

				}, 600);

			});

			$elm.bind('touchend', function(evt) {

				// Prevent the onLongPress event from firing
				$scope.longPress = false;

				// If there is an on-touch-end function attached to this element, apply it
				if ($attrs.onTouchEnd) {

					$scope.$apply(function() {
						$scope.$eval($attrs.onTouchEnd)
					});

				}

			});
		}

	};

});
