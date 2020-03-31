var Books = (function () {

	var $books = $('#bk-list > li > div.bk-book');

	function init() {

		$books.each(function () {

			var $book = $(this),
				$parent = $book.parent(),
				$bookview = $parent.find('button.bk-bookview');


			$parent.find('button.bk-bookback').on('click', function () {

				$bookview.removeClass('bk-active');

				if ($book.data('flip')) {

					$book.data({
						opened: false,
						flip: false
					}).removeClass('bk-viewback').addClass('bk-bookdefault');

				} else {

					$book.data({
						opened: false,
						flip: true
					}).removeClass('bk-viewinside bk-bookdefault').addClass('bk-viewback');

				}

			});

		});

	}

	return {
		init: init
	};

})();