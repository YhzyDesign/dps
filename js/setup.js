(function () {
  'use strict';
  var dps = new Swiper('.swiper-container', {
      nextButton: '.swiper-button-next',
      prevButton: '.swiper-button-prev',
      pagination: '.swiper-pagination',
      paginationClickable: true,
      // Disable preloading of all images
      preloadImages: false,
      // Enable lazy loading
      lazyLoading: true,
      lazyLoadingInPrevNext: true,
      preloadSlides: 3,
      preloadSlideWithClass: function( swiper, slide){
        console.log( slide )
      },
      onInit: function(swiper){
        var params = this, _slides = {};

        console.log(swiper,this);
        for(var i=0; i< swiper.slides.length; i++){
      		var newSlide = {
      			index : i,
      			slide : swiper.slides.eq(i),
      			loaded : false
      		};
      		newSlide.load = function(){
      			if(!this.loaded) {
      				this.loaded=true;
      				this.slide.addClass("onload");
              params.preloadSlideWithClass(swiper, newSlide  )
      			}
      			return newSlide;
      		};
      		//
      		_slides[newSlide.index] = newSlide;
      		//
      		if(newSlide.index< params.preloadSlides) newSlide.load();
      	}
        swiper.slides_for_preload = _slides
      }
  });

  // Add handler that will be executed only once
  dps.on('slideChangeEnd', function (swiper) {
    swiper.activeIndex;
    swiper.previousIndex;

    // load next slides
    if(swiper.params.preloadSlides){
      for(var i=0;i<swiper.params.preloadSlides;i++){
      		var nextLoad = swiper.activeIndex + i;
          if(nextLoad >= swiper.slides.length) break;
      		swiper.slides_for_preload[nextLoad].load();
      }
    }
    console.log('slider moved',swiper.activeIndex);
  });
})();
