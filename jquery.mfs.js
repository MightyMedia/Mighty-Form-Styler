/*
 * Mighty Form Styler for jQuery
 * Replaces your form select element for a html dropdown list which you can easily style with css.
 * Examples and documentation at: http://www.binkje.nl/mfs
 *
 * Copyright (c) 2012-2016 Bas van den Wijngaard
 * Version: 1.1.0
 * Licensed under the MIT License:
 * https://github.com/MightyMedia/Mighty-Form-Styler/blob/master/LICENSE
 *
 * Requires jQuery 1.7 or later
 *
 * Usage: $('#myForm').mfs(options);    - Enables the magic for your form, see available options below
 *        $('#myForm').mfs('refresh');  - Refreshes the styled selects (e.g. when you updated the select via ajax)
 *        $('#myForm').mfs('destroy');  - Removes the magic from your form
 *
 * options = {
 *      'dropdownHandle'    : '<i class="icon-chevron-down"></i>', // - Alternative HTML to use in the handle (i.e. fontawesome icons)
 *      'enableScroll'      : false,        // Set to true to enable scrolling in dropdown list
 *      'maxHeight'         : 200,          // Set the max height for the dropdown list in pixels (enableScroll needs to be set to true)
 *      'autoWidth'         : false,        // Set to true to adjust dropdown list width to widest option
 *      'disableTouch'      : false         // Set to true to use native select dropdown on mobile and touch devices
 *      'multipleTitle'     : 'selected'    // Set the title used for the selected option 'x selected', defaults to 'selected'
 *      'multipleTitleNone  : false         // Set alternative title for selected option on multi selects when no options are selected
 *      'multipleAutoClose  : true          // Set to false to keep a multi select open when selecting an option
 *      'skipClasses'       : ''            // Set one or more classes for select elements that don't need our magic
 *           }
 *
 */

/*
 * Utility for creating objects in older browsers
 */
if (typeof Object.create !== 'function') {
	Object.create = function(obj) {

		function F() {}
		F.prototype = obj;
		return new F();

	};
}

/*
 * Supportive selectors to enable extra mfs functionality
 *
 * :mfscontains('string') selector, case insensitive :contains() selector
 * :mfsseach('string') selector, case insensitive search for textContent or innerText starting with given string
 *
 */
$.extend($.expr[":"], {
    "mfscontains": function(elem, i, match) {
        return (elem.textContent || elem.innerText || "").toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
    }
});

$.extend($.expr[":"], {
    "mfssearch": function(elem, i, match) {
        var searchString    = match[3].toLowerCase();
        var searchLength    = searchString.length;
        return (elem.textContent || elem.innerText || "").toLowerCase().substr(0, searchLength) === searchString;
    }
});


/*
 * jquery.mfs plugin
 */
