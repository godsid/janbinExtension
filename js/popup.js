var db = openDatabase('notificationDB', '1.0', 'notification Database', 2 * 1024 * 1024);//2M
var isLogin = false;
var wwwurl = "http://www.janbin.com";
var authurl = "http://www.janbin.com/users/auth";
var reviewUrl = "http://www.janbin.com/รีวิว";
var avatarUrl = 'http://www.janbin.com/farm/avatar_org';
var staticUrl = 'http://ja.files-media.com/image';
var debug = false;

if(localStorage.debug!=undefined&&localStorage.debug=='true'){
	debug = true;
}

/* Google Analytics */
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-18384901-14']);
_gaq.push(['_trackPageview','/extension/popup.html']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

function onDBError(tx,e){
	console.log("Database Error: "+e.message);
}
function randerLogin(){
	$('.login').show();
	//$('.login .btn-submit').click(function(){
	//	chrome.tabs.create({url:'http://www.janbin.com/users/auth/login'});
//	});
	/*$('.login a').click(function(){
		var thislink = $(this).attr('href');
		chrome.tabs.query({url:authurl+'*'},function(respArr){	
			if(respArr.length){
				chrome.tabs.update(respArr[0].id,{active:true,url:thislink});
			}else{
				chrome.tabs.create({url:thislink});
			}
		});
	});*/s
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
function randerNotificationComment(item,newnode){
	var who = JSON.parse(item.who);
	var at = JSON.parse(item.at);
	//console.log(at);
	$($(newnode).find('a')[0]).attr('href',reviewUrl+item.url);
	$($(newnode).find('.thm-user')[0]).attr('src',avatarUrl+who.avatar);
	$($(newnode).find('.u-name')[0]).html(who.username);
	$($(newnode).find('.txt-red')[0]).html('ได้คอมเม้นต์รีวิวร้าน');
	
	$($(newnode).find('strong')[0]).html(at.place);
	$($(newnode).find('small')[0]).html(at.title);
	$($(newnode).find('.thb-action img')[0]).attr('src',staticUrl+(at.image.replace('.jpg','_70x70.jpg')));
	$($(newnode).find('figcaption')[0]).html(at.place);
	$($(newnode).find('abbr')[0]).html(justTime(item.time*1000));
	$($(newnode).find('abbr')[0]).attr('data-utime',item.time*1000);
	$($(newnode).find('abbr')[0]).attr('title',item.time*1000);
	if(item.reading=='false'){
		$(newnode).addClass('reading');
	}
	return newnode;
}
function randerNotificationWelcome(item,newnode){
	Debug('randerNotificationWelcome');
	//var who = JSON.parse(item.who);
	//var at = JSON.parse(item.at);
	//console.log(at);
	$($(newnode).find('a')[0]).attr('href',item.url);
	$($(newnode).find('.thm-user')[0]).attr('src','/images/icon128.png');
	$($(newnode).find('.u-name')[0]).html('Janbin Master');
	$($(newnode).find('.txt-red')[0]).html('ได้ส่งข้อความหาคุณ');
	
	$($(newnode).find('strong')[0]).html('');
	$($(newnode).find('small')[0]).html('ยินดีต้อนรัยสู่เว็บ Janbin.com ค่ะ');
	$($(newnode).find('.thb-action img')[0]).remove();
	$($(newnode).find('figcaption')[0]).remove();
	$($(newnode).find('abbr')[0]).html(justTime(item.time*1000));
	$($(newnode).find('abbr')[0]).attr('data-utime',item.time*1000);
	$($(newnode).find('abbr')[0]).attr('title',item.time*1000);
	if(item.reading=='false'){
		$(newnode).addClass('reading');
	}
	return newnode;
}
function randerNotification(items){
	if(debug){
		console.log('rander Notification');
	}
	var template = $('.notification li:first').clone();
	$('.notification').html('');
	
	for(var i=0;i<items.length;i++){
		var item = items.item(i);
		var newnode = $(template).clone();
		switch(item.action){
			case 'comment':
				newnode = randerNotificationComment(item,newnode);
				break;
			case 'welcome':
				newnode = randerNotificationWelcome(item,newnode);
			default:
				break;
		}
		$(newnode).appendTo('.notification');
	}
	delete newnode;
	delete template;
	delete item;
	delete who;
	delete at;
	$('.notification li a').click(function(){
		chrome.tabs.create({url:$(this).attr('href')}	);
	});

}
function getNotification(){
	query("SELECT * FROM notification ORDER BY  reading ASC ,time DESC LIMIT 0,10 ",function(resp){
		if(resp.rows.length>0){
			$('.notification').hide();
			randerNotification(resp.rows);
			$('.notification').show();
			$('.notification .list').mouseover(function(){
				$(this).addClass('over');
			});
			$('.notification .list').mouseout(function(){
				$(this).removeClass('over');
			});
			$('.notification .list').click(function(){
				_gaq.push(['_trackEvent','popup_review','clicked']);
				chrome.tabs.create({url:$($(this).find('.detail a')[1]).attr('href')});
			});
		}else{
			//chrome.tabs.create({url:wwwurl});
			//window.close();
		}
	});
	query("UPDATE notification SET reading = 'true'");
	chrome.browserAction.setBadgeText({
		text: ''
	});
	localStorage.badge = 0;
}

// Check Login
chrome.cookies.get({url :wwwurl,name:'WCC_user'},function(cookie){
	if(cookie==null){
		isLogin = false;
		randerLogin();
	}else{
		isLogin = true;
		getNotification();
	}
});


