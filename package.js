Package.describe({
    summary: "\u001b[32mv0.0.1\n"+
  		   "\u001b[33m-----------------------------------------\n"+
  		   "\u001b[0m Adds basic support for Cordova/Phonegap \n"+
  		   "\u001b[0m Can use lazyload for loading Cordova.js\n"+
  		   "\u001b[33m-------------------------------------RaiX\n"
});

Package.on_use(function (api) {
    api.add_files('cordova.client.js', 'client');
    api.add_files('cordova.server.js', 'server');
    api.add_files('cordova.common.js', ['client', 'server']);
});

Package.on_test(function (api) {
  api.use('tinytest');
  api.use('deps');
  api.add_files('rigtest.js', 'server');
  api.add_files('cordova.client.js', 'server');
  api.add_files('cordova.tests.js', 'server');
});