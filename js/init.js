(function ($) {
    $(function () {

        $('.sidenav').sidenav();
        $('.slider').slider();
        $('.parallax').parallax();
        $('.materialboxed').materialbox();
        $('.tabs').tabs();
        $('.dropdown-trigger').dropdown({
            coverTrigger: false,
            hover: true,
            constrainWidth: true
        });
        $('.scrollspy').scrollSpy();
        $('.pushpin').pushpin();
        $('.scale-out').addClass('scale-in').removeClass('scale-out');
    }); // end of document ready
})(jQuery); // end of jQuery name space