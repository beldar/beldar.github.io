var AppView = Backbone.View.extend({
    el: 'body',
    
    events: {
        "click nav ul li a" : "goTo",
        "submit #contactform" : "sendEmail"
    },
    
    initialize: function() {
        var that = this;

        window.menuItems = $("nav ul li a");
        window.scrollItems = $("nav ul li a").map(function(){
            var anchor = $(this).prop('href').split('#')[1];
            if( $('#'+anchor).length > 0 )
                return $('#'+anchor);
        });
        window.lastId = false;

        $(window).on('resize', _.debounce(this.setHeights, 10, true));
        $(window).on('scroll', _.debounce(this.scrollSpy, 10, true));
        
        this.setHeights();
        
        this.initSvgAnimation();
        
        this.carouselSpeed = 4000;
        setTimeout(function(){
            that.initCarousel();
        },500);
        
        //$("html,body").animate({scrollTop: 0}, 1000);
       
    },
        
    initSvgAnimation: function(){
        var that = this;
        this.preparesvgs();
        this.animate();
        this.interval = setInterval(function() {
            that.animate();
        }, $("svg").length * 4000);
    },
            
    setHeights: function(){
        $("section").css('height', $(window).height());
        $("section#contact > .container > .row").css('margin-top', $("ul.grid").outerHeight()+30);
        
        if ($(window).width()<768) {
            $("nav").on('click', function(){
                $(this).toggleClass('open');
            });
        }
    },
    
    scrollSpy: function(e) {
        // Get container scroll position
        var fromTop = $(this).scrollTop()+66;

        // Get id of current scroll item
        var cur = window.scrollItems.map(function(){
          if ($(this).offset().top < fromTop)
            return this;
        });
        
        // Get the id of the current element
        cur = cur[cur.length-1];

        var id = cur && cur.length ? cur[0].id : "";
        if (this.lastId !== id) {
            this.lastId = id;
            // Set/remove active class
            this.menuItems
              .removeClass("active")
              .filter("[href$=#"+id+"]").addClass("active");
        }                   
    },
            
    goTo: function(e) {
        var $target = $(e.target),
            href    = $target.prop('href'),
            r       = href.split('#')[1],
            href = '#'+r;
        
        $('html, body').animate({
            scrollTop: $(href).offset().top-65
        }, 1000);
        return false;
    },
            
    initCarousel: function() {
        this.setCarouselHeight();
        var that = this;
        $(".carousel").each(function(){
            var $car = $(this);
            $car.find("div").css({
                'position':'absolute',
                'top':'0',
                'left':'0'
            });
            
            $car.find("div:gt(0)").hide();
            
            setInterval(function() { 
              $car.find('div').eq(0)
                .fadeOut(2000)
                .next()
                .fadeIn(2000)
                .end()
                .appendTo($car);

            },  that.carouselSpeed);
        });
        
        $(window).resize(_.debounce(this.setCarouselHeight, 10, true));
    },
            
    setCarouselHeight: function() {
        $(".carousel").each(function(){
            $(this).css('height', $(".carousel > div").height());
        });
    },
            
    preparesvgs: function() {
        $("svg path").each(function() {
            var path = $(this).get()[0];
            var length = path.getTotalLength();
            path.style.strokeDasharray = length + ' ' + length;
            path.style.strokeDashoffset = length;
            path.getBoundingClientRect();
        });
        $("svg").css('display', 'block');
    },
            
    animate: function() {
        t = 0;
        $("svg").each(function(){
            var svg = $(this);
            setTimeout(function(){
                svg.find('path').each(function() {
                    var path = $(this).get()[0];
                        path.style.strokeDashoffset = '0';
                        path.style.strokeWidth = '8px';
                        path = false;
                });
            },t);
            t+=3000;
            setTimeout(function(){
                svg.find('path').each(function() {
                    var path = $(this).get()[0];
                        path.style.strokeDashoffset = path.getTotalLength();
                        path.style.strokeWidth = '0';
                        path = false;
                        svg = false;
                });
            },t);
            t+=1000;
        });
        return false;
    },
    
    sendEmail: function() {
        if ($("#name").val() === '') {
            $("#name").css('border', '2px solid #cb4e4e');
            return false;
        }
        if ($("#email").val() === '') {
            $("#email").css('border', '2px solid #cb4e4e');
            return false;
        }
        if ($("#message").val() === '') {
            $("#message").css('border', '2px solid #cb4e4e');
            return false;
        }
        $("#sendbtn").button('loading');
        $.ajax({
            type: "POST",
            url: "https://mandrillapp.com/api/1.0/messages/send.json",
            data: {
              'key': '2or5NPcO1Av6WnHb8XNMnw',
              'message': {
                'from_email': $("#email").val(),
                'to': [
                    {
                      'email': 'beldar.cat@gmail.com',
                      'name': 'Martí',
                      'type': 'to'
                    }
                  ],
                'autotext': 'true',
                'subject': 'New message from '+$("#name").val(),
                'html': $("#message").val()
              }
            }
         }).done(function(response) {
               if (response[0].status === 'sent') {
                   $("#emailok").removeClass('hidden');
               } else {
                   $("#emailko").removeClass('hidden');
               }
               $("#sendbtn").button('reset');
         }).fail(function(){
               $("#emailko").removeClass('hidden');
               $("#sendbtn").button('reset');
         });
         return false;
    }
});

var App;
$(function(){
    App = new AppView();
});

/**
 * Save for later:
 * 
this.projects = [
            {
                video: 'raw_video/buzz.m4v',
                title: 'Bestival Buzz Tracker',
                description: '',
                url : 'http://bestivalbuzz.recognitionlondon.com/'
            },
            {
                video: 'raw_video/vfest.mov',
                title: 'VFestival Buzz Tracker',
                description: '',
                url : 'http://recognitionlondon.com/work/v-festival-buzz'
            }
        ];
        this.experiments = [
            {
                carousel: '<div class="carousel"><div><img src="img/recme.png" alt="RecMe" /></div><div><img src="img/recme2.png" alt="RecMe" /></div></div>',
                title: 'RecMe (Recommend me places)',
                description: '',
                url : 'http://recme.meteor.com/'
            }
        ];
 */
