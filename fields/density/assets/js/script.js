(function($) {
	$.fn.density = function() {
		return this.each(function() {
			var field = $(this);
			var fieldname = 'density';

			if(field.data( fieldname )) {
				return true;
			} else {
				field.data( fieldname, true );
			}

			keywordDensity.init(field);

			var narrow = true;
			var selector = keywordDensity.selectorTexts(field);

			field.find('.all-words' ).click(function() {
				narrow = false;
				keywordDensity.actionAllWords(field, narrow);
			});

			field.find('.less-words' ).click(function() {
				narrow = true;
				keywordDensity.actionLessWords(field, narrow);
			});

			$(selector).bind('input propertychange', function() {
				keywordDensity.actionTextchange(field);
			});

			// Trigger all tags - Try to only trigger keyword tags
			$(document).on("click", '.tag-x', function () {
				keywordDensity.actionTagClick(field);
			});

			$(document).keypress(function(e) {
				var focused_obj = $('.field-name-' + field.attr('data-keywords') + ' .input-with-tags' );
				if( focused_obj.hasClass('input-is-focused') ) {
					keywordDensity.actionTagEnter(field);
				}
			});
		});
	};

	var keywordDensity = (function () {
		var fn = {};
		var field;
		var texts;
		var rows;
		var data;
		var slice;
		var narrow = true;
		var allwords;
		var keywords;

		fn.init = function(from_field) {
			field = from_field;

			fn.reload();
			fn.textsChange();
			if( field.attr('data-keywords') ) {
				keywords = $('.field-name-' + field.attr('data-keywords') + ' .field-content > input').val();
			}
			field.find('.all-words').addClass('show');
		};

		fn.actionAllWords = function(from_field, from_narrow) {
			field = from_field;
			narrow = from_narrow;
			field.find('.all-words').removeClass('show');
			field.find('.less-words').addClass('show');
			fn.reload();
		};

		fn.actionLessWords = function(from_field, from_narrow) {
			field = from_field;
			narrow = from_narrow;
			field.find('.all-words').addClass('show');
			field.find('.less-words').removeClass('show');
			fn.reload();
		};

		fn.actionTextchange = function(from_field) {
			field = from_field;
			fn.reload();
		};

		fn.actionTagClick = function(from_field) {
			field = from_field;
			fn.reload();
		};

		fn.actionTagEnter = function(from_field) {
			field = from_field;
			fn.reload();
		}

		fn.selectorTexts = function(from_field) {
			field = from_field;
			var array = field.attr('data-text').split(' ');
			var selector = '';
			$.each( array, function( i, word ) {
				selector += '.field-name-' + word + ' .input, ';
			});

			selector = selector.slice(0, -2);
			return selector;
		};

		fn.textsChange = function() {
			var array = field.attr('data-text').split(' ');
			var selector = '';
			$.each( array, function( i, word ) {
				selector += '.field-name-' + word + ' .input, ';
			});

			selector = selector.slice(0, -2);

			$(selector).bind('input propertychange', function() {
				fn.reload();
			});
		};

		/*fn.keywordsChange = function(from_field) {
			field = from_field;
			new_keywords = $('.field-name-' + field.attr('data-keywords') + ' .field-content > input').val();
			new_keywords = new_keywords.toLowerCase();

			if( new_keywords != keywords ) {
				fn.reload();
			}

			setTimeout(function() {
				fn.keywordsChange(field);
			}, 1000);
		};*/

		fn.allWordsClick = function() {
			field.find('.all-words' ).click(function() {
				narrow = false;
				fn.reload();
				field.find('.all-words').removeClass('show');
				field.find('.less-words').addClass('show');
			});
		};

		fn.lessWordsClick = function() {
			field.find('.less-words' ).click(function() {
				narrow = true;
				fn.reload();
				field.find('.all-words').addClass('show');
				field.find('.less-words').removeClass('show');
			});
		};

		fn.setTexts = function() {
			var array = field.attr('data-text').split(' ');
			texts = '';

			$.each( array, function( i, word ) {
				texts += $( '.field-name-' + word + ' .input').val() + ' ';
			});
		};

		fn.setTextsPush = function() {
			var option_words = field.attr('data-words');

			if( option_words && option_words > 1 ) {
				push = [];
				$.each( texts, function( i, word ) {
					if( option_words == 2 ) {
						if( i < texts.length - 1 ) {
							push[i] = word + ' ' + texts[i+1];
						}
					} else if( option_words == 3 ) {
						if( i < texts.length - 2 ) {
							push[i] = word + ' ' + texts[i+1] + ' ' + texts[i+2];
						}
					}
				});

				texts = push;
			}
		};

		fn.reload = function() {
			fn.setTexts();

			if( texts ) {
				fn.strip();
				fn.setTextsPush();
				fn.data();
				fn.rows();
				fn.sort()
				fn.slice();

				field.find('tbody').html(rows);

				fn.selectKeywords(field);
				fn.setAllWords();
			}
		};

		fn.selectKeywords = function(field) {
			var values = $('.field-name-' + field.attr('data-keywords') + ' .field-content > input').val();
			var not_found = [];
			var missing_html = '<strong>Missing:</strong> ';
			if( values ) {
				var array = values.split(",");
				$.each( array, function( i, word ) {
					word = word.toLowerCase();
					word = word.replace(/[^a-z0-9 ]/g);

					var found = texts.indexOf(word);

					if( found == -1 ) {
						not_found[i] = word;
						missing_html += '<div class="">' + word + '</div>'; 
					}

					field.find('[data-word="' + word + '"]').addClass('active');
				});
			}
			if( not_found.length > 0 ) {
				field.find('.missing').html('<div class="inside">' + missing_html + '</div>');
			} else {
				field.find('.missing').html('');
			}
		};

		fn.setAllWords = function() {
			count = Object.keys(data).length;

			if( count <= field.attr('data-limit') ) {
				field.attr('data-slice', false);
			} else {
				field.attr('data-slice', true);
			}
		};

		fn.slice = function() {
			if( narrow ) {
				rows = rows.slice(0, field.attr('data-limit'));
			}
		};

		fn.strip = function() {
			texts = texts.toLowerCase();
			texts = texts.replace(/[^a-z0-9\u0080-\u00FF-]/g,' ').split(' ');
			texts = texts.filter(function(n){return n; });
		};

		fn.data = function() {
			data = {};
			count = texts.length;
			$.each( texts, function( i, word ) {
				if( word != '-') {
					number = data[word] && data[word]['count'] ? data[word]['count'] + 1 : 1;
					data[word] = {
						count: number,
						percent: Math.round(( number / count ) * 100 * 100) / 100
					};

				}
			});
		};

		fn.rows = function() {
			rows = '';
			$.each( data, function( word, word_data ) {
				rows += '<tr data-word="' + word + '" data-count="' + word_data['count'] + '">';
					
					rows += '<td class="word"><div>' + fn.capitilize(word) + '</div></td>';
					rows += '<td class="count">' + word_data['count'] + '</td>';
					rows += '<td class="percent">' + word_data['percent'] + ' %</td>';
					rows += '<td class="symbol"><div></div></td>';
				rows += '</tr>';
			});
		};

		fn.sort = function() {
			if( rows ) {
				rows = $.parseHTML(rows);
				rows.sort(function(a, b){
					return $(b).data('count')-$(a).data('count')
				});
			}
			return rows;
		};

		fn.capitilize = function(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		};

		return fn;
	})();

})(jQuery);