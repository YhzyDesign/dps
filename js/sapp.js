/*
*单屏框架 - sapp
*开发部门：ued
*作者：蕉皮、泽飞
*版本：v1.0
*更新时间：2014-07-03
*/
//滑动模块
var sapp = (function(){
 	var _sapp = {},
		_ox,_oy,
		_nx,_ny,
		_move = function(e){
			event.preventDefault();
		},
		_start = function(e){
			_ox = e.clientX || e.changedTouches[0].clientX;
			_oy = e.clientY || e.changedTouches[0].clientY;
		},
		_end = function(e){
			_nx = e.clientX || e.changedTouches[0].clientX;
			_ny = e.clientY || e.changedTouches[0].clientY;
			//
			var dx = _nx - _ox,
				dy = _ny - _oy;
			if(dx*dx+dy*dy < 25) return;

			if(Math.abs(dx) > Math.abs(dy)){
				sapp.event.call("swipe", {dir:(dx>0 ? "swipeRight" : "swipeLeft")});
			}else{
				sapp.event.call("swipe", {dir:(dy>0 ? "swipeDown" : "swipeUp")});
			}
		};

	document.addEventListener("touchstart",_start);
	document.addEventListener( "touchmove",_move);
	document.addEventListener(  "touchend",_end);
	document.addEventListener( "mousedown",_start);
	document.addEventListener(   "mouseup",_end);
	document.onmousewheel = function(e){
		sapp.event.call("swipe", {dir:(e.wheelDelta>0 ? "swipeDown" : "swipeUp")});
	}
	//
	return _sapp;
})();


//初始化
sapp.init = function(para){
	var p = $(para.page),
		_pages = {},
		_lock = false;

	sapp.page = {
		now : -1,
		out : -1,
		length : p.length,
		next : function(){
			if(_lock) return;
			var _notEdge = this.now+1 <= this.length;
			if(_notEdge){ this.go(this.now+1); }else {
			  this.go(1);
			}
			sapp.event.call("pageNext",{page:this.now, notEdge:_notEdge});
		},
		prev : function(){
			if(_lock) return;
			var _notEdge = this.now-1 >= 1;
			if(_notEdge) this.go(this.now-1);
			sapp.event.call("pagePrev",{page:this.now, notEdge:_notEdge});
		},
		go : function(index){
			if(_lock) return;
			index = parseInt(index) || 1;
			if(index==this.now || index<1 || this.length<index) return;

			location.hash = index==1 ? "" : index;
			var outPage = _pages[this.out],
				nowPage = _pages[this.now];
			this.out = this.now;
			this.now = index;
			if(outPage) outPage.sec.removeClass("out");
			if(nowPage) nowPage.sec.removeClass("in").addClass("out");
			_pages[index].sec.addClass("in");
			//
			//
			for(var i=0;i<para.preload;i++){
				var nextLoad = index + i;
				if(nextLoad > this.length) break;
				_pages[nextLoad].load();
			}
			//
			sapp.event.call("pageGo",{page:this.now});
			//
      // this is last page, prepare to swipe first
      if( _pages[1] ){
        if( this.length == index){
          _pages[1].sec.addClass("next");
        }else{
          _pages[1].sec.removeClass("next");
        }
      }

			sapp.page.lock();
			setTimeout(sapp.page.unlock, 1000);
		},
		inner_next : function(){
			if(_lock) return;
			nowPage = _pages[this.now];
			var _notEdge = nowPage.inner +1 <= nowPage.main.length ;
			if(_notEdge) this.inner_go( nowPage.inner +1 );
			//sapp.event.call("pageNext",{page:this.now, notEdge:_notEdge});
		},
		inner_prev : function(){
			if(_lock) return;
			nowPage = _pages[this.now];
			var _notEdge = nowPage.inner-1 >= 1;
			if(_notEdge) this.inner_go( nowPage.inner-1 );
		},
		inner_go : function(index){
			if(_lock) return;
			var	nowPage = _pages[this.now];
      nowPage.main.removeClass("out in")
			nowPage.main.eq(nowPage.inner-1).addClass("out");
			nowPage.main.eq(index-1).addClass("in");
			nowPage.inner = index;
			sapp.page.lock();
			setTimeout(sapp.page.unlock, 1000);
		},
		lock:function(){_lock=true;},
		unlock:function(){_lock=false;}
	};
	for(var i=0; i<sapp.page.length; i++){
		var newPage = {
			 index : i+1,
			   sec : p.eq(i),
			  main : p.eq(i).children(".main"),
			 inner : 1,
			loaded : false
		};
		newPage.name = newPage.sec.attr("id");
		newPage.load = function(){
			if(!this.loaded) {
				this.loaded=true;
				this.sec.addClass("onload");
			}
			return newPage;
		}
		//
		sapp.page[newPage.name] = newPage;
		_pages[newPage.index] = newPage;
		//
		if(newPage.index<=para.preload) newPage.load();
	}
	_pages[sapp.page.length].load();
}

