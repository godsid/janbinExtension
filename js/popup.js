function onDBError(tx,e){
	console.log("Database Error: "+e.message);
}

var update  = [];
var db = openDatabase('notificationDB', '1.0', 'notification Database', 2 * 1024 * 1024);//2M
db.transaction(function (tx) {
	/* Check notification isn't read */
	tx.executeSql("SELECT * FROM notification ORDER BY id DESC LIMIT 0,10 ", [], function(tx, rs){
		if(rs.rows.length>0){
			for(var i =0;i<rs.rows.length;i++){
				console.log(rs.rows.item(i));
				update.push(rs.rows.item(i));
			}
			//showlist();
			chrome.tabs.create({url:"http://www.janbin.com/รีวิว/"+update[0].review_id});
		}
	},onDBError);
});


function showlist(){
	
/*
	var list = $('.list').clone();
	$('.notification').html('');
	//alert(update.length);
	console.log(update.length);
	for(var i=0;i<update.length;i++)
	{
		var newList = $(list).clone();
		$(newList).find('.thm-user')[0].href="http://www.janbin.com/profile/"+update[i].user_name;
		$(newList).find('.thm-user img')[0].src="http://www.janbin.com/farm/avatar_org"+update[i].user_img;
		$(newList).find('.thm-uname')[0].href="http://www.janbin.com/profile/"+update[i].user_name;
		$(newList).find('.thm-uname em')[0].innerHTML= '@'+update[i].user_name;
		$(newList).find('.detail a')[0].href="http://www.janbin.com/รีวิว/"+update[i].review_id;
		//$(newList).find('.detail a')[0].innerHTML=update[i].rtitle;
		$(newList).find('.detail span')[0].innerHTML = "";//"ได้เพิ่มรีวิวร้าน @"+update[i].review_title;
		$(newList).find('.review-img-link')[0].href="http://www.	.com/รีวิว/"+update[i].review_id;
		$(newList).find('.review-img')[0].src="http://ja.files-media.com/image"+update[i].review_img;
		$(newList).find('.score').css('width',update[i].review_ratting+'%');
		$(newList).appendTo('.notification');
	}
	$('a').click(function(){
		chrome.tabs.create({
			url :this.href,
			active :true
		})
	});
	$('.list').mouseover(function(){
			$(this).addClass('over');
	}).mouseout(function(){
		$(this).removeClass('over');
	});
	*/
}