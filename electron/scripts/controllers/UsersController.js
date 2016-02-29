app.controller('UsersController', [ '$rootScope', '$scope', '$interval', 'Api', function($rootScope, $scope, $interval, Api) {

    'use strict';

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
