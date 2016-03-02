app.controller('UsersController', [ '$rootScope', '$scope', '$interval', 'Api', 'UsersStorage', function($rootScope, $scope, $interval, Api, UsersStorage) {

    'use strict';

    $scope.user = UsersStorage.getUser($rootScope.currentUserId);

    $scope.friends;

    $scope.showFriend = function (user) {

        var url = "https://www.facebook.com/" + user.facebookId;

        if (typeof require !== "undefined") {

            const shell = require('electron').shell;

            shell.openExternal(url);

        } else {

            window.open(url, '_blank');

        }

    };

    var getFriends = function () {

        Api.getFriends($rootScope.currentUserId).subscribe(friends => {

            $scope.friends = friends;

        }, error => {

            //TODO

        });

    };

    var intervalFriends = $interval(getFriends, 60000);
    $scope.$on('$destroy', function () { $interval.cancel(intervalFriends); });

    getFriends();

}]);
