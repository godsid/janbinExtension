// Allow notification
if (window.webkitNotifications) {
	if (window.webkitNotifications.checkPermission() == 1) { // 0 is PERMISSION_ALLOWED
		window.webkitNotifications.requestPermission();
  } 
}

chrome.runtime.onInstalled.addListener(function(){
	chrome.pushMessaging.getChannelId(true,function(ch){
		console.log(ch);
		$.post('http://srihawong.info/app/gcm/register.php',{
			"name":"guest",
			"email":"guest@janbin.com",
			"regId":ch.channelId,
			"apptype":"chrome"
		});
	});
	
	
	/*
	this.db = openDatabase('notification', '1.0', 'janbin notification', 8192);
	this.db.transaction(function(tx) {
	  tx.executeSql("create table if not exists " +
		"notification(id integer primary key asc, time integer, user_id string," +
				  "user_name string, user_image string,review_title string,review_link string, review_desc string,review_img string,review_ratting float",
		[],
		function() { console.log("siucc"); }
	  );
	});
	*/
});


function notificationOndisplay(param){
	console.log("Display");
	console.log(param);
}
function notificationOnclose(param){
	console.log(param);
}
function notificationShow(param){
	console.log(param);
}
chrome.topSites.get(function(r){
});

// Push Process
chrome.pushMessaging.onMessage.addListener(function(obj){
	var payload = JSON.parse(obj.payload);
	currentBadge = 0;
	/*******************/

	/*Display Notification */
	if(payload.icon==undefined){
		payload.icon = "images/icon128.png";
	}
	window.webkitNotifications.createNotification(payload.icon, payload.title, payload.msg).show();
	/*******************/
	/*Display Badge */
	if(payload.Badge!=undefined){
		chrome.browserAction.getBadgeText(function(Badge){
			currentBadge = parseInt(Badge);
		});
		currentBadge= currentBadge+parseInt(payload.Badge);
		if(currentBadge>0){
			chrome.browserAction.setBadgeText({
				text: currentBadge+parseInt(payload.Badge)
			});
		}
	}
	/*******************/
	/* Play Sound*/
	if(payload.sound!=undefined){
		chrome.tts.speak(payload.sound);
	}
	/*******************/
	/*Create Log*/
	console.log(obj);
	
});

