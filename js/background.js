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
var notificationURL = 'http://www.janbin.com/api/notification/getOnceNotification/';
var checkLoginUrl = 'http://www.janbin.com/ajax/users/is_login';
var notificationUrl = 'https://secure.soi19.com/notification/register.php';
var extensionUrl = "https://chrome.google.com/webstore/detail/janbincom-notification/enmhpobiebfcjldhccpgacdjcfonclhl";
var db = openDatabase('notificationDB', '1.0', 'notification Database', 2 * 1024 * 1024);//2M
var isLogin = false;

function onDBError(tx,e){
	Debug("Database Error: "+e.message);
}
function query(sql,callback){
	Debug('Query: '+sql);
	db.transaction(function (tx) {
		tx.executeSql(sql,[],function(tx,rs){
			Debug(rs.row);
			if(callback!=undefined){
				callback(rs);
			}
		},onDBError);
	});
}

chrome.runtime.onInstalled.addListener(function(obj){
	Debug("Installed");
	createDatabase();
	notification = window.webkitNotifications.createNotification('images/icon128.png', "Welcome Janbin Notification", '');
	notification.url = wwwurl;
	notification.onclick = function(e){
		_gaq.push(['_trackEvent','Extension',obj.reason]);
		chrome.tabs.create({url:e.target.url});
	};
	notification.show();
});

chrome.runtime.onUpdateAvailable.addListener(function(obj){
	Debug("Updated");
	createDatabase();
	notification = window.webkitNotifications.createNotification('images/icon128.png', 'Janbin Notification new version('+obj.version+')', '');
	notification.url = extensionUrl;
	notification.onclick = function(e){
		_gaq.push(['_trackEvent','Extension new version',"clicked"]);
		chrome.tabs.create({url:e.target.url});
	};
	notification.show();
});

/* Google Analytics */
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-18384901-14']);


