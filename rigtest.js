document = {
	elements :{},
	addEventListener: function(event, func) {
		if (typeof func !== 'function')
			throw new Error('addEventListener expects callback');
		console.log('event listener added: ' + event);
	},
	createElement: function(type) {
		return { type: type };
	},
	getElementsByTagName: function(type) {
		if (typeof document.elements[type] === 'undefined')
			document.elements[type] = [];
		return {
			item: function(nr) {
				if (typeof document.elements[type][nr] === 'undefined')
					document.elements[type][nr] = []
				return {
					appendChild: function(item) {
						document.elements[type][nr].push(item);
					}					
				};
			}
		};
	}
};

location = {
	search: '?cordova-version=android-2.6.0&test=3'
};

window = {
	audioContext: function() {}
};