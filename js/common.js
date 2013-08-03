if(localStorage.debug!=undefined&&localStorage.debug=='true'){
		var isDebug = true;
}else{
		var isDebug = false;
}

function justTime(t){
	var diffTime = Math.ceil((new Date().getTime()-t)/1000);
	if(diffTime<60){
		return "ประมาณ "+Math.ceil(diffTime)+" วินาทีที่แล้ว";
	}else if(diffTime<3600){
		return "ประมาณ "+Math.ceil(diffTime/60)+" นาทีที่แล้ว";
	}else if(diffTime<86400){
		return "ประมาณ "+Math.ceil(diffTime/3600)+" ชั่วโมงที่แล้ว";
	}else if(diffTime<172800){
		return "เมื่อวานนี้";
	}else{
		return thaiDate(t)
	}
}
function thaiDate(t){
	return new Date(t).toString().replace(/GMT.*/,'');
}
function Debug(msg){
	if(isDebug){
		console.log(msg);
	}
}