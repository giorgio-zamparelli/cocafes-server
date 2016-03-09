app.controller('UserController', [ '$rootScope', '$scope', 'Api', function($rootScope, $scope, Api) {

    'use strict';

    $scope.friends = [];

    Api.getFriends($rootScope.currentUserId).subscribe(function (friends) {

        $scope.friends = friends;

    });

}]);
