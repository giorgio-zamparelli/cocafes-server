app.controller('UsersController', [ '$rootScope', '$scope', 'Api', function($rootScope, $scope, Api) {

    'use strict';

    $scope.friends = [];

    Api.getFriends($rootScope.currentUserId, function (friends) {

        $scope.friends = friends;

    });

    $scope.showFriend = function (user) {

        var url = "https://www.facebook.com/" + user.facebookId;

        if (typeof require !== "undefined") {

            const shell = require('electron').shell;

            shell.openExternal(url);

        } else {

            window.open(url, '_blank');

        }

    };

}]);