(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


// Allow notification
if (window.webkitNotifications){
	if (window.webkitNotifications.checkPermission() == 1) { // 0 is PERMISSION_ALLOWED
		window.webkitNotifications.requestPermission();
  }
}


/* Create Database if exits */
function createDatabase(){
	query("DROP TABLE notification");
	Debug('Create Database Table notification');
	/*if(localStorage.user==undefined){
		localStorage.user = 'guest';
	}*/
	/*if(localStorage.email==undefined){
		localStorage.email = 'guest@janbin.com';
	}*/
	query('CREATE TABLE IF NOT EXISTS notification (id integer primary key asc ,who string,action string,with string,at string, time integer, url string ,reading bool)');
	//query('CREATE TABLE IF NOT EXISTS notification (id integer primary key asc, time integer, user_img string, user_name string string, review_id string, review_title string, review_desc string,review_ratting integer,review_img string, reading bool)');

	query("INSERT INTO notification VALUES(1,'','welcome','','',"+Math.ceil(new Date().getTime()/1000)+",'"+wwwurl+"','false')");
	//query("INSERT INTO notification VALUES (2,'{\"username\":\"Cinnabon\",\"avatar\":\"/1/1/avt_19_53505.jpg\"}','comment','{\"username\":\"บรรพต สีหะวงษ์\",\"avatar\":\"/default.jpg?8\"}','{\"place\":\"@Caffe Sonata\",\"title\":\"คาเฟ่บรรยากาศเก๋ๆ ทานขนมหวานกับเพลงหวานๆ\",\"image\":\"/1/16/img_22922_OY1lg.jpg\"}',1375435680,'/3067-Caffe-Sonata','false')");

	//(comment) INSERT INTO notification VALUES (null,'{"username":"Cinnabon","avatar":"/1/1/avt_19_53505.jpg"}','comment','{"username":"บรรพต สีหะวงษ์","avatar":"/default.jpg?8"}','{"place":"@Caffe Sonata","title":"คาเฟ่บรรยากาศเก๋ๆ ทานขนมหวานกับเพลงหวานๆ","image":"/1/16/img_22922_OY1lg.jpg"}',1375435680,'/3067-Caffe-Sonata','false');	
	//addreview INSERT INTO notification VALUES (null,'{username:"Cinnabon",avatar:"/1/1/avt_19_53505.jpg"}','addreview','{place:"@Caffe Sonata",title:"คาเฟ่บรรยากาศเก๋ๆ ทานขนมหวานกับเพลงหวานๆ",image:"/1/16/img_22922_OY1lg.jpg"}','',1375435680,'/3067-Caffe-Sonata','false');
	//like INSERT INTO notification VALUES (null,'{username:"Cinnabon",avatar:"/1/1/avt_19_53505.jpg"}','like','{place:"@Caffe Sonata",title:"คาเฟ่บรรยากาศเก๋ๆ ทานขนมหวานกับเพลงหวานๆ",image:"/1/16/img_22922_OY1lg.jpg"}','{username:"บรรพต สีหะวงษ์",avatar:"/default.jpg?8"}',1375435680,'/3067-Caffe-Sonata','false');
	//vote 
	//addimage
	checkBadge();
}
/* Check notification isn't read */
function checkBadge(){
	Debug("checkBadge");
	query("SELECT COUNT(*) AS row FROM notification WHERE reading='false'  ",function(respArr){
		item = respArr.rows.item(0).row;
		Debug('Badge: '+item);
		if(item>0){
			localStorage.badge = item;
		}else{
			localStorage.badge = 0;
		}
		badge = localStorage.badge>0?localStorage.badge:'';
			chrome.browserAction.setBadgeText({
					text: badge.toString()
			});
		});
}
function checkLogin(callback){
	Debug("checkLogin");
	chrome.cookies.get({url :wwwurl,name:'WCC_user'},function(cookie){
		if(cookie==null){
			Debug("is not Login");
			isLogin = false;
			if(callback!=undefined){
				callback();
			}
		}else{
			isLogin = true;
			$.get(checkLoginUrl,function(resp){
				localStorage.user = resp.payload.result.data.username;
				localStorage.email = resp.payload.result.data.username;
				Debug("is Logined: User: "+localStorage.user+", Email: "+localStorage.email);
			});
		}
		if(callback!=undefined){
			callback();
		}
	});
}
/* Register device*/
var registerDevice = function(){
	
	Debug("registerDevice");
	chrome.pushMessaging.getChannelId(true,function(ch){
		
		var name = localStorage.user=='undefined'?'guest':localStorage.user;
		var email = localStorage.email=='undefined'?'guest@janbin.com':localStorage.email;
		Debug("ChannelId: "+ch.channelId+", Name: "+name+", Email: "+email);
		$.post(notificationUrl,{
			"udid":ch.channelId,
			"deviceToken":"not token",
			"appid":2,
			"username":name,
			"type":"chrome",
			"appname":"janbin",
			"email":email
		});
	});
}
// Push Process
function pushListener(){
	Debug("pushMessaging Listener");
	chrome.pushMessaging.onMessage.addListener(pushReceive);
}
//Received push data
function pushReceive(data){
	Debug("pushReceive");
	Debug(data);
	_gaq.push(['_trackPageview','/extension/notification/comment']);
	var push= data.payload.split('|');
	Debug(push);
	data = data.payload.replace(/\|/g,'/');
	Debug(data);
	//2/comment/8/15?format=json
	$.get(notificationURL+data,{'format':'json','r':new Date().getTime()},function(resp){
		resp = resp.results.result.data;
		resp.action = push[1];
		resp.time = push[4];
		Debug(resp);
		query("INSERT INTO notification VALUES(null,'{\"username\":\""+resp.who.nickname+"\",\"avatar\":\""+resp.who.avatar+"\"}','"+resp.action+"','{\"username\":\""+resp.with.nickname+"\",\"avatar\":\""+resp.with.avatar+"\"}','{\"place\":\""+resp.at.place_name+"\",\"title\":\""+resp.at.description+"\",\"image\":\""+resp.at.image+"\"}',"+resp.time+",'"+resp.url+"','false') ");
		switch(resp.action){
			case 'newreview':
				notificationNewReview(resp);
				break;
			case 'comment':
				notificationComment(resp);
				break;
			case 3:
				notificationAddPoint(resp);
				break;
			case 4:
				notificationAddImage(resp);
				break;
			case 0:
			default:
				notificationMessage(resp);
				break;
		}
		
	});
	
}
// Display Notification message
function notificationMessage(data){
	data = data.split('|');
	notification = window.webkitNotifications.createNotification('images/icon128.png', data[0], data[1]);
	notification.url = data[2];
	notification.onclick = function(e){
		_gaq.push(['_trackEvent','Message '+data[0],'clicked']);
		chrome.tabs.create({url:e.target.url});
	};
	notification.show();
}
//Display Notification new review
function notificationNewReview(data){
	Debug(data);
	title = data.who.nickname+" ได้เพิ่มรีวิวร้านใหม่";
	message = data.at.place_name+"\n \""+data.at.description+"\"\n "+justTime(Math.ceil(new Date().getTime()/1000));
	notification = window.webkitNotifications.createNotification(avatarUrl+data.who.avatar, title, message);
	notification.url = data.url;//wwwurl+'รีวิว/'+data.at.place_id+'#place-rw';
	notification.onclick = function(e){
		_gaq.push(['_trackEvent','comment','clicked']);
		chrome.tabs.create({url:e.target.url});
	};
	notification.show();
}
// Display Notification Comment
function notificationComment(data){ 
	Debug(data);
	title = data.who.nickname+" คอมเม้นต์รีวิวของคุณ";
	message = data.at.place_name+"\n \""+data.at.description+"\"\n "+justTime(Math.ceil(new Date().getTime()/1000));
	notification = window.webkitNotifications.createNotification(avatarUrl+data.who.avatar, title, message);
	notification.url = data.url;//wwwurl+'รีวิว/'+data.at.place_id+'#place-rw';
	notification.onclick = function(e){
		_gaq.push(['_trackEvent','comment','clicked']);
		chrome.tabs.create({url:e.target.url});
	};
	notification.show();
}
function notificationAddPoint(data){
}
function notificationAddImage(data){
	/*chrome.notifications.create(new Date().getTime().toString(), {
		type: "image",
		title: data.title,
		message: data.message,
		iconUrl:data.iconUrl,
		imageUrl:data.imageUrl,
		},
		function(){
		}
	);*/
}
function createcontextMenu(){
	chrome.contextMenus.create({type:'normal',title:'janbin.com',contexts:['all'],onclick:function(info,tab){
			chrome.tabs.create({url:'http://www.janbin.com'});
			//,documentUrlPatterns:['http://*.janbin.com/*']
	}});
}
createcontextMenu();
checkBadge();
checkLogin(registerDevice);
pushListener();

/*
chrome.topSites.get(function(r){
});
*/

// Push Process
/*
chrome.pushMessaging.onMessage.addListener(function(obj){
	_gaq.push(['_trackPageview','/extension/notification']);
	var payload = JSON.parse(obj.payload.replace(/\\"/g,'"'));
	console.log(payload);
	if(payload.ri==undefined){
		return false;
	}
	localStorage.badge++;
	/******************
	/*Display Notification 
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
	
	/******************
	/*Display Badge 
	chrome.browserAction.setBadgeText({
		text: localStorage.badge.toString()
	});
	/******************
	/* Play Sound
	if(payload.sound!=undefined){
		chrome.tts.speak(payload.sound);
	}
	/*******************/
	/*Create Log
	console.log(payload);
});*/