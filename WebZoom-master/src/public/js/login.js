
// 회원가입
function signupCheck() {
  var email = $('#user_email').val();
  var username = $('#user_name').val();
  var pw = $('#user_pass').val();
  var pw2 = $('#user_pass2').val();
  
  if (pw!==pw2) alert("비밀번호가 일치하지 않습니다!");
  else if (email=='' || username=='' || pw=='') alert("빈칸을 입력해주세요.");
  else {
    $.ajax({
      url : "/signUpProcess",
      type : "POST",
      data : {
        email : email,
        username : username,
        password : pw
      },
      success : function(data) {
        if (data === "fail") {
          alert("해당 이메일이 이미 존재합니다!");
        }
        else if (data === "success") {
          alert("성공적으로 회원가입 하였습니다!");
          location.href="http://localhost:4000/";
        }
      }
    });
  }
}

// 로그인
function loginCheck() {
  var email = $('#user_loginEmail').val();
  var password = $('#user_loginPw').val();
  
  if (email == '') alert("이메일을 입력해주세요!");
  else {
    $.ajax({
      url : "/loginProcess",
      type : "POST",
      data : {
        email : email,
        password : password
      },
      success : function(data) {
        if (data === "fail") {
          alert("이메일이나 비밀번호가 틀렸습니다! 다시 확인해주세요.");
        }
        else if (data === "success") {
          alert("성공적으로 로그인 되었습니다.");
          location.href="http://localhost:4000/";
        }
      }
    });
  }
}


// LOGIN TABS
$(function() {
    tab = $('.tabs h3 a');
    tab.on('click', function(event) {
      event.preventDefault();
      tab.removeClass('active');
      $(this).addClass('active');
      tab_content = $(this).attr('href');
      $('div[id$="tab-content"]').removeClass('active');
      $(tab_content).addClass('active');
    });
  });
  
  // SLIDESHOW
  $(function() {
    $('#slideshow > div:gt(0)').hide();
    setInterval(function() {
      $('#slideshow > div:first')
      .fadeOut(1000)
      .next()
      .fadeIn(1000)
      .end()
      .appendTo('#slideshow');
    }, 3850);
  });
  
  // CUSTOM JQUERY FUNCTION FOR SWAPPING CLASSES
  (function($) {
    'use strict';
    $.fn.swapClass = function(remove, add) {
      this.removeClass(remove).addClass(add);
      return this;
    };
  }(jQuery));
  
  // SHOW/HIDE PANEL ROUTINE (needs better methods)
  // I'll optimize when time permits.
  $(function() {
    $('.agree, .forgot, #toggle-terms, .log-in, .sign-up').on('click', function(event) {
      event.preventDefault();
      var user = $('.user'),terms = $('.terms'),form = $('.form-wrap'),recovery = $('.recovery'),close = $('#toggle-terms'),arrow = $('.tabs-content .fa');
      if ($(this).hasClass('agree') || $(this).hasClass('log-in') || ($(this).is('#toggle-terms')) && terms.hasClass('open')) {
        if (terms.hasClass('open')) {
          form.swapClass('open', 'closed');
          terms.swapClass('open', 'closed');
          close.swapClass('open', 'closed');
        } else {
          if ($(this).hasClass('log-in')) {
            return;
          }
          form.swapClass('closed', 'open');
          terms.swapClass('closed', 'open').scrollTop(0);
          close.swapClass('closed', 'open');
          user.addClass('overflow-hidden');
        }
      }
      else if ($(this).hasClass('forgot') || $(this).hasClass('sign-up') || $(this).is('#toggle-terms')) {
        if (recovery.hasClass('open')) {
          form.swapClass('open', 'closed');
          recovery.swapClass('open', 'closed');
          close.swapClass('open', 'closed');
        } else {
          if ($(this).hasClass('sign-up')) {
            return;
          }
          form.swapClass('closed', 'open');
          recovery.swapClass('closed', 'open');
          close.swapClass('closed', 'open');
          user.addClass('overflow-hidden');
        }
      }
    });
  });
  
  // DISPLAY MSSG
  $(function() {
    $('.recovery .button').on('click', function(event) {
      event.preventDefault();
      $('.recovery .mssg').addClass('animate');
      setTimeout(function() {
        $('.form-wrap').swapClass('open', 'closed');
        $('.recovery').swapClass('open', 'closed');
        $('#toggle-terms').swapClass('open', 'closed');
        $('.tabs-content .fa').swapClass('active', 'inactive');
        $('.recovery .mssg').removeClass('animate');
      }, 2500);
    });
  });
  
  // DISABLE SUBMIT FOR DEMO
  $(function() {
    $('.button').on('click', function(event) {
      $(this).stop();
      event.preventDefault();
      return false;
    });
  });