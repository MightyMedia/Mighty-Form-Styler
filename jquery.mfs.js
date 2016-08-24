/*
 * Mighty Form Styler for jQuery
 * Replaces your form select element for a html dropdown list which you can easily style with css.
 * Examples and documentation at: http://www.binkje.nl/mfs
 *
 * Copyright (c) 2012-2014 Bas van den Wijngaard
 * Version: 1.0.10
 * Licensed under the MIT License:
 * https://github.com/MightyMedia/Mighty-Form-Styler/blob/master/LICENSE.txt
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
 *      'mutlipleAutoClose  : true          // Set to false to keep a multi select open when selecting an option
 *      'skipClasses'       : ''            // Set one or more classes for select elements that don't need our magic
 *           }
 *
 */

// Utility for creating objects in older browsers
if (typeof Object.create !== 'function') {
	Object.create = function(obj) {

		function F() {}
		F.prototype = obj;
		return new F();

	};
}

(function($, window, document, undefined) {
	var pluginName = 'mfs';
	var storageName = 'plugin_' + pluginName;

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

			// Init your plugin stuff here
			self.exampleVariable = 0;

			// Bind events after intialisation
			self.bind();

			// Return plugin instance
			return self;

		},

		bind: function() {

			var self = this;

			// Do your binds
			self.bindProxied(self.$element, 'click', self.exampleMethod);

		},

		bindProxied: function($element, event, method) {

			var self = this;

			$element.on(event + self.namespace, $.proxy(function(e) {
				return method.call(self, e);
			}, self));

		},

		destroy: function() {

			var self = this;



			// Remove all binds from element
			self.$element.off(self.namespace);

			// Remove plugin instance from object
			self.$element.removeData(storageName);

		},

		exampleMethod: function(e) {

			var self = this;

			// Do some magic!
			self.exampleVariable++;
			console.log('Clicked ' + self.exampleVariable + ' times!');

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
        refresh           : true,
        radio             : false,
        checkbox          : false,
        dropdownHandle    : false,
        enableScroll      : false,
        maxHeight         : 200,
        autoWidth         : false,
        disableTouch      : false,
        multipleTitle     : 'selected',
        mutlipleTitleNone : false,
        multipleAutoClose : true,
        skipClasses       : ''
	};

})(jQuery, window, document);