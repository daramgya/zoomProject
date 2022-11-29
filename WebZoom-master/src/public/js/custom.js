$(function () {
  /* Slick Slider - Welcome */
  $('.slide').slick({
    infinite: true,
    dots: false,
    autoplay: true,
    autoplaySpeed: 2000,
    fade: true,
    speed: 1000,
    pauseOnHover: false
  });

  /* TypeIt - Welcome */
  $('#typing').typeIt({
    strings: ["This is Web Real-Time", "Communication.", "Use WebRTC."],
    speed: 100,
    autoStart: true,
    breakLines: false,
  });

})

