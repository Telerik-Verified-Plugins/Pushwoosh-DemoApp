// Change this to the 'Application Code' of your Pushwoosh.com Application
var PUSHWOOSH_APPID = "F9408-29446";

// For Android, we need the 'Project Number' you created at https://console.developers.google.com
// While you're there, make sure that 'Google Cloud Messaging for Android' is enabled (menu item API's)
var GOOGLE_PROJECT_ID = "15978248288";

(function (global) {
    var DemoViewModel,
        app = global.app = global.app || {};

    
    document.addEventListener('deviceready', function () {
        initPushwoosh();
    }, false);

    DemoViewModel = kendo.data.ObservableObject.extend({

        // Added a seperate method for sake of demo, but you should call this immediately after pushNotification.onDeviceReady
        registerDevice: function () {
            window.plugins.pushNotification.registerDevice(
                function (result) {
                    // not all platforms agree on the result type
                    var token = typeof result === 'string' ? result : result['deviceToken'];
                    navigator.notification.alert(token, null, 'Device registered', 'Close');
                },
                function (status) {
                    navigator.notification.alert(JSON.stringify(['failed to register ', status]));
                });
        },
        
        unregisterDevice: function () {
            window.plugins.pushNotification.unregisterDevice(this.onSuccess, this.onError);
        },

        getPushToken: function () {
            window.plugins.pushNotification.getPushToken(this.onSuccess);
        },

        startLocationTracking: function () {
            window.plugins.pushNotification.startLocationTracking(this.onSuccess, this.onError);
        },

        stopLocationTracking: function () {
            window.plugins.pushNotification.stopLocationTracking(this.onSuccess, this.onError);
        },

        /*
        setTags: function () {
            var tags = {
	           "tag1": "a string value",
    	       "tag2": 42,
        	   "tag3": "a_string"
      		}; 
            window.plugins.pushNotification.setTags(tags, this.onSuccess, this.onError);
        },
        */

        // callbacks
        onSuccess: function(msg) {
            navigator.notification.alert(JSON.stringify(msg), null, 'Success callback', 'Close');
        },

        onError: function(msg) {
            navigator.notification.alert(JSON.stringify(msg), null, 'Error callback', 'Close');
        }
    });

    app.demoService = {
        viewModel: new DemoViewModel()
    };
})(window);

// Pushwoosh code:
// TODO de-duplicate; iOS and Android are very similar)

function initPushwooshWP8() {
	var pushNotification = window.plugins.pushNotification;

	// Set push notification callback before we initialize the plugin. This is called when a push is received.
	document.addEventListener('push-notification', function (event) {
        navigator.notification.alert(JSON.stringify(event), null, 'Push received', 'Close');
	});
    
	//initialize the plugin
    pushNotification.onDeviceReady({appid : PUSHWOOSH_APPID});
}

function initPushwooshIOS() {
  var pushNotification = window.plugins.pushNotification;

  // Set push notification callback before we initialize the plugin. This is called when a push is received.
  document.addEventListener('push-notification', function (event) {
    var notification = event.notification;
    navigator.notification.alert(notification.aps.alert);

    //to view full push payload
    navigator.notification.alert(JSON.stringify(notification));

    //reset badges on icon
    pushNotification.setApplicationIconBadgeNumber(0);
  });

  //initialize the plugin
  pushNotification.onDeviceReady({pw_appid : PUSHWOOSH_APPID});

  // reset (hide) badges on start by setting it to 0
  pushNotification.setApplicationIconBadgeNumber(0);
}

function initPushwooshAndroid() {

  var pushNotification = window.plugins.pushNotification;

  // Set push notification callback before we initialize the plugin. This is called when a push is received.
  document.addEventListener('push-notification', function (event) {
    var title = event.notification.title;
    var userData = event.notification.userdata;

    if (typeof(userData) != "undefined") {
      navigator.notification.alert('user data: ' + JSON.stringify(userData));
    }

    navigator.notification.alert(title);
  });

  // This will trigger all pending push notifications on start.
  pushNotification.onDeviceReady({projectid : GOOGLE_PROJECT_ID, appid : PUSHWOOSH_APPID});
}

function initPushwoosh() {
    if (window.navigator.simulator === true) {
        alert('This plugin is not available in the simulator.');
        return;
    } else if (window.plugins.pushNotification === undefined || typeof window.plugins.pushNotification.onDeviceReady == "undefined") {
        alert('Plugin not found. Maybe you are running in AppBuilder Companion app which currently does not support this plugin.');
        return;
    }

    switch (device.platform) {
        case "Android":
			initPushwooshAndroid();
            break;
        case "iPhone":
        case "iOS":
            initPushwooshIOS();
            break;
        case "Win32NT":
            initPushwooshWP8();
            break;
        default:
            alert('Unsupported push platform: ' + device.platform);
    }
}

window.onerror = function(a,b,c) {
    if (a.indexOf('of undefined or null reference') == -1) {
    	alert(a + '; ' + b + '; ' + c);
    }
}