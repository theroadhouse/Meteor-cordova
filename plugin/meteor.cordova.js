Meteor = {};

/*
  Meteor load function

  Params
  This function
*/
Meteor.load = function(meteorUrl, useAppcache, callback) {

    // Getter / Setter of the success flag
    var successFlag = function(value) {
        if (typeof localStorage !== 'undefined') {
            if (typeof value !== 'undefined') {
                if (value === null) {
                    // If null is used then remove the flag
                    alert('Remove successFlag');
                    localStorage.removeItem('successFlag');
                } else {
                    alert('Set successFlag: ' + value);
                    // Set the value
                    localStorage.setItem('successFlag', value);
                }
            } else {
                // Get the value
                return localStorage.getItem('successFlag');
            }
        }
        // If somehow we have no localStorage then return false
        return false;
    };

    // No mather if we started loading a possible successful prior page
    // we have to check if it actually did load - We test this by
    // setting "useAppcache" to true, but not adding the appcache to
    // the server - this will trigger a bad scenario. It might even
    // set a counter to only allow this event once or twice before
    // start not trusting the useAppcache flag - It could then wait 2
    // successes until start trusting again - this would be applied
    // Exponential so the untrusting period would grow towards infinite
    //
    // This function is called at load check finished. It could be
    // after a success or failure. Calling this function will set
    // a timeout - if timeout is called then out load failed.
    var checkLoad = function(status) {
        var delay = 5000; // Default is 2000 sec
        setTimeout(function() {
            alert('FAILED');
            var errorCode = 0;
            if (useAppcache) {
                // We failed while expecting an appcache to fallback
                // on...
                if (status === 'online') {
                    // We expect the page to load we are online and
                    // have an appcache
                    errorCode = 1;
                } else {
                    // We are offline but should fallback on the
                    // appcache - Can we trust the "useAppcache"
                    // We ajust trust
                    // trust *= 2; // trust default = 1
                    //
                    // We could enforce a check to see if the manifest
                    // file exist to make sure? But wa have to wait
                    // until online...
                    errorCode = 2;
                }
            } else {
                if (status === 'online') {
                    // We are online with our server but the page
                    // failed to load
                    errorCode = 3;
                } else {
                    // We are offline with no appcache - Cant do
                    // nothing
                    errorCode = 4;
                }
            }
            // Pr. definition: If this function ran then its not a
            // success
            successFlag(null);
            // Call failure callback
            callback(errorCode, null);

        }, delay);
    };

    // We could do a check every time checking if we are using the
    // appcache?
    var checkAppManifest = function() {
        // TODO: If needed
    };

    if (useAppcache && successFlag()) {
        // If we are using appcache and prior had a successful
        // connection then jump to the appcahced Meteor app
        // window.location.href = meteorUrl;
        window.location.replace(meteorUrl);
        // The xhr check will rig a test to make sure this page
        // is loaded correct
        callback(null, 2);
    }


    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4) {
            // When loading is done, but we only loaded the header
            if(xhr.status == 200) {

                // And successful then set location - Its a gamble
                // but the best option.
                //
                // We could set the href to a
                // base64 encode but we loose the origin - not sure
                // if we could hijack the html adding the remote ref.
                // We would loose appcache.
                //
                // Code example:
                // window.location.href = 'data:text/html;base64,' + btoa(unescape(encodeURIComponent( xhr.responseText ));
                //
                //
                // If the success flag is not set then
                // Set the success flag and load the app
                if (!successFlag()) {

                    // Set the success flag
                    successFlag(true);

                    // Great - We could check to see if we have an
                    // app.manifest? if so then set the appcache flag
                    // in localStorage
                    checkAppManifest();

                    // Trigger begin loading the app...
                    window.location.replace(meteorUrl);


                    // Trigger callback
                    callback(null, 1);
                //    window.location.href = meteorUrl;
                } else {
                    // If using appcache we set a flag in localstorage
                    // to start loading at once - skipping this load
                    // since it should allready be on its way.

                    // But we could call the checkLoad
                    checkLoad('online');

                }
                //
            } else {
                // And not successful then we trigger an offline event
                // the user can retry to load again later

                if (useAppcache && successFlag()) {
                    // If we are using the appcache and the success
                    // flag is set in localstorage if give the
                    // appcache 2 sec before we reset the success flag
                    // and trigger the callback
                    //
                    checkLoad('offline');
                } else {
                    // Trigger calback or event
                    if (useAppcache) {
                        // Last time was not a success, check trust?
                        callback(5, null);
                    } else {
                        // We are offline and have no appcache
                        callback(4, null);
                    }
                }
            }
        } else {
            // xhr.readyState
        }
    }
    // Send a head request
    xhr.open('head',meteorUrl);
    xhr.send();

} // EO loadMeteor


var useAppcache = true;
var meteorUrl = 'http://192.168.2.10:3000';

var callback = function(err, success) {
    // err:
    // 0 == should never be set
    // 1 == got online and appcache
    // 2 == offline but got appcache
    // 3 == online and no appcache
    // 4 == offline and no appcache

    // success:
    // 1 == loaded directly
    // 2 == loaded from appcache

    if (err) {
        document.getElementById('deviceready').innerHTML = 'Failed to contact server ' + err;

    } else {
        document.getElementById('deviceready').innerHTML = 'We are loading new site ' + success;
    }
};
