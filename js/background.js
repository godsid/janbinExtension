/* Connect Database*/
localStorage.badge = 0;
var notificate;
var transaction = {id:null};
var username = null;
var email = null;
var wwwurl = "http://www.janbin.com/";
var authurl = "http://www.janbin.com/users/auth";
var reviewUrl = "http://www.janbin.com/รีวิว/";
var avatarUrl = 'http://www.janbin.com/farm/avatar_org';
var checkLoginUrl = 'http://www.janbin.com/ajax/users/is_login';
var db = openDatabase('notificationDB', '1.0', 'notification Database', 2 * 1024 * 1024);//2M






/* Google Analytics */
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-18384901-14']);


(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


// Allow notification
if (window.webkitNotifications) {
	if (window.webkitNotifications.checkPermission() == 1) { // 0 is PERMISSION_ALLOWED
		window.webkitNotifications.requestPermission();
  }
}

function onDBError(tx,e){
	console.log("Database Error: "+e.message);
}
function query(sql,callback){
	db.transaction(function (tx) {
		tx.executeSql(sql,[],function(tx,rs){
			if(callback!=undefined){
				callback(rs);
			}
		},onDBError);
	});
}
/* Create Database if exits */
function createDatabase(){
	query('CREATE TABLE IF NOT EXISTS notification (id integer primary key asc, time integer, user_img string, user_name string string, review_id string, review_title string, review_desc string,review_ratting integer,review_img string, reading bool)');
}
/* Check notification isn't read */
function checkBadge(){
	query("SELECT COUNT(*) AS row FROM notification WHERE reading='false'",function(respArr){
		if(respArr.row>0){
			localStorage.badge = respArr.item(0).row;
		}else{
			localStorage.badge = 0;
		}
		badge = localStorage.badge>0?localStorage.badge:'';
			chrome.browserAction.setBadgeText({
					text: badge.toString()
			});
		});
}
function checkLogin(){
	chrome.cookies.get({url :wwwurl,name:'WCC_user'},function(cookie){
		if(cookie==null){
			isLogin = false;
			randerLogin();
		}else{
			isLogin = true;
			$.get(checkLoginUrl,function(resp){
				console.log(resp);
			});
			
		}
	});
}
/* Register device*/
function registerDevice(){

}

createDatabase();
checkBadge();
checkLogin();


/*
db.transaction(function (tx) {
	//tx.executeSql('CREATE TABLE IF NOT EXISTS notification (id integer primary key asc, time integer, user_img string, user_name string string, review_id string, review_title string, review_desc string,review_ratting integer,review_img string, reading bool)',[]);
	
	// Check notification isn't read 
	tx.executeSql("SELECT COUNT(*) AS row FROM notification WHERE reading='false'", [], function(tx, rs){
		localStorage.badge = rs.rows.item(0).row;
		console.log("Badge: "+localStorage.badge);
		if(localStorage.badge>0){
			badge = localStorage.badge;
		}else{
			badge  = "";
		}
			chrome.browserAction.setBadgeText({
				text: badge.toString()
			});
	},onDBError);
});
*/
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

/*chrome.topSites.get(function(r){
});
*/

// Push Process
chrome.pushMessaging.onMessage.addListener(function(obj){
	_gaq.push(['_trackPageview','/extension/notification']);
	var payload = JSON.parse(obj.payload.replace(/\\"/g,'"'));
	console.log(payload);
	if(payload.ri==undefined){
		return false;
	}
	localStorage.badge++;
	/*******************/
	/*Display Notification */
	if(payload.icon==undefined){
		payload.icon = "images/icon128.png";
	}
	// review
	if(payload.t==1){
		payload.title = '@'+payload.rt;
		payload.msg = payload.m+" โดย "+payload.un;
		payload.url = "http://www.janbin.com/รีวิว/"+payload.ri;
	}
	
	if(payload.isHTML){
		var notificate = window.webkitNotifications.createHTMLNotification('notification.html');
	}else{
		payload.icon='http://ja.files-media.com/image'+payload.rm;
		var notificate = window.webkitNotifications.createNotification(payload.icon, payload.title, payload.msg);
	}
	db.transaction(function (tx) {
		tx.executeSql("INSERT INTO notification (id, time ,user_img,user_name,review_id,review_title, review_desc, review_ratting, review_img, reading) VALUES(?,?,?,?,?,?,?,?,?,?) ", [null,new Date(),payload.ui,payload.un,payload.ri,payload.rt,payload.rd,payload.ra,payload.rm,'false'], function(tx, rs){
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
		localStorage.badge = localStorage.badge-1;
		chrome.browserAction.setBadgeText({
			text: localStorage.badge.toString()
		});
		_gaq.push(['_trackEvent','notification','clicked']);
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