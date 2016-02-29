app.controller('AddVenueController', [ '$rootScope', '$scope', '$location', 'Api', function($rootScope, $scope, $location, Api) {

    'use strict';

    // $scope.wifis = [{"mac":"e8:de:27:55:30:04","ssid":"NUTNAI99","channel":"10,-1","signal":"-86","security":"WPA(PSK/AES/AES) WPA2(PSK/AES/AES)","$$hashKey":"object:15"},{"mac":"2c:ab:25:b8:4e:e5","ssid":"jureena8","channel":"13","signal":"-92","security":"WPA(PSK/TKIP,AES/TKIP) WPA2(PSK/TKIP,AES/TKIP)","$$hashKey":"object:16"},{"mac":"cc:4e:ec:4a:6f:a8","ssid":"Mirin","channel":"161,-1","signal":"-89","security":"WPA(PSK/AES,TKIP/TKIP) WPA2(PSK/AES,TKIP/TKIP)","$$hashKey":"object:17"},{"mac":"f8:1a:67:73:45:d4","ssid":"TOT-Wireless","channel":"11,-1","signal":"-77","security":"WPA(PSK/TKIP,AES/TKIP)","$$hashKey":"object:18"},{"mac":"00:02:6f:bd:84:67","ssid":".@  TRUEWIFI","channel":"11","signal":"-81","security":"NONE","$$hashKey":"object:19"},{"mac":"00:90:4c:91:00:01","ssid":"northernfarm-cm","channel":"11","signal":"-81","security":"WPA(PSK/TKIP/TKIP)","$$hashKey":"object:20"},{"mac":"00:02:6f:c3:cb:74","ssid":".@  TRUEWIFI","channel":"6","signal":"-72","security":"NONE","$$hashKey":"object:21"},{"mac":"c0:c1:c0:2b:86:da","ssid":"The Impress#1","channel":"6","signal":"-78","security":"WPA(PSK/TKIP/TKIP)","$$hashKey":"object:22"},{"mac":"88:dc:96:0d:fd:7e","ssid":"EnGenius1","channel":"6,-1","signal":"-67","security":"NONE","$$hashKey":"object:23"},{"mac":"00:02:6f:d5:97:b0","ssid":".@  TRUEWIFI","channel":"6","signal":"-76","security":"NONE","$$hashKey":"object:24"},{"mac":"8e:3a:e3:98:5d:3f","ssid":"DIRECT-5B-Android_5846","channel":"4","signal":"-52","security":"WPA2(PSK/AES/AES)","$$hashKey":"object:25"},{"mac":"cc:4e:ec:49:d0:e8","ssid":"Mirin","channel":"1","signal":"-81","security":"WPA(PSK/AES,TKIP/TKIP) WPA2(PSK/AES,TKIP/TKIP)","$$hashKey":"object:26"},{"mac":"ea:37:7a:40:56:1c","ssid":"Addictedtowork","channel":"1","signal":"-34","security":"WPA2(PSK/AES/AES)","$$hashKey":"object:27"},{"mac":"ec:9b:f3:3d:59:4b","ssid":"Giorgio portable hotspot","channel":"1","signal":"-41","security":"WPA2(PSK/AES/AES)","$$hashKey":"object:28"}];
    //
    // $scope.wifis.sort(function (leftWifi, rightWifi) {
    //     return Number(rightWifi.signal) - Number(leftWifi.signal);
    // });

    $scope.venue = {};
    $scope.venue._id = UUID.generate();
    $scope.venue.creationTime = new Date().getTime();
    $scope.venue.lastEditTime = $scope.venue.creationTime;
    $scope.venue.creatorUserId = $rootScope.currentUserId;
    $scope.venue.name = $location.search()['googlePlaceName'];
    $scope.venue.googlePlaceId = $location.search()['googlePlaceId'];
    $scope.venue.googlePlaceCid = $location.search()['googlePlaceCid'];
    $scope.venue.wifis = [];

    var latitude = $location.search()['latitude'];
    var longitude = $location.search()['longitude'];

    if (latitude && longitude) {

        $scope.venue.location = {
            type : "Point",
            coordinates : [
                longitude,
                latitude
            ]
        };

    }

    $scope.toggleWifi = function (wifi) {

        let foundWifi = false;
        let i = 0;

        while (i < $scope.wifis.length && !foundWifi) {

            if ($scope.wifis[i].mac === wifi.mac) {

                if ($scope.wifis[i].added) {
                    $scope.wifis[i].added = false;
                } else {
                    $scope.wifis[i].added = true;
                }

                foundWifi = true;

            } else {
                i++;
            }

        }

        foundWifi = false;
        i = 0;

        while (i < $scope.venue.wifis.length && !foundWifi) {

            if ($scope.venue.wifis[i].mac === wifi.mac) {

                $scope.venue.wifis.splice(i, 1);
                foundWifi = true;

            } else {
                i++;
            }

        }

        if (!foundWifi) {
            $scope.venue.wifis.push({
                mac: wifi.mac,
                ssid: wifi.ssid,
                channel: wifi.channel,
                security: wifi.security
            });
        }

    }

    $scope.addVenue = function () {

        if (!$scope.addingVenue) {

            $scope.addingVenue = true;

            Api.postVenue($scope.venue).subscribe(venue => {

                $scope.addingVenue = false;

                $location.path("/venues");

            }, error => {

                $scope.addingVenue = false;

                console.error(error);

                //TODO

            });

        }

    };

    if (typeof require !== "undefined") {

        $scope.wificontrol = true;

        var WiFiControl = require("remote").require('./wifi-control.js');

        WiFiControl.scanForWiFi( function(error, response) {

            if (error) {

                console.log(error);

            } else if (response && response.networks && response.networks.length > 0) {

                var wifis = [];

                for (let i = 0; i < response.networks.length; i++) {

                    let signalDbm = Number(response.networks[i].signal_level);
                    let signalPercentage = 0;

                    if (signalDbm) {

                        if(signalDbm <= -100) {
                            signalPercentage = 0;
                        } else if(signalDbm >= -50) {
                            signalPercentage = 100;
                        } else {
                            signalPercentage = 2 * (signalDbm + 100);
                        }
                    }

                    wifis.push({

                        "mac" : response.networks[i].mac,
                        "ssid" : response.networks[i].ssid,
                        "channel" : response.networks[i].channel,
                        "signalDbm" : signalDbm,
                        "signalPercentage" : signalPercentage,
                        "security" : response.networks[i].security

                    });

                }

                wifis.sort(function (leftWifi, rightWifi) {
                    return Number(rightWifi.signalDbm) - Number(leftWifi.signalDbm);
                });

                if($scope.$$phase || ($scope.$root && $scope.$root.$$phase)) {

                    $scope.wifis = wifis;

        		} else {

        			$scope.$apply(function () {
                        $scope.wifis = wifis;
            		});

        		}

                console.log(JSON.stringify(wifis));

            }

        }.bind(this));


    }

}]);
