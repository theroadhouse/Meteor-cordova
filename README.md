#Cordova
Simple common api for coding with Cordova / Phonegap. The functions fallback if Cordova is not loaded, degrading to browser functionality.

Checkout the demo app at [https://github.com/raix/Meteor-Cordova-Example](https://github.com/raix/Meteor-Cordova-Example)

##Device ready
`Cordova.isReady` is reactive and holds the state of the device

```js
	Template.hello.deviceready = function() {
		return Cordova.isReady();
	};
```
*Adding a template helper*

##Cordova.alert
Cordova.alert(message, alertCallback, [title], [buttonName])
```js
    Cordova.alert("Hello", function() {
        // Alert is closed
    }, 'Greeting', 'Ok')
```

##Cordova.confirm
`Cordova.confirm(message, confirmCallback, title, buttonLabels)``

##Cordova.prompt
`Cordova.prompt(message, promptCallback, title, buttonLabels, defaultText)``

##Cordova.beep
`Cordova.beep(times)`

##Cordova.vibrate
In a browser without Cordova support it defaults to low vibrating sound in speakers.
`Cordova.vibrate(milliseconds)`

*For more detailed info on the api I'll point to [phonegap.com](http://www.phonegap.com) for now*