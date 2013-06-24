/*

Meteor-Cordova, by RaiX

Credit goes to @awatson1978 and @zeroasterisk

MIT License

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

var _Cordova = function() {
	var self = this;

	// Rig reactive ready var
	self._ready = false;

	self._readyDeps = new Deps.Dependency();

	self.isReady = function() {
		self._readyDeps.depend();
		return self._ready;
	};

	self.setReady = function(value) {
		if (value !== self._ready) {
			self._ready = value;
			self._readyDeps.changed();
		}
	};

	// Init deviceready event listener
	document.addEventListener("deviceready",function() {
		self.setReady(true);
	},false);


	//////////////// Unified common API //////////////////

	self.alert = function(message, alertCallback, title, buttonName) {
		console.log(typeof alertCallback);
		if (typeof alertCallback !== 'function')
			throw new Error('Function "alert" expects a callback function');

		if (navigator && navigator.notification && navigator.notification.alert)
			navigator.notification.alert(message, alertCallback, title, buttonName);
		else {
			// title, buttonName ?
			window.alert(message);
			alertCallback();
		}
	};

	self.confirm = function(message, confirmCallback, title, buttonLabels) {
		if (typeof confirmCallback !== 'function')
			throw new Error('Function "confirm" expects a callback function');

		if (navigator && navigator.notification && navigator.notification.confirm)
			navigator.notification.confirm(message, confirmCallback, title, buttonLabels);
		else
			confirmCallback( window.confirm(message)?1:0 );
	};

	self.prompt = function(message, promptCallback, title, buttonLabels, defaultText) {
		if (typeof promptCallback !== 'function')
			throw new Error('Function "prompt" expects a callback function');

		if (navigator && navigator.notification && navigator.notification.prompt)
			navigator.notification.prompt(message, promptCallback, title, buttonLabels, defaultText);
		else
			promptCallback(window.prompt(message, defaultText));

	};

	self.beep = function(times) {
		if (navigator && navigator.notification && navigator.notification.beep)
			navigator.notification.beep(times);
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

	self.vibrate = function(milliseconds) {
		if (navigator && navigator.notification && navigator.notification.vibrate)
			navigator.notification.vibrate(milliseconds);
		else
			beep(milliseconds, 0);
	};

	return self;
};

Cordova = new _Cordova();