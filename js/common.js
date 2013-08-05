var day = ['','วันจันทร์','วันอังคาร','วันพุธ','วันพฤหัส','วันศุกร์','วันเสาร์','วันอาทิตย์'];
var month = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
if(localStorage.debug!=undefined&&localStorage.debug=='true'){
		var isDebug = true;
}else{
		var isDebug = false;
}

function justTime(t){
	var diffTime = Math.ceil((new Date().getTime()-t)/1000);
	console.log(new Date(t));
	if(diffTime<60){
		return "ประมาณ "+Math.ceil(diffTime)+" วินาทีที่แล้ว";
	}else if(diffTime<3600){
		return "ประมาณ "+Math.ceil(diffTime/60)+" นาทีที่แล้ว";
	}else if(diffTime<86400){
		return "ประมาณ "+Math.ceil(diffTime/3600)+" ชั่วโมงที่แล้ว";
	}else if(diffTime<172800){
		return "เมื่อวานนี้";
	}else if(diffTime<691200){
		return "เมื่อ"+day[new Date(t).getDay()];
	}else{
		return thaiDate(t);
	}
}
function thaiDate(t){
	var isDate = new Date(t);
	return day[isDate.getDay()]+' ที่ '+isDate.getDate()+' '+month[isDate.getMonth()]+' '+(isDate.getFullYear()+543);
	//new Date(t).toString().replace(/GMT.*/,'');
}
function Debug(msg){
	if(isDebug){
		console.log(msg);
	}
}

