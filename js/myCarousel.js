var carouselContainer = $("#myCarousel");
var slideInterval = 5000;		
function toggleC(){
        $('.toggleCaption').hide()
        var caption = carouselContainer.find('.active').find('.toggleCaption').addClass('animated fadeInUp').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
                function (){
                $(this).removeClass('animated fadeInUp')
});
caption.slideToggle();
}

carouselContainer.carousel({
interval: slideInterval, cycle: true, pause: "hover"})
.on('slide.bs.carousel slid.bs.carousel', toggleC).trigger('slide.bs.carousel');

