const Rx = require('rx');

const UUID = require('./UUID.js');

var VenueStorage = function (database) {

    this.collection = database.collection('Venue');

};

VenueStorage.prototype.getVenueById = function (venueId, success) {

    this.collection.findOne({"_id": venueId}, function(error, venue) {

        if (error) throw error;

        if (success) {
            success(venue);
        }

    });

};

VenueStorage.prototype.getVenues = function (latitude, longitude) {

    return Rx.Observable.create(function(observer) {

        this.collection.find({}, function(error, venues) {

            if(error) observer.onError(error);
            observer.onNext(venues);
            observer.onCompleted();

        });

    }.bind(this));

};

VenueStorage.prototype.getVenueByMac = function (mac, success) {

    this.collection.findOne({"wifis.mac": mac}, function(error, venue) {

        if (error) throw error;

        if (success) {
            success(venue);
        }

    });

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

        this.collection.insert(venue, function(error, venue) {

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
