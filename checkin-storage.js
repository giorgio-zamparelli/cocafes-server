const Rx = require('rx');
var UUID = require('./UUID.js');

var CheckinStorage = function (database) {

    this.collection = database.collection('Checkin');

};

CheckinStorage.prototype.getCheckinById = function (checkinId, success) {

    this.collection.findOne({"_id": checkinId}, function(error, checkin) {

        if (error) throw error;

        if (success) {
            success(checkin);
        }

    });

};

CheckinStorage.prototype.getLatestCheckinByUserId = function (userId, success) {

    return Rx.Observable.create(function(observer) {

        this.collection.find({"userId": userId}).sort({creationTime:-1}).limit(1, function(error, checkins) {

            if(error) observer.onError(error);
            observer.onNext(checkins && checkins.length > 0 ? checkins[0] : null);
            observer.onCompleted();

        });

    }.bind(this));

};

CheckinStorage.prototype.getCheckinsByIds = function (checkinsIds, success) {

    this.collection.find({'_id': { $in: checkinsIds} }, function(error, checkins) {

        if (error) throw error;

        if (success) {
            success(checkins);
        }

    });

};

CheckinStorage.prototype.addCheckin = function (checkin, success) {

    if(!checkin._id) {

        checkin._id = UUID.generate();
        checkin.lastEditTime = new Date().getTime();

    }

    if(!checkin.creationTime || checkin.creationTime === 0) {

        checkin.creationTime = new Date().getTime();
        checkin.lastEditTime = checkin.creationTime;

    }

    this.collection.insert(checkin, function(error, checkin) {

        if (error) throw error;

        if (success) {
            success(checkin);
        }

    });

};

module.exports = CheckinStorage;
