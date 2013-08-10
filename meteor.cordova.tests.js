'use strict';

function equals(a, b) {
  return !!(JSON.stringify(a) === JSON.stringify(b));
}

window.testValue = 'ok';

window.testFunction = function(name) {
  if (name) {
    return 'ok ' + name;
  } else {
    return 'ok default'
  }
};

window.testFunctionCallback = function(name, callback) {
  if (typeof callback === 'function') {
    callback(name);
  } else {
    throw new Error('testFunctionCallback expected callback as function');
  }

  return 'returning callback';
};

window.parent = {
  postMessage: function(message) {
    testFrame.triggerMessage(message);
  },
  triggerMessage: function(message) {
    client.messageEventHandler.apply(client, [{
      origin: 'file://',
      data: message
    }]);
  },
  location: {
    origin: 'file://'
  }
};

var testFrame = {
  eventCallbacks: {},
  contentWindow: {
    postMessage: function(message) {
      window.parent.triggerMessage(message);
    }
  },
  addEventListener: function(eventId, callback) {
    var self = this;
    if (typeof callback !== 'function') {
      throw new Error('testFrame.addEventListener expected callback as function');
    }
    // Check if we need the init the array
    if (typeof self.eventCallbacks[eventId] === 'undefined') {
      self.eventCallbacks[eventId] = [];
    }
    // Push to the array
    self.eventCallbacks[eventId].push(callback);
  },
  triggerEvent: function(eventId, payload) {
    var self = this;
    for (var i = 0; i < self.eventCallbacks[eventId].length; i++) {
      try {
        var callback = self.eventCallbacks[eventId][i];
        callback.apply(window, [payload]);
      }catch(err) {
      }
    }
  },
  triggerMessage: function(message) {
    cordova.messageEventHandler.apply(cordova, [{
      origin: 'http://localhost:3000',
      data: message
    }]);
  }
};






var cordova = new MeteorCordova('http://localhost:3000', {
  // This shell version
  version: '0.0.1',
  // Do we rely on appcache?
  appcache: false,
  debug: true,
  testFrame: testFrame
});

// Initialise the client last
var client = new Cordova();

Tinytest.add('MeteorCordova - test suite', function(test) {
  test.isTrue(typeof cordova.testFrame !== false, 'cordova is rigged for iframe no testFrame?');
});

Tinytest.addAsync('MeteorCordova - load test, ', function (test, onComplete) {
  function load() {
    cordova.load(function(error) {
      // This should not return an error since we are running localhost
      test.isUndefined(error, 'This test excpects to run localhost');

      onComplete();
    });
  }

  load();
});

Tinytest.add('MeteorCordova - Events', function(test) {
  var eventData = {
    data: 'Hej'
  };

  var counter = 0;
  var counterDeviceReady = 0;
  
  test.isUndefined(client.eventCallbacks['test'], 'Before we start the event callbacks list should be empty');
  test.isUndefined(client.oneTimeEvents['test']);

  // Add an event listener
  client.addEventListener('test', function(event) {
    counter++;
    test.isTrue( equals(event, eventData) );
  });
 
  test.isTrue(typeof client.eventCallbacks['test'][0] === 'function', 'We would expect the handler as 0');


  // Now we trigger the event with data
  testFrame.triggerEvent('test', eventData);
  testFrame.triggerEvent('test', eventData);
  test.equal(counter, 2, 'Normal events should run every time');


  test.isTrue(client.eventCallbacks['deviceready'] !== 'undefined', 'Before we start the event callbacks deviceready should exist');
  test.isTrue(client.eventCallbacks['deviceready'].length === 1, 'Before we start the event callbacks deviceready should have one initial event');
  test.isTrue(client.oneTimeEvents['deviceready']);

  client.addEventListener('deviceready', function(event) {
    counterDeviceReady++;
    test.isTrue( equals(event, eventData) );
  });


  // Test oneTime event
  testFrame.triggerEvent('deviceready', eventData);
  testFrame.triggerEvent('deviceready', eventData);
  test.equal(counterDeviceReady, 1, 'one time events should only be run once');
});

Tinytest.addAsync('MeteorCordova - call - variable', function (test, onComplete) {
  // Test variables
  client.call('window.testValue', [], function(value) {
    test.equal(value, 'ok');
    onComplete();
  });
});

Tinytest.addAsync('MeteorCordova - call - method', function (test, onComplete) {
  // Test variables
  client.call('window.testFunction', [], function(value) {
    test.equal(value, 'ok default');
    onComplete();
  });
});

Tinytest.addAsync('MeteorCordova - call - method with param', function (test, onComplete) {
  // Test variables
  client.call('window.testFunction', ['hello'], function(value) {
    test.equal(value, 'ok hello');
    onComplete();
  });
});



Tinytest.addAsync('MeteorCordova - call - method with callback param', function (test, onComplete) {
  var counter = 0;

  function complete() {
    counter++;
    if (counter == 2) {
      onComplete();
    }
  }

  // Test variables
  client.call('window.testFunctionCallback', ['hello', function(value) {
    // this is a function as parametre
    test.equal(value, 'hello');
    complete();
  }], function(value) {
    // Test the returning callback
    test.equal(value, 'returning callback');
    complete();    
  });

});

// Test for no returning callbacks....
Tinytest.addAsync('MeteorCordova - call - method with callback param no returning', function (test, onComplete) {

  // Test variables
  client.call('window.testFunctionCallback', ['hello', function(value) {
    // this is a function as parametre
    test.equal(value, 'hello');
    onComplete();
  }]);

});
//Test API:
//test.isFalse(v, msg)
//test.isTrue(v, msg)
//test.equalactual, expected, message, not
//test.length(obj, len)
//test.include(s, v)
//test.isNaN(v, msg)
//test.isUndefined(v, msg)
//test.isNotNull
//test.isNull
//test.throws(func)
//test.instanceOf(obj, klass)
//test.notEqual(actual, expected, message)
//test.runId()
//test.exception(exception)
//test.expect_fail()
//test.ok(doc)
//test.fail(doc)
//test.equal(a, b, msg)