(function($, window, document, undefined) {

	var pluginName = 'mfs';
	var storageName = 'plugin_' + pluginName;

	var mfsSelectOpen = false;
	var searchTimer = false;
	var searchString = '';
	var touchDevice = /Android|webOS|iPad|iPhone/i.test(navigator.userAgent);

	var pluginObject = {

		init: function(options, element) {

			var self = this;

			// Initialise options
			self.options = $.extend(true, {}, $.fn[pluginName].options, options);

			// Set plugin event namespace
			self.namespace = '.' + pluginName + '.' + new Date().getTime();

			// Store current element
			self.element = element;
			self.$element = $(element);


			if (self.$element.is("select")) {

				var thisSelect = self.$element;

				if (!thisSelect.hasClass('mfs-enabled')) {

					self.createSelect(thisSelect);

				}

			} else {

				self.$element.each(function() {

					// Find all selects
					var thisForm = self.$element;

					if (!thisForm.hasClass('mfs-enabled')) {

						var selects = thisForm.find('select');

						if (selects.length > 0) {

							selects.each(function() {

								var thisSelect = $(this);

								if (!thisSelect.hasClass('mfs-enabled')) {

									self.createSelect(thisSelect);

								}

							});

						}

						// @TODO: Maybe later extend the plugin to style radio and checkbox inputs (or maybe not)
						thisForm.addClass('mfs-enabled');

					}

				});

			}

			// Make the select hide when clicking outside it
			$(window).click(function() {

				$('ul.mfs-options').hide();
				mfsSelectOpen = false;
				searchString = '';
				$('.mfs-container').removeClass('mfs-container-active');

			});


			// Bind events after intialisation
			self.bind();

			// Return plugin instance
			return self;

		},

		bind: function() {

			var self = this;

			// Make the new select behave more like a real one
			$(document).off('keydown.mfs');
			$(document).on('keydown.mfs', function(event) {

				var keyDown = event.keyCode;

				if (mfsSelectOpen !== false && (keyDown === 13 || keyDown === 38 || keyDown === 40 || keyDown === 27)) {

					var activeOption = mfsSelectOpen.find('li.mfs-option.active');
					var newActiveOption = false;

					if (keyDown === 38) { // up

						event.preventDefault();
						newActiveOption = activeOption.prevAll('.mfs-option:first');

						if (newActiveOption.length > 0) {

							newActiveOption.addClass('active');
							activeOption.removeClass('active');
							self.scrollToActiveOption(mfsSelectOpen);

						}

					} else if (keyDown === 40) { // down

						event.preventDefault();
						newActiveOption = activeOption.nextAll('.mfs-option:first');

						if (newActiveOption.length > 0) {

							newActiveOption.addClass('active');
							activeOption.removeClass('active');
							self.scrollToActiveOption(mfsSelectOpen);

						}

					} else if (keyDown === 13) { // Enter

						activeOption.find('a').click();

					} else if (keyDown === 27) { // Escape

						$('ul.mfs-options').hide();
						$('.mfs-container').removeClass('mfs-container-active');
						mfsSelectOpen = false;

					}
				} else if (mfsSelectOpen !== false && keyDown !== 37 && keyDown !== 39 && keyDown !== 16 && keyDown !== 17 && keyDown !== 18 && keyDown !== 91) { // Ignore left and right arrows, shift, ctrl, alt, cmd

					event.preventDefault();
					self.searchOption(keyDown);

				}

			});

			// Do your binds
			//self.bindProxied(self.$element, 'click', self.exampleMethod);

		},

		bindProxied: function($element, event, method) {

			var self = this;

			$element.on(event + self.namespace, $.proxy(function(e) {

				return method.call(self, e);

			}, self));

		},

		//Refresh the created replacement
		refresh: function() {

			var self = this;

			mfsSelectOpen = false;
			searchString = '';

			self.$element.each(function() {

				var thisSelects = $(this).find('select');

				if (thisSelects.length > 0) {

					thisSelects.each(function() {

						var thisSelect = $(this);
						var thisContainer = thisSelect.closest('div.mfs-container');

						if (!thisSelect.hasClass('mfs-enabled')) {

							self.createSelect(thisSelect);

						} else if (thisContainer.length > 0) {

							self.refreshSelect(thisContainer);

						}

					});

				}

			});

		},

		destroy: function() {

			var self = this;

			// Kill all the magic! Styling is a CSS thingie, and not for javascript!
			mfsSelectOpen = false;
			searchString = '';

			self.$element.each(function() {

				var thisForm = $(this);
				var containers = thisForm.find('div.mfs-container');

				if (containers.length > 0) {

					containers.each(function() {

						var thisContainers = self.$element;
						self.destroySelect(thisContainers);

					});

				}

				thisForm.removeClass('mfs-enabled');

			});

			// Remove all binds from element
			self.$element.off(self.namespace);

			// Remove plugin instance from object
			self.$element.removeData(storageName);

		},

		// Enable the javascript magic for the mfs container
		enableMagic: function(theContainer, multiple) {

			var self = this;

			var selectElm = theContainer.find('select');
			var selectElmOptions = selectElm.find('option');
			var selectedOption = theContainer.find('a.mfs-selected-option');
			var optionList = theContainer.find('ul.mfs-options');
			var optionListLi = optionList.find('li.mfs-option');
			var optionListOptions = optionList.find('a');

			var useAltTitle = false;
			var altTitle = selectElm.data('altTitle');

			if (typeof altTitle !== 'undefined' && altTitle.trim() !== '') {

				useAltTitle = true;

			}

			optionList.hide();
			theContainer.removeClass('mfs-container-active');
			mfsSelectOpen = false;
			searchString = '';

			if (self.options.disableTouch === true && touchDevice === true) {

				selectedOption.click(function() {

					selectElm.focus();
					return false;

				});

				selectElm.blur(function() {

					self.refreshSelect(theContainer);

				});

			} else {

				selectedOption.click(function() {

					var optionListAll = $('ul.mfs-options');

					if (optionList.is(':visible')) {

						optionList.hide();
						theContainer.removeClass('mfs-container-active');
						mfsSelectOpen = false;
						searchString = '';

					} else {

						optionListLi.removeClass('active');
						optionListAll.hide();
						optionList.show();
						theContainer.addClass('mfs-container-active');

						var optionListSelected = optionList.find('li.mfs-option.selected');

						if (optionListSelected.length > 0) {

							optionListSelected.addClass('active');

						} else {

							optionList.find('li.mfs-option:first-child').addClass('active');

						}

						if (self.options.enableScroll === true) {

							self.scrollToActiveOption(optionList);

						}

						mfsSelectOpen = optionList;

					}

					$(this).blur();
					return false;

				});

			}

			optionListOptions.click(function() {

				var mfsHandle = '&nbsp;';

				if (self.options.dropdownHandle !== false) {

					mfsHandle = self.options.dropdownHandle;

				}

				if (multiple === false) {

					var selectedOptionLabel = $(this).text();

					if (useAltTitle === true && selectElmOptions.eq($(this).attr('index')).attr('value') === '') {

						selectedOptionLabel = altTitle;

					}

					selectElmOptions.prop( 'selected', false );
					selectElmOptions.eq($(this).attr('index')).prop('selected', true );
					selectedOption.html(selectedOptionLabel + '<span>' + mfsHandle + '</span>');

					optionListLi.removeClass('active').removeClass('selected');
					$(this).closest('li').addClass('selected');

				} else {

					var thisLi = $(this).closest('li');

					if (thisLi.hasClass('selected')) {

						selectElmOptions.eq($(this).attr('index')).prop('selected', false );
						thisLi.removeClass('selected');

					} else {

						selectElmOptions.eq($(this).attr('index')).prop('selected', true );
						thisLi.addClass('selected');

					}

					var selectedCount = 0;

					if (selectElm.val() !== null) {

						selectedCount = selectElm.val().length;

					}

					selectedOption.html('<strong class="count">' + selectedCount + '</strong> ' + self.options.multipleTitle + '<span>' + mfsHandle + '</span>');

					if (self.options.mutlipleTitleNone !== false && selectedCount === 0) {

						selectedOption.html(self.options.mutlipleTitleNone + '<span>' + mfsHandle + '</span>');

					}

				}

				if (self.options.multipleAutoClose === true || multiple === false) {

					optionList.hide();
					mfsSelectOpen = false;
					theContainer.removeClass('mfs-container-active');

				}

				searchString = '';

				// Make a refresh function that just updates the select magic (destroy and re-enable)
				if (selectElm.selectedIndex !== $(this).attr('index') && selectElm.onchange) {

					selectElm.selectedIndex = $(this).attr('index');
					selectElm.onchange();

				}
				if (selectElm.selectedIndex !== $(this).attr('index')) {

					selectElm.selectedIndex = $(this).attr('index');
					selectElm.trigger('change');

				}
				if (multiple === true) {

					// Always trigger on change event when a multi select
					selectElm.trigger('change');

				}

				return false;

			});

			optionListLi.mouseover(function() {

				optionListLi.removeClass('active');
				$(this).addClass('active');

			});

			selectElm.addClass('mfs-enabled');

		},

		// Create select
		createSelect: function(thisSelect) {

			var self = this;

			var doCreation = true;
			var useAltTitle = false;
			var altTitle = thisSelect.data('altTitle');

			if (typeof self.options.skipClasses !== 'undefined' && self.options.skipClasses.trim() !== '') {

				var skipClassesArray = self.options.skipClasses.split(' ');

				if (skipClassesArray.length > 0) {

					for (var i = 0; i < skipClassesArray.length; i++) {

						var thisSkipClass = skipClassesArray[i];

						if (typeof thisSkipClass !== 'undefined' && thisSkipClass.trim() !== '') {

							if (thisSelect.hasClass(thisSkipClass)) {

								doCreation = false;

							}

						}

					}

				}

			}

			if (doCreation === true) {

				var touchClass = 'notouch';

				if (typeof altTitle !== 'undefined' && altTitle.trim() !== '') {

					useAltTitle = true;

				}

				if (self.options.disableTouch === true && touchDevice === true) {

					touchClass = '';

				}

				var multiple = false;

				if (thisSelect.attr('multiple')) {

					multiple = true;

				}

				thisSelect.after('<div class="mfs-container ' + touchClass + '"></div>');
				var mfsContainer = thisSelect.next('div.mfs-container');
				thisSelect.appendTo(mfsContainer);

				var mfsHandle = '&nbsp;';
				var mfsLabel = '';
				var mfsHtml = '';
				var mfsOptionsHtml = '';
				var indexCount = 0;
				var mfsUlStyle = '';
				var mfsAStyle = '';
				var selectedCount = 0;

				if (multiple === true) {

					if (self.options.mutlipleTitleNone !== false) {

						mfsLabel = self.options.mutlipleTitleNone;

					} else {

						mfsLabel = '<strong class="count">0</strong> ' + self.options.multipleTitle;

					}

				}

				if (self.options.autoWidth === true) {

					mfsAStyle = 'style="white-space: nowrap;"';

				}

				thisSelect.find('> option, optgroup').each(function() {

					var thisTagName = $(this).get(0).tagName.toLowerCase();

					if (thisTagName === 'option') {

						var thisActiveClass = '';
						var thisLabel = $(this).html();

						if (mfsLabel === '' || $(this).is(':selected')) {

							if (multiple === false) {

								if (useAltTitle === true && thisSelect.val() === '') {

									mfsLabel = altTitle;

								} else {

									mfsLabel = thisLabel;

								}

							}

							if ($(this).is(':selected')) {

								thisActiveClass = ' selected';
								selectedCount++;

								if (multiple === true) {

									mfsLabel = '<strong class="count">' + selectedCount + '</strong> ' + self.options.multipleTitle;

								}

							}

						}

						mfsOptionsHtml += '<li class="mfs-option' + thisActiveClass + '"><a href="#" index="' + indexCount + '"' + mfsAStyle + '>' + thisLabel + '</a></li>';
						indexCount++;

					}

					if (thisTagName === 'optgroup') {

						var optGroupLabel = $(this).attr('label');
						var mfsOptGroupHtml = '<li class="mfs-optgroup">' + optGroupLabel + '</li>';

						$(this).find('option').each(function() {

							var thisActiveClass = '';
							var thisLabel = $(this).html();

							if (mfsLabel === '' || $(this).is(':selected')) {

								mfsLabel = thisLabel;

								if ($(this).is(':selected')) {

									thisActiveClass = ' selected';

								}

							}

							mfsOptGroupHtml += '<li class="mfs-option mfs-optgroup-option' + thisActiveClass + '"><a href="#" index="' + indexCount + '"' + mfsAStyle + '>' + thisLabel + '</a></li>';
							indexCount++;

						});

						mfsOptionsHtml += mfsOptGroupHtml;

					}

				});

				if (self.options.dropdownHandle !== false) {

					mfsHandle = self.options.dropdownHandle;

				}

				if (self.options.enableScroll === true) {

					mfsUlStyle = 'overflow-y:auto;max-height:' + self.options.maxHeight + 'px;';

				}

				if (self.options.autoWidth === true) {

					mfsUlStyle = 'width:auto;min-width:100%;';

				}

				if (mfsUlStyle.length > 0) {

					mfsUlStyle = 'style="' + mfsUlStyle + '"';

				}

				mfsHtml += '<a class="mfs-selected-option" href="#">' + mfsLabel + '<span>' + mfsHandle + '</span></a>';
				mfsHtml += '<ul class="mfs-options"' + mfsUlStyle + '>' + mfsOptionsHtml + '</ul>';

				mfsContainer.prepend(mfsHtml);
				self.enableMagic(mfsContainer, multiple);

			}

		},

		// Destroy the magic for the select in this container
		destroySelect: function(theContainer) {

			var selectElm = theContainer.find('select');

			selectElm.removeClass('mfs-enabled');
			theContainer.before(selectElm);
			theContainer.remove();

		},

		// Refresh the magic for the select in this container
		refreshSelect: function(theContainer) {

			var self = this;
			var selectElm = theContainer.find('select');

			theContainer.before(selectElm);
			theContainer.remove();
			self.createSelect(selectElm);

		},

		// Search for option in the dropdown
		searchOption: function(keyCode) {

			var self = this;

			if (searchTimer !== false) {

				clearTimeout(searchTimer);

			}

			searchTimer = setTimeout(function() {

				searchString = '';

			}, 1000);

			var pressedChar = String.fromCharCode(keyCode);
			searchString += String(pressedChar);

			var foundOption = mfsSelectOpen.find("a:mfssearch('" + searchString + "')").filter(':first');

			if (foundOption.length > 0) {

				mfsSelectOpen.find('li.active').removeClass('active');
				foundOption.closest('li').addClass('active');
				self.scrollToActiveOption(mfsSelectOpen);

			}

		},

		// Scroll to the active option in the dropdown
		scrollToActiveOption: function(openMfsList) {

			var self = this;

			if (self.options.enableScroll === true) {

				var activeElm = openMfsList.find('li.mfs-option.active');
				var activeElmHeight = activeElm.height();
				var activeElmPos = activeElm.position();
				var activeElmOffset = activeElm.offset();
				var openMfsListHeight = openMfsList.height();

				if (activeElmPos.top > (self.options.maxHeight - 24)) {

					openMfsList.scrollTop(openMfsList.scrollTop() + activeElmOffset.top - openMfsList.offset().top - (openMfsListHeight - activeElmHeight) + 5);

				} else if (activeElmPos.top < 5) {

					openMfsList.scrollTop(openMfsList.scrollTop() + activeElmOffset.top - openMfsList.offset().top - 5);

				}

			}

		}

	};

	$.fn[pluginName] = function(options) {

		var args = Array.prototype.slice.call(arguments);

		return this.each(function() {

			var pluginInstance = $.data(this, storageName);

			if (typeof options === 'object' || options === 'init' || !options) {

				if (!pluginInstance) {

					if (options === 'init') {

						options = args[1] || {};

					}

					pluginInstance = Object.create(pluginObject).init(options, this);
					$.data(this, storageName, pluginInstance);

				} else {

					$.error('Plugin is already initialized for this object.');
					return;

				}

			} else if (!pluginInstance) {

				$.error('Plugin is not initialized for this object yet.');
				return;

			} else if (pluginInstance[options]) {

				var method = options;
				options = args.slice(1);
				pluginInstance[method].apply(pluginInstance, options);

			} else {

				$.error('Method ' + options + ' does not exist on jQuery.' + pluginName + '.');
				return;

			}

		});

	};

	$.fn[pluginName].options = {

		refresh				: true,
		radio				: false,
		checkbox			: false,
		dropdownHandle		: false,
		enableScroll		: false,
		maxHeight			: 200,
		autoWidth			: false,
		disableTouch		: false,
		multipleTitle		: 'selected',
		mutlipleTitleNone	: false,
		multipleAutoClose	: true,
		skipClasses			: ''

	};

})(jQuery, window, document);