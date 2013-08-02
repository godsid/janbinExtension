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
var notificationUrl = 'https://secure.soi19.com/notification/register.php';
var extensionUrl = "https://chrome.google.com/webstore/detail/janbincom-notification/enmhpobiebfcjldhccpgacdjcfonclhl";
var db = openDatabase('notificationDB', '1.0', 'notification Database', 2 * 1024 * 1024);//2M
var isLogin = false;
var debug = false;

if(localStorage.debug!=undefined&&localStorage.debug=='true'){
	debug = true;
}

chrome.runtime.onInstalled.addListener(function(obj){
	notification = window.webkitNotifications.createNotification('images/icon128.png', "Welcome Janbin Notification", '');
	notification.url = wwwurl;
	notification.onclick = function(e){
		_gaq.push(['_trackEvent','Extension',obj.reason]);
		chrome.tabs.create({url:e.target.url});
	};
	notification.show();
});

chrome.runtime.onUpdateAvailable.addListener(function(obj){
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
if (window.webkitNotifications) {
	if (window.webkitNotifications.checkPermission() == 1) { // 0 is PERMISSION_ALLOWED
		window.webkitNotifications.requestPermission();
  }
}

function onDBError(tx,e){
	if(debug){
		console.log("Database Error: "+e.message);
	}

}
function query(sql,callback){
	if(debug){
		console.log('Query: '+sql);
	}
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
	if(localStorage.user==undefined){
		localStorage.user = 'guest';
	}
	if(localStorage.email==undefined){
		localStorage.email = 'guest@janbin.com';
	}
	query('CREATE TABLE IF NOT EXISTS notification (id integer primary key asc ,who string,action string,with string,at string, time integer, url string ,reading bool)');
	//query('CREATE TABLE IF NOT EXISTS notification (id integer primary key asc, time integer, user_img string, user_name string string, review_id string, review_title string, review_desc string,review_ratting integer,review_img string, reading bool)');

	//(comment) INSERT INTO notification VALUES (null,'{username:"Cinnabon",avatar:"/1/1/avt_19_53505.jpg"}','comment','{place:"@Caffe Sonata",title:"คาเฟ่บรรยากาศเก๋ๆ ทานขนมหวานกับเพลงหวานๆ",image:"/1/16/img_22922_OY1lg.jpg"}','{username:"บรรพต สีหะวงษ์",avatar:"/default.jpg?8"}',1375435680,'/3067-Caffe-Sonata','false');
	//addreview INSERT INTO notification VALUES (null,'{username:"Cinnabon",avatar:"/1/1/avt_19_53505.jpg"}','addreview','{place:"@Caffe Sonata",title:"คาเฟ่บรรยากาศเก๋ๆ ทานขนมหวานกับเพลงหวานๆ",image:"/1/16/img_22922_OY1lg.jpg"}','',1375435680,'/3067-Caffe-Sonata','false');
	//like INSERT INTO notification VALUES (null,'{username:"Cinnabon",avatar:"/1/1/avt_19_53505.jpg"}','like','{place:"@Caffe Sonata",title:"คาเฟ่บรรยากาศเก๋ๆ ทานขนมหวานกับเพลงหวานๆ",image:"/1/16/img_22922_OY1lg.jpg"}','{username:"บรรพต สีหะวงษ์",avatar:"/default.jpg?8"}',1375435680,'/3067-Caffe-Sonata','false');
	//vote 
	//addimage
}
/* Check notification isn't read */
function checkBadge(){
		query("SELECT COUNT(*) AS row FROM notification WHERE reading='false'",function(respArr){
		if(debug){
			console.log('Badge:'+respArr.row);
		}
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
function checkLogin(callback){
	chrome.cookies.get({url :wwwurl,name:'WCC_user'},function(cookie){
		if(cookie==null){
			isLogin = false;
			if(callback!=undefined){
				callback();
			}
		}else{
			isLogin = true;
			$.get(checkLoginUrl,function(resp){
				localStorage.user = resp.payload.result.data.username;
				localStorage.email = resp.payload.result.data.username;
			});
		}
		if(callback!=undefined){
			callback();
		}
	});
}
/* Register device*/
var registerDevice = function(){
	if(debug){
		console.log("register device");
	}
	chrome.pushMessaging.getChannelId(true,function(ch){
		if(debug){
			console.log(localStorage.user);
		}
		name = isLogin?localStorage.user:'guest';
		email = isLogin?localStorage.email:'guest@janbin.com';
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
	if(debug){
		console.log("pushMessaging Listener");
	}
	chrome.pushMessaging.onMessage.addListener(pushReceive);
}
//Received push data
function pushReceive(data){
	_gaq.push(['_trackPageview','/extension/notification/comment']);
	switch(data.subchannelId){
		case 1:
			notificationNewReview(data.payload);
			break;
		case 2:
			notificationComment(data.payload);
			break;
		case 3:
			notificationAddPoint(data.payload);
			break;
		case 4:
			notificationAddImage(data.payload);
			break;
		case 0:
		default:
			notificationMessage(data.payload);
			break;
	}
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
}
// Display Notification Comment
function notificationComment(data){ 
	data = data.split('|');
	console.log(data);
	title = data[1]+" คอมเม้นต์รีวิวของคุณ";
	message = data[2]+"\n "+justTime(data[3]);
	notification = window.webkitNotifications.createNotification(avatarUrl+data[0], title, message);
	notification.url = wwwurl+'รีวิว/'+data[4]+'#place-rw';
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

function justTime(t){
	var diffTime = new Date().getTime()-t;

	if(diffTime<60000){
		return Math.ceil(diffTime/60000)+" วินาทีที่แล้ว";
	}else if(diffTime<3600000){
		return Math.ceil(diffTime/3600000)+" นาทีที่แล้ว";
	}else if(diffTime<86400000){
		return Math.ceil(diffTime/86400000)+" ชั่วโมงที่แล้ว";
	}else if(diffTime<172800000){
		return "เมื่อวานนี้";
	}else{
		return thaiDate(t)
	}
}
function thaiDate(t){
	return new Date(t).toString().replace(/GMT.*/,'');
}

createDatabase();
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