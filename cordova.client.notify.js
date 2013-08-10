/*

Meteor-Cordova, by RaiX

Credit goes to @awatson1978 and @zeroasterisk

MIT License

This file extends the cordova with notification plugin api

*/

/*
	beep - does what is says
	beep(duration, type, callback);
	callback when beep is done
 */


var beep = (function () {
	try {
		// Fix up for prefixing
		window.AudioContext = window.AudioContext||window.webkitAudioContext;
		context = new AudioContext();
	} catch(e) {
		return function(duration, type, callback) {
			// Not supported by the browser
		};
	}

    return function (duration, type, callback) {
        var osc = context.createOscillator();

		// 0 Sine wave
		// 1 Square wave
		// 2 Sawtooth wave
		// 3 Triangle wave
        osc.type = (type % 4) || 0;

        osc.connect(context.destination);
        osc.noteOn(0);
        setTimeout(function() {
            osc.noteOff(0);
            // Callback when beep stops
            if (typeof callback === 'function')
				callback();
        }, duration);
    };
})();



// Rig var for using the native stuff
Cordova._useNotifications = false;

// Init deviceready event listener
Cordova.useNotifications = function() {
	var self = this;
	self.addEventListener("deviceready", function() {
		// On ready start using notifications plugin - we dont do checks so the
		// use better be sure that its installed
		self._useNotifications = true;
	},false);
};

//////////////// Unified common API //////////////////

Cordova.alert = function(message, alertCallback, title, buttonName) {
	var self = this;
	console.log(typeof alertCallback);
	if (typeof alertCallback !== 'function')
		throw new Error('Function "alert" expects a callback function');

	if (self._useNotifications)
		self.call('navigator.notification.alert', [message, alertCallback, title, buttonName]);
	else {
		// title, buttonName ?
		window.alert(message);
		alertCallback();
	}
};

Cordova.confirm = function(message, confirmCallback, title, buttonLabels) {
	var self = this;
	if (typeof confirmCallback !== 'function')
		throw new Error('Function "confirm" expects a callback function');

	if (self._useNotifications)
		self.call('navigator.notification.confirm', [message, confirmCallback, title, buttonLabels]);
	else
		confirmCallback( window.confirm(message)?1:0 );
};

Cordova.prompt = function(message, promptCallback, title, buttonLabels, defaultText) {
	var self = this;
	if (typeof promptCallback !== 'function')
		throw new Error('Function "prompt" expects a callback function');

	if (self._useNotifications)
		self.call('navigator.notification.prompt', [message, promptCallback, title, buttonLabels, defaultText]);
	else
		promptCallback(window.prompt(message, defaultText));

};

Cordova.beep = function(times) {
	var self = this;
	if (self._useNotifications)
		self.call('navigator.notification.beep', [times]);
	else {
		var beepTimes = function(countDown) {
			beep(100, 3, function() {
				if (countDown > 1)
					beepTimes(countDown - 1);
			});
		};
		beepTimes(times);
	}
};

Cordova.vibrate = function(milliseconds) {
	var self = this;
	if (self._useNotifications)
		self.call('navigator.notification.vibrate', [milliseconds]);
	else
		beep(milliseconds, 0);
};
