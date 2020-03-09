(function ($) {
    $(function () {
        $(document).scroll(function () {
            topOfFooter = $('#contest-prep-footer').position().top;
            // Distance user has scrolled from top, adjusted to take in height of sidebar (570 pixels inc. padding).
            scrollDistanceFromTopOfDoc = $(document).scrollTop() + 570;
            // Difference between the two.
            scrollDistanceFromTopOfFooter = scrollDistanceFromTopOfDoc - topOfFooter;

            // If user has scrolled further than footer,
            // pull sidebar up using a negative margin.
            if (scrollDistanceFromTopOfDoc > topOfFooter) {
                $('#table-of-contents-id').css('margin-top', 0 - scrollDistanceFromTopOfFooter);
            } else {
                $('#table-of-contents-id').css('margin-top', '10%');
            }
        });
    }); // end of document ready
})(jQuery); // end of jQuery name space