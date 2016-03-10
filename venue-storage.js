'use strict';

const Rx = require('rx');
const UUID = require('./UUID.js');

var VenueStorage = function (database) {

    this.collection = database.collection('Venue');

};

VenueStorage.prototype.getVenues = function (query) {

    let mongoQuery = {};

    if (query && query.latitude && query.longitude) {

        mongoQuery =    {
                            location : {

                                $near : {

                                    $geometry : {

                                        type : "Point" ,
                                        coordinates : [ query.longitude ,  query.latitude ]

                                    }

                                }

                            }

                        };

        if (query.maxDistance) {
            mongoQuery.location.$near.$maxDistance = query.maxDistance;
        }

    }

    if (query && query.countryCode) {
        mongoQuery.countryCode = query.countryCode;
    }

    if (query && query.city) {
        mongoQuery.city = query.city;
    }

    return Rx.Observable.create(function(observer) {

        this.collection.find(mongoQuery, function(error, venues) {

            if(error) observer.onError(error);
            observer.onNext(venues);
            observer.onCompleted();

        });

    }.bind(this));

};

VenueStorage.prototype.getVenueById = function (venueId, success) {

    return Rx.Observable.create(function(observer) {

        this.collection.findOne({"_id": venueId}, function(error, venue) {

            if(error) {
                console.error(error);
                observer.onError(error);
            }
            observer.onNext(venue);
            observer.onCompleted();

        });

    }.bind(this));

};

VenueStorage.prototype.getVenueByName = function (venueName, success) {

    return Rx.Observable.create(function(observer) {

        venueName = venueName.split("-").join(" ");

        let permutations = [ venueName ];
        let venueArray = venueName.split(" ");

        for (var i = 0; i < venueArray.length; i++) {

            venueArray[i] = venueArray[i].charAt(0).toLowerCase() + venueArray[i].slice(1)

        }

        permutations.push(venueArray.join(" "));

        for (var i = 0; i < venueArray.length; i++) {

            venueArray[i] = venueArray[i].charAt(0).toUpperCase() + venueArray[i].slice(1)

        }

        permutations.push(venueArray.join(" "));


        console.log(JSON.stringify(permutations));

        this.collection.findOne({"name": { $in: permutations }}, function(error, venue) {

            if(error) {
                console.error(error);
                observer.onError(error);
            }
            observer.onNext(venue);
            observer.onCompleted();

        });

    }.bind(this));

};

VenueStorage.prototype.getVenueByMac = function (mac, success) {

    return Rx.Observable.create(function(observer) {

        this.collection.findOne({"wifis.mac": mac}, function(error, venue) {

            if(error) {
                console.error(error);
                observer.onError(error);
            }
            observer.onNext(venue);
            observer.onCompleted();

        });

    }.bind(this));

};

VenueStorage.prototype.addVenue = function (venue) {

    return Rx.Observable.create(function(observer) {

        if(!venue._id) {

            venue._id = UUID.generate();
            venue.lastEditTime = new Date().getTime();

        }

        if(!venue.creationTime || venue.creationTime === 0) {

            venue.creationTime = new Date().getTime();
            venue.lastEditTime = venue.creationTime;

        }

        this.collection.update({_id: venue._id}, {$set : venue}, {upsert: true}, function(error, result) {

            if(error) {
                console.error(error);
                observer.onError(error);
            }
            observer.onNext(venue);
            observer.onCompleted();

        });

    }.bind(this));

};

module.exports = VenueStorage;
