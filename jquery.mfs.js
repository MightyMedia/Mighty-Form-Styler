/*
 * Mighty Form Styler for jQuery
 * Replaces your form select element for a html dropdown list which you can easily style with css.
 * Examples and documentation at: http://www.binkje.nl/mfs
 *
 * Copyright (c) 2012-2014 Bas van den Wijngaard
 * Version: 1.0.8
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
 *           }
 *
 */

;(function( $, window, document, undefined ){
    'use_strict';

    var mfsSelectOpen   = false;
    var settings        = false;
    var searchTimer     = false;
    var searchString    = '';
    var mfsHandle       = '&nbsp;';
    var touchDevice     = /Android|webOS|iPad|iPhone/i.test(navigator.userAgent);

    // Enable the javascript magic for the mfs container
    var enableMagic = function (theContainer,multiple)
    {
        var selectElm           = theContainer.find('select');
        var selectElmOptions    = selectElm.find('option');
        var selectedOption      = theContainer.find('a.mfs-selected-option');
        var optionList          = theContainer.find('ul.mfs-options');
        var optionListLi        = optionList.find('li.mfs-option');
        var optionListOptions   = optionList.find('a');

        optionList.hide();
        mfsSelectOpen = false;
        searchString = '';

        if (settings.disableTouch === true && touchDevice === true) {
            selectedOption.click(function(){
               selectElm.focus();
               return false;
            });
            selectElm.blur(function(){
                refreshSelect(theContainer);
            });
        }
        else {
            selectedOption.click(function(){
                var optionListAll = $('ul.mfs-options');
                if (optionList.is(':visible')) {
                    optionList.hide();
                    mfsSelectOpen = false;
                    searchString = '';
                }
                else {
                    optionListLi.removeClass('active');
                    optionListAll.hide();
                    optionList.show();
                    var optionListSelected = optionList.find('li.mfs-option.selected');
                    if (optionListSelected.length > 0) {
                        optionListSelected.addClass('active');
                    }
                    else {
                        optionList.find('li.mfs-option:first-child').addClass('active');
                    }
                    if (settings.enableScroll === true) {
                        scrollToActiveOption(optionList);
                    }
                    mfsSelectOpen = optionList;
                }
                $(this).blur();
                return false;
            });
        }

        optionListOptions.click(function(){
            mfsHandle = '&nbsp;';
            if (settings.dropdownHandle !== false) {
                mfsHandle = settings.dropdownHandle;
            }

            if (multiple === false) {
                selectElmOptions.removeAttr('selected');
                selectElmOptions.eq($(this).attr('index')).prop('selected', 'selected');
                selectedOption.html($(this).text()+'<span>'+mfsHandle+'</span>');

                optionListLi.removeClass('active').removeClass('selected');
                $(this).closest('li').addClass('selected');

            }
            else {
                var thisLi = $(this).closest('li');
                if (thisLi.hasClass('selected')) {
                    selectElmOptions.eq($(this).attr('index')).removeAttr('selected');
                    thisLi.removeClass('selected');
                }
                else {
                    selectElmOptions.eq($(this).attr('index')).prop('selected', 'selected');
                    thisLi.addClass('selected');
                }

                var selectedCount = 0;
                if (selectElm.val() !== null) {
                    selectedCount = selectElm.val().length;
                }
                selectedOption.html('<strong class="count">'+selectedCount+'</strong> '+settings.multipleTitle+'<span>'+mfsHandle+'</span>');
                if (settings.mutlipleTitleNone !== false && selectedCount === 0) {
                    selectedOption.html(settings.mutlipleTitleNone+'<span>'+mfsHandle+'</span>');
                }
            }

            if (settings.mutlipleAutoClose === true || multiple === false) {
                optionList.hide();
                mfsSelectOpen = false;
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

        optionListLi.mouseover(function(){
            optionListLi.removeClass('active');
            $(this).addClass('active');
        });

        selectElm.addClass('mfs-enabled');
    };

    // Create select
    var createSelect = function (thisSelect)
    {
        var touchClass = 'notouch';
        if (settings.disableTouch === true && touchDevice === true) {
            touchClass = '';
        }

        var multiple = false;
        if (thisSelect.attr('multiple')) {
            multiple = true;
        }

        thisSelect.after('<div class="mfs-container '+touchClass+'"></div>');
        var mfsContainer = thisSelect.next('div.mfs-container');
        thisSelect.appendTo(mfsContainer);

        var mfsLabel = '';
        var mfsHtml = '';
        var mfsOptionsHtml = '';
        var indexCount = 0;
        var mfsUlStyle = '';
        var mfsAStyle = '';
        var selectedCount = 0;

        if (multiple === true) {
            if (settings.mutlipleTitleNone !== false) {
                mfsLabel = settings.mutlipleTitleNone;
            }
            else {
                mfsLabel = '<strong class="count">0</strong> '+settings.multipleTitle;
            }
        }

        if (settings.autoWidth === true) {
            mfsAStyle = 'style="white-space: nowrap;"';
        }

        thisSelect.find('> option, optgroup').each(function(){
            var thisTagName = $(this).get(0).tagName.toLowerCase();
            if (thisTagName === 'option') {
                var thisActiveClass = '';
                var thisLabel = $(this).html();
                if (mfsLabel === '' || $(this).is(':selected')) {
                    if (multiple === false) {
                        mfsLabel = thisLabel;
                    }
                    if ($(this).is(':selected')) {
                        thisActiveClass = ' selected';
                        selectedCount++;
                        if (multiple === true) {
                            mfsLabel = '<strong class="count">'+selectedCount+'</strong> '+settings.multipleTitle;
                        }
                    }
                }
                mfsOptionsHtml += '<li class="mfs-option'+thisActiveClass+'"><a href="#" index="'+indexCount+'"'+mfsAStyle+'>'+thisLabel+'</a></li>';
                indexCount++;
            }
            if (thisTagName === 'optgroup') {
                var optGroupLabel = $(this).attr('label');
                var mfsOptGroupHtml = '<li class="mfs-optgroup">'+optGroupLabel+'</li>';

                $(this).find('option').each(function(){
                    var thisActiveClass = '';
                    var thisLabel = $(this).html();
                    if (mfsLabel === '' || $(this).is(':selected')) {
                        mfsLabel = thisLabel;
                        if ($(this).is(':selected')) {
                            thisActiveClass = ' selected';
                        }
                    }
                    mfsOptGroupHtml += '<li class="mfs-option mfs-optgroup-option'+thisActiveClass+'"><a href="#" index="'+indexCount+'"'+mfsAStyle+'>'+thisLabel+'</a></li>';
                    indexCount++;
                });

                mfsOptionsHtml += mfsOptGroupHtml;
            }
        });

        if (settings.dropdownHandle !== false) {
            mfsHandle = settings.dropdownHandle;
        }
        if (settings.enableScroll === true) {
            mfsUlStyle = 'overflow-y:auto;max-height:'+settings.maxHeight+'px;';
        }
        if (settings.autoWidth === true) {
            mfsUlStyle = 'width:auto;min-width:100%;';
        }
        if (mfsUlStyle.length > 0) {
            mfsUlStyle = 'style="'+mfsUlStyle+'"';
        }

        mfsHtml += '<a class="mfs-selected-option" href="#">'+mfsLabel+'<span>'+mfsHandle+'</span></a>';
        mfsHtml += '<ul class="mfs-options"'+mfsUlStyle+'>'+mfsOptionsHtml+'</ul>';

        mfsContainer.prepend(mfsHtml);
        enableMagic(mfsContainer,multiple);
    };

    // Destroy the magic for the select in this container
    var destroySelect = function (theContainer)
    {
        var selectElm = theContainer.find('select');
        selectElm.removeClass('mfs-enabled');
        theContainer.before(selectElm);
        theContainer.remove();
    };

    // Refresh the magic for the select in this container
    var refreshSelect = function (theContainer)
    {
        var selectElm = theContainer.find('select');
        theContainer.before(selectElm);
        theContainer.remove();
        createSelect(selectElm);
    };

    // Search for option in the dropdown
    var searchOption = function (keyCode)
    {
        if (searchTimer !== false) {
            clearTimeout(searchTimer);
        }
        searchTimer = setTimeout(function(){searchString = '';},1000);
        var pressedChar = String.fromCharCode(keyCode);
        searchString += String(pressedChar);

        var foundOption = mfsSelectOpen.find("a:mfssearch('"+searchString+"')").filter(':first');

        if (foundOption.length > 0) {
            mfsSelectOpen.find('li.active').removeClass('active');
            foundOption.closest('li').addClass('active');
            scrollToActiveOption(mfsSelectOpen);
        }
    };

    // Scroll to the active option in the dropdown
    var scrollToActiveOption = function (openMfsList)
    {
        if (settings.enableScroll === true) {
            var activeElm = openMfsList.find('li.mfs-option.active');
            var activeElmHeight = activeElm.height();
            var activeElmPos = activeElm.position();
            var activeElmOffset = activeElm.offset();
            var openMfsListHeight = openMfsList.height();

            if (activeElmPos.top > (settings.maxHeight-24)) {
                openMfsList.scrollTop(openMfsList.scrollTop() + activeElmOffset.top - openMfsList.offset().top - (openMfsListHeight - activeElmHeight) + 5);
            }
            else if (activeElmPos.top < 5) {
                openMfsList.scrollTop(openMfsList.scrollTop() + activeElmOffset.top - openMfsList.offset().top - 5);
            }
        }
    };

    var methods = {
        // Initiate form element replacement
        init : function( options )
        {
            // Unleash the magic! But actually, you shouldn't. Styling is a CSS thing.
            settings = $.extend({}, {
                'refresh'           : true,
                'radio'             : false,
                'checkbox'          : false,
                'dropdownHandle'    : false,
                'enableScroll'      : false,
                'maxHeight'         : 200,
                'autoWidth'         : false,
                'disableTouch'      : false,
                'multipleTitle'     : 'selected',
                'mutlipleTitleNone' : false,
                'multipleAutoClose' : true
            }, options);

            if (this.is("select")) {
                var thisSelect = $(this);
                if (!thisSelect.hasClass('mfs-enabled')) {
                    createSelect(thisSelect);
                }
            }
            else {
                this.each(function() {
                    // Find all selects
                    var thisForm = $(this);
                    if (!thisForm.hasClass('mfs-enabled')) {
                        var selects = thisForm.find('select');
                        if (selects.length > 0) {
                            selects.each(function(){
                                var thisSelect = $(this);
                                if (!thisSelect.hasClass('mfs-enabled')) {
                                    createSelect(thisSelect);
                                }
                            });
                        }
                        // @TODO: Maby later extend the plugin to style radio and checkbox inputs
                        thisForm.addClass('mfs-enabled');
                    }
                });
            }

            // Make the select hide when clicking outside it
            $(window).click(function(){
                $('ul.mfs-options').hide();
                mfsSelectOpen = false;
                searchString = '';
            });

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
                            scrollToActiveOption(mfsSelectOpen);
                        }
                    }
                    else if (keyDown === 40) { // down
                        event.preventDefault();
                        newActiveOption = activeOption.nextAll('.mfs-option:first');
                        if (newActiveOption.length > 0) {
                            newActiveOption.addClass('active');
                            activeOption.removeClass('active');
                            scrollToActiveOption(mfsSelectOpen);
                        }
                    }
                    else if (keyDown === 13) { // Enter
                        activeOption.find('a').click();
                    }
                    else if (keyDown === 27) { // Escape
                        $('ul.mfs-options').hide();
                        mfsSelectOpen = false;
                    }
                }
                else if (mfsSelectOpen !== false && keyDown !== 37 && keyDown !== 39 && keyDown !== 16 && keyDown !== 17 && keyDown !== 18 && keyDown !== 91) { // Ignore left and right arrows, shift, ctrl, alt, cmd
                    event.preventDefault();
                    searchOption(keyDown);
                }
            });
        },

        //Refresh the created replacement
        refresh : function()
        {
            mfsSelectOpen = false;
            searchString = '';
            this.each(function(){
                var thisSelects = $(this).find('select');

                if (thisSelects.length > 0) {
                    thisSelects.each(function(){
                        var thisSelect = $(this);
                        var thisContainer = thisSelect.closest('div.mfs-container');

                        if (!thisSelect.hasClass('mfs-enabled')) {
                            createSelect(thisSelect);
                        }
                        else if (thisContainer.length > 0) {
                            refreshSelect(thisContainer);
                        }
                    });
                }

/*
                var containers = $(this).find('div.mfs-container');
                if (containers.length > 0) {
                    containers.each(function(){
                        var thisContainers = $(this);
                        refreshSelect(thisContainers);
                    });
                }
*/

            });
        },

        // Destroy the created replacement and place back the original element
        destroy : function()
        {
            // Kill all the magic! Styling is a CSS thingie, and not for javascript!
            mfsSelectOpen = false;
            searchString = '';
            this.each(function(){
                var thisForm = $(this);
                var containers = $(this).find('div.mfs-container');
                if (containers.length > 0) {
                    containers.each(function(){
                        var thisContainers = $(this);
                        destroySelect(thisContainers);
                    });
                }

                thisForm.removeClass('mfs-enabled');
            });
        }
    };

    // Method calling logic
    $.fn.mfs = function(method)
    {
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.mfs' );
        }
    };
})( jQuery, window, document );

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