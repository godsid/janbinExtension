// Allow notification
if (window.webkitNotifications) {
	if (window.webkitNotifications.checkPermission() == 1) { // 0 is PERMISSION_ALLOWED
		window.webkitNotifications.requestPermission();
  } 
}
localStorage.badge = 0;
var notificate;
var transaction = {id:null};
/* Connect Database*/
var db = openDatabase('notificationDB', '1.0', 'notification Database', 2 * 1024 * 1024);//2M
function onDBError(tx,e){
	console.log("Database Error: "+e.message);
}

db.transaction(function (tx) {
	/* Create Database if exits */
	tx.executeSql('CREATE TABLE IF NOT EXISTS notification (id integer primary key asc, time integer,link string,msg string,reading bool)',[]);
	//tx.executeSql('INSERT INTO notification (id, time ,link,msg,reading) VALUES(?,?,?,?,?)',[null,new Date(),"http://banpot.srihawong.info","test msg","false"],null,onDBError);

	/* Check notification isn't read */
	tx.executeSql("SELECT COUNT(*) AS row FROM notification WHERE reading='false'", [], function(tx, rs){
		localStorage.badge = rs.rows.item(0).row;
		if(rs.rows.length>0){	
			chrome.browserAction.setBadgeText({
				text: rs.rows.length.toString()
			});
		}
	},onDBError);
});

chrome.runtime.onInstalled.addListener(function(){
	/* Register Device */
	chrome.pushMessaging.getChannelId(true,function(ch){
		console.log(ch);
		$.post('http://srihawong.info/app/gcm/register.php',{
			"name":"guest",
			"email":"guest@janbin.com",
			"regId":ch.channelId,
			"appname":"janbin",
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

window.webkitNotifications.createHTMLNotification('notification.html').show();


/*chrome.topSites.get(function(r){
});
*/

// Push Process
chrome.pushMessaging.onMessage.addListener(function(obj){
	var payload = JSON.parse(obj.payload.replace(/\\"/g,'"'));
	
	localStorage.badge++;
	/*******************/
	/*Display Notification */
	if(payload.icon==undefined){
		payload.icon = "images/icon128.png";
	}
	if(payload.isHTML){
		var notificate = window.webkitNotifications.createHTMLNotification('notification.html');
	}else{
		var notificate = window.webkitNotifications.createNotification(payload.icon, payload.title, payload.msg);
	}
	db.transaction(function (tx) {
		tx.executeSql("INSERT INTO notification (id, time ,link,msg,reading) VALUES(?,?,?,?,?) ", [null,new Date(),payload.url,payload.msg,'false'], function(tx, rs){
			notificate.id = rs.insertId;
		});
	});
	notificate.url = payload.url;
	notificate.show();
	console.log(notificate);
	
	notificate.onclick = function(){
		chrome.tabs.create({url:this.url});
		console.log("Createtab:"+this.url);
		notificate = this;
		db.transaction(function (tx){
			tx.executeSql("UPDATE notification SET reading='true' WHERE id='"+notificate.id+"' ", [],null,onDBError);
		});
		this.close();
		localStorage.badge--;
		chrome.browserAction.setBadgeText({
			text: localStorage.badge.toString()
		});
	};
	
	/*******************/
	/*Display Badge */
	chrome.browserAction.setBadgeText({
		text: localStorage.badge.toString()
	});
	/*******************/
	/* Play Sound*/
	if(payload.sound!=undefined){
		chrome.tts.speak(payload.sound);
	}
	/*******************/
	/*Create Log*/
	console.log(payload);
});