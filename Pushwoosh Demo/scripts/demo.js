(function (global) {
    var DemoViewModel,
        app = global.app = global.app || {};

    document.addEventListener('deviceready', function () {
        initPushwoosh();
    }, false);

    DemoViewModel = kendo.data.ObservableObject.extend({

        // Added a seperate method for sake of demo, but you could call this immediately after pushNotification.onDeviceReady
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

        getPushwooshHWID: function () {
            window.plugins.pushNotification.getPushwooshHWID(this.onSuccess);
        },

        setTags: function () {
            var tags = {
	           "tag1": "string value",
    	       "tag2": 42,
        	   "tag3": "string"
      		}; 
            window.plugins.pushNotification.setTags(tags, this.onSuccess, this.onError);
        },

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
// TODO de-duplicate iOS and Android are very similar)

function registerPushwooshWP8() {
	var pushNotification = window.plugins.pushNotification;
    
    //push notifications handler (TODO: not kicked off from native code yet)
	document.addEventListener('push-notification', function (event) {
    	alert('ok, event: ' + event);
    	alert(JSON.stringify(event));
		// TODO see WP8 repo example
	});
    
	//initialize the plugin
    pushNotification.onDeviceReady({appid:"F9408-29446"});
}

/*
function getUserTokenWP8(result) {
        alert("Get user token: " + result);
      document.getElementById('pushKey').value = result;

//        $("#userToken").html(result);
}

function onPushReceiveWP8(pushContent) {
    alert('onpush creati');
        alert("Push has been recived: " + pushContent);

        $("#secondPage").show();
        $("#firstPage").hide();
        $("#pushContent").html(pushContent);

        getUserData();
}

function getUserDataWP8() {
    alert('TODO: get user data');
//        PushWooshPlugin.getUserData(app.onGetUserDataComplete, app.onError);
}
*/

function registerPushwooshIOS() {
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
  pushNotification.onDeviceReady({pw_appid:"F9408-29446"});

  // reset (hide) badges on start by setting it to 0
  pushNotification.setApplicationIconBadgeNumber(0);
}

/*
function onPushwooshiOSInitialized(pushToken) {
  var pushNotification = window.plugins.pushNotification;
  //retrieve the tags for the device
  pushNotification.getTags(function (tags) {
        console.warn('tags for the device: ' + JSON.stringify(tags));
      },
      function (error) {
        console.warn('get tags error: ' + JSON.stringify(error));
      });

  // start geo tracking. PWTrackSignificantLocationChanges - Uses GPS in foreground, Cell Triangulation in background.
  pushNotification.startLocationTracking('PWTrackSignificantLocationChanges',
      function () {
        console.warn('Location Tracking Started');
      });
}
*/

function registerPushwooshAndroid() {

  var pushNotification = window.plugins.pushNotification;

  // Set push notification callback before we initialize the plugin. This is called when a push is received.
  document.addEventListener('push-notification', function (event) {
    var title = event.notification.title;
    var userData = event.notification.userdata;

    if (typeof(userData) != "undefined") {
      console.warn('user data: ' + JSON.stringify(userData));
    }

    //and show alert
    navigator.notification.alert(title);

    //stopping geopushes
    //pushNotification.stopGeoPushes();
  });

  //initialize Pushwoosh with projectid: "GOOGLE_PROJECT_ID", appid : "PUSHWOOSH_APP_ID". This will trigger all pending push notifications on start.
  pushNotification.onDeviceReady({ projectid: "15978248288", appid : "F9408-29446" });
}

/*
function onPushwooshAndroidInitialized(pushToken) {
  //output the token to the console
  console.warn('push token: ' + pushToken);
  document.getElementById('pushKey').value = pushToken;

  var pushNotification = window.plugins.pushNotification;

  pushNotification.getTags(function (tags) {
        console.warn('tags for the device: ' + JSON.stringify(tags));
      },
      function (error) {
        console.warn('get tags error: ' + JSON.stringify(error));
      });


  //set multi notification mode
  //pushNotification.setMultiNotificationMode();
  //pushNotification.setEnableLED(true);

  //set single notification mode
  //pushNotification.setSingleNotificationMode();

  //disable sound and vibration
  //pushNotification.setSoundType(1);
  //pushNotification.setVibrateType(1);

  pushNotification.setLightScreenOnNotification(false);

  //goal with count
  //pushNotification.sendGoalAchieved({goal:'purchase', count:3});

  //goal with no count
  //pushNotification.sendGoalAchieved({goal:'registration'});

  //setting list tags
  //pushNotification.setTags({"MyTag":["hello", "world"]});

  //settings tags
  pushNotification.setTags({deviceName: "hello", deviceId: 10},
      function (status) {
        console.warn('setTags success');
      },
      function (status) {
        console.warn('setTags failed');
      });

  function geolocationSuccess(position) {
    pushNotification.sendLocation({lat: position.coords.latitude, lon: position.coords.longitude},
        function (status) {
          console.warn('sendLocation success');
        },
        function (status) {
          console.warn('sendLocation failed');
        });
  }

  // onError Callback receives a PositionError object
  //
  function geolocationError(error) {
    alert('code: ' + error.code + '\n' +
        'message: ' + error.message + '\n');
  }

  function getCurrentPosition() {
    navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);
  }

  //greedy method to get user position every 3 second. works well for demo.
//	setInterval(getCurrentPosition, 3000);

  //this method just gives the position once
//	navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);

  //this method should track the user position as per Phonegap docs.
//	navigator.geolocation.watchPosition(geolocationSuccess, geolocationError, { maximumAge: 3000, enableHighAccuracy: true });

  //Pushwoosh Android specific method that cares for the battery
  pushNotification.startGeoPushes();
}
*/

function initPushwoosh() {
    if (window.plugins === undefined) {
        alert('Plugin not available. Are you running in the simulator?');
        return;
    };
    
    switch (device.platform) {
        case "Android":
			registerPushwooshAndroid();
            break;
        case "iPhone":
        case "iOS":
            registerPushwooshIOS();
            break;
        case "Win32NT":
            registerPushwooshWP8();
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