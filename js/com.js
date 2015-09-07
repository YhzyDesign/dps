$(window).on("load", function(){
	//页面入口
	sapp.page.go(location.hash.substr(1));

	//loading
	$("#loading").removeClass("in");
});

$(function(){
	//初始化
	sapp.init({
		page:".page",
		preload:3
	});

	//页面滑动逻辑
	sapp.event.on("swipe", function(e){
		switch(e.dir){
			case "swipeUp" : sapp.page.next(); break;
			case "swipeDown" : sapp.page.prev(); break;
			case "swipeLeft" : sapp.page.inner_next(); break;
			case "swipeRight" : sapp.page.inner_prev(); break;
		}
	});

	//自适应
	sapp.fill({
		target : ".main",
		 width : 640,
		height : 960,
		  mode : "contain"
	});

	//音乐
	sapp.audio({
		  target : "#music",
		     src : "audio/bgmusic.mp3",
		 preload : "auto",
		    loop : true,
		autoplay : true // ios do not support autoplay, it would not work on ios
	});


	//分享
	sapp.share({
		 title : $("meta[name='shareTitle']").attr("content"),
		  desc : $("meta[name='shareDesc']").attr("content"),
		   img : $("meta[name='shareImg']").attr("content"),
		onOpen : function(e){
			//Mar.Seed.request("sapp","click","share");
		}
	});

	//页面到达统计
	(function(){
		var reach = 1;
		sapp.event.on("pageNext",function(e){
			if(e.page <= reach) return;
			reach = e.page;
			//Mar.Seed.request("sapp","swipe",("page"+reach));
		});
	})();

	// check useragent
	(function(){
	    var ua = sapp.ua;
	    if( !( ua.weixin ||  ua.uc ||  ua.ucweb || ua.android || ua.iPhone || ua.wPhone )) {
	      // add right url here.
	      //location.href = 'http://ruien.yhzydesign.com';
	      //return;
	    }
    })();

	//
	$(window).on("touchstart", function(){
		$(".more").removeClass("on");
	});
	$(".ele").on("click", function(){
		$(".more").removeClass("on");
	});
	$(".more").on("click", function(){
		if($(this).toggleClass("on").hasClass("on")){
		    // fix css on ios8.3 safari
	        $("+ .ele",this).fadeIn();
			$(".more").not(this).removeClass("on");
			//Mar.Seed.request("sapp","more","page"+sapp.page.now,"index"+$(this).attr("class").substr(-1));
		}else{
	        $("+ .ele", this).fadeOut();
			//Mar.Seed.request("sapp","moreclose","page"+sapp.page.now,"index"+$(this).attr("class").substr(-1));
		}
		event.stopImmediatePropagation();
	});
	$(".guide").on("touchstart", function(){
		$(this).remove();
		event.preventDefault();
		event.stopImmediatePropagation();
	});
	//
	var userArea = 0;
	var duringTime = 10*60;
	var areaMap = ["null","sh","nh","cd","bj"];
	var itemObj;
	if(localStorage && (+new Date - parseInt(localStorage.getItem("userTime")) < duringTime*1000) && localStorage.getItem("userArea")){
		userArea = parseInt(localStorage.getItem("userArea"));
		sapp.wareHouse.set("VIP_"+areaMap[userArea].toUpperCase());
		$("#page8 .guide").remove();
	}
	$("#popBuy .area a").on("click", function(e){
		if(localStorage){
			userArea = $(this).index()+1;
			localStorage.setItem("userArea", userArea);
			localStorage.setItem("userTime", +new Date);
			sapp.wareHouse.set("VIP_"+areaMap[userArea].toUpperCase());
		}
		$("#popBuy").removeClass("show");
		buy();
	});
	$("#popBuy .close").on("click", function(){
		$("#popBuy").removeClass("show");
	});
	$(".shoplist a").on("click", function(){
		if($(".more.on").length) return;
		itemObj = this;
		if(userArea){
			buy();
		}else{
			$("#popBuy").addClass("show");
		}
	});
	var buy = function(){
		var theID = $(itemObj).data(areaMap[userArea]);
		var dstr = theID.split("-");
		var link = $(itemObj).attr("data-"+areaMap[userArea]);
		//console.log(link);
		//Mar.Seed.request("sapp","buy",theID);
		location = link;
	}
});



/*jquery cookie*/
jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        var path = options.path ? '; path=' + options.path : '';
        var domain = options.domain ? '; domain=' + options.domain : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};


/**/
sapp.wareHouse = (function(){
	var _wareHouse = {};
	_wareHouse.get = function(){
		return $.cookie("WEIXIN_WAREHOUSE");
	};
	_wareHouse.set = function(wh){
		if(wh) $.cookie('WEIXIN_WAREHOUSE', wh, { expires: 7,path:'/',domain: 'vip.com' });
	};
	return _wareHouse;
})();
/**/
