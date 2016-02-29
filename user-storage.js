const Rx = require('rx');

const UUID = require('./UUID.js');

var UserStorage = function (database) {

    this.collection = database.collection('User');

};

UserStorage.prototype.getUserById = function (userId, success) {

    this.collection.findOne({"_id": userId}, function(error, user) {

        if (error) throw error;

        if (success) {
            success(user);
        }

    });

};

UserStorage.prototype.getUserByFacebookId = function (facebookId, success) {

    this.collection.findOne({"facebookId": facebookId}, function(error, user) {

        if (error) throw error;

        if (success) {
            success(user);
        }

    });

};

UserStorage.prototype.getUsersByFacebookIds = function (usersFacebookIds) {

    //return Rx.Observable.fromNodeCallback(this.collection.find)({'_id': { $in: usersIds} });

    return Rx.Observable.create(function(observer) {

        this.collection.find({'facebookId': { $in: usersFacebookIds} }, function(error, users) {

            if(error) observer.onError(error);
            observer.onNext(users);
            observer.onCompleted();

        });

    }.bind(this));

};

UserStorage.prototype.addOrUpdateUser = function (user, success) {

    if(!user._id) {

        user._id = UUID.generate();
        user.lastEditTime = new Date().getTime();

    }

    if(!user.creationTime || user.creationTime === 0) {

        user.creationTime = new Date().getTime();
        user.lastEditTime = user.creationTime;

    }

    this.collection.update({_id: user._id}, {$set : user}, {upsert: true}, function(error, result) {

        if (error) throw error;

        if (success) {
            success(user);
        }

    });

};

UserStorage.prototype.contains = function (userId, success) {

    this.collection.find({"_id": userId}, {_id: 1}).limit(1, function(error, user) {

        if (error) throw error;

        if (success) {
            success(user ? true : false);
        }

    });

};

module.exports = UserStorage;
