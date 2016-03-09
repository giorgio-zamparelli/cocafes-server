app.service('NodeLocalStorage', [function(){

	'use strict';

	var nodeLocalStorage;

	if (typeof(require) !== 'undefined') {

		var userDataPath = require('electron').remote.getGlobal("userDataPath");
		var LocalStorage = require('electron').remote.require('node-localstorage').LocalStorage;
		nodeLocalStorage = new LocalStorage(userDataPath);

	} else {

		nodeLocalStorage = localStorage;

	}

	return {

		/**
    	 * @memberOf SessionPreferences
    	 * necessary on the first function to show Outline view in Eclipse
         */
    	id: 'NodeLocalStorage',

		add: function(key, value) {

    		return nodeLocalStorage.setItem(key, JSON.stringify(value));

        },

		get: function(key) {

			var result;

			try{

				var value = nodeLocalStorage.getItem(key);
				result = value && JSON.parse(value);

			} catch (exception) {

				//DO NOTHING ON PURPOSE

			}

			return result;

		},

        remove: function(key) {

    		return nodeLocalStorage.removeItem(key);

        },

        clearAll: function(key) {

    		return nodeLocalStorage.clear(key);

        },


    };

}]);