//事件模块
sapp.event = (function(){
	var _event = {},
		_pool = {};

	//调度事件
	_event.call = function(name, e){
		var L = _getPool(name)._listeners,
			i,len=L.length;
		for(i=0;i<len;i++) L[i](e);
	}

	//绑定事件
	_event.on = function(name, func){
		var L = _getPool(name)._listeners,
			pos = _getFuncPos(L, func);

		if(pos==-1) L.push(func);
		//
		return _event;
	}

	//松绑事件
	_event.off = function(name, func){
		var L = _getPool(name)._listeners,
			pos = _getFuncPos(L, func);

		if(pos!=-1) L.splice(pos, 1);
		//
		return _event;
	}


	//_侦听器位置查询
	_getFuncPos = function(array, func){
		var i,len=array.length;
		for(i=0;i<len;i++){
			if(array[i]===func) return i;
		}
		return -1;
	}
	//_获取事件
	_getPool = function(name){
		_pool[name] = _pool[name] || {
			_listeners : []
		};
		return _pool[name];
	}
	//
	//
	return _event;
})();

//ua模块
sapp.ua = (function(){
	var _str = navigator.userAgent.toLowerCase(),
		has = function(value){
			return  -1!=_str.indexOf(value);
		},
		_ua = {
			 weixin : has("micromessenger"),
				 uc : has("ucbrowser"),
			  ucweb : has("ucweb"),
			android : has("android"),
			   iPad : has("ipad"),
			 iPhone : has("iphone"),
			 wPhone : has("windows phone"),
				iOS : has("ipad") || has("iphone")
		};

	_ua.toString = function(){return _str};
	//
	return _ua;
})();


//音乐模块
sapp.audio = function(para){
	var _audio = $.extend(new Audio, para);
	var target = $(para.target);

	sapp.audio = _audio;
	//
	if(_audio.autoplay){
		_audio.play();
	}else{
		$(document).one("touchstart", function(e){
			if(e.target==$(_audio.target)[0]){
				target.removeClass("on");
			}else{
				_audio.play();
			}
			event.preventDefault();
		});
	}
	target.addClass("on").on("click",function(){
		if(target.hasClass("on")){
			_audio.pause();
			target.removeClass("on");
			//Mar.Seed.request("sapp","music","pause");
		}else{
			_audio.play();
			target.addClass("on");
			//Mar.Seed.request("sapp","music","play");
		}
	});
};


//分享模块
sapp.share = function(para){
	//初始化参数
	para = $.extend({
		   title : document.title,
		    desc : document.title,
		     url : document.location.href.replace(location.hash,""),
		     img : "images/vip.png",
		   width : 100,
		  height : 100,
		   appid : "",
		callback : null,
		  onOpen : null
	},para);
	//
	//微信
	var weixin = {
		     appid : para.appid,
		   img_url : para.img,
		 img_width : para.width,
		img_height : para.height,
		      link : para.url,
		      desc : para.desc,
		     title : para.title
	}
	//微博
	var weibo = {
		content : para.desc,
		    url : para.url
	}
	//微信内置方法
	document.addEventListener("WeixinJSBridgeReady", function() {
		//WeixinJSBridge.call("hideToolbar");//隐藏底部工具栏
		//
		WeixinJSBridge.on("menu:share:appmessage", function(argv){
			WeixinJSBridge.invoke("sendAppMessage", weixin, para.callback);
			if(para.onOpen) para.onOpen();
		});
		// 分享到朋友圈
		WeixinJSBridge.on("menu:share:timeline", function(argv){
			WeixinJSBridge.invoke("shareTimeline", weixin, para.callback);
			if(para.onOpen) para.onOpen();
		});
		// 分享到微博
		WeixinJSBridge.on("menu:share:weibo", function(argv){
			WeixinJSBridge.invoke("shareWeibo", weibo, para.callback);
			if(para.onOpen) para.onOpen();
		});
	}, false);
	//
}

//自适应模块
sapp.fill = function(para){
	var MODE = {
		  "width" : "100% 0%",
		 "height" : "0% 100%",
		  "cover" : "0% 0%",
		"contain" : "100% 100%"
	}

	para = $.extend({
		 width : 640,
		height : 960,
		  mode : "100% 100%"
	},para);

	var tar = $(para.target),
		con = $(window);

	para.mode = (MODE[para.mode] || para.mode).split(" ");

	$(window).resize(function(){
		var ratioW = con.width()/para.width,
			ratioH = con.height()/para.height,
			ratioMax = Math.max(ratioW,ratioH),
			ratioMin = Math.min(ratioW,ratioH),
			ratioMainW = ratioW/parseInt(para.mode[0])*100,
			ratioMainH = ratioH/parseInt(para.mode[1] || para.mode[0])*100,
			ratio = Math.min(ratioMainW, ratioMainH, ratioMax);

		tar.css({width:parseInt(ratio*para.width), height:parseInt(ratio*para.height)});
	}).resize();
}
