# Mighty Form Styler for jQuery

Mighty Form Styler for jQuery replaces your form select element with a html ul list so you can easily and completely style it with css. With some little magic it behaves just like a regular select element.

Version 1.0.6

For changelog see: https://github.com/MightyMedia/Mighty-Form-Styler/blob/master/CHANGELOG.md

Requires jQuery 1.7 or newer.

Licensed under:
MIT License - https://github.com/MightyMedia/Mighty-Form-Styler/blob/master/LICENSE.txt

## Requirements

* jQuery 1.7+

## Installation

To use Mighty Form Styler make sure you have jQuery 1.7 or newer. Next, include the files jquery.mfs.css and jquery.mfs.min.js in your webpage. The css file contains some default styling for the select element.

```html
<link rel="stylesheet" href="jquery.mfs.css">
<script type="text/javascript" src="jquery.mfs.min.js"></script>
```

## Basic usage

### Initialize

```javascript
$(document).ready(function(){
    $('form').mfs();
});
```

### Refresh (e.g. when you updated the values via ajax)

```javascript
$('form').mfs('refresh');
```

### Remove

```javascript
$('form').mfs('destroy');
```

## Options

The following options are available.

### dropdownHandle

Add text or HTML in the dropdown handle (the little arrow down). For example, when you want to use fontawesome icons in the handle.

```javascript
$('form').mfs({
    'dropdownHandle': '<i class="icon-chevron-down"></i>'
});
```

### enableScroll

Enable a scrollbar in the dropdown list, as default this is set to _false_.

```javascript
$('form').mfs({
    'enableScroll' : true
});
```

### maxHeight

Set the max height in pixels for the dropdown list, as default this is set to _200_. The setting *enableScroll* needs to be set to _true_ for this setting to have effect.

```javascript
$('form').mfs({
    'enableScroll' : true,
    'maxHeight'    : 150
});
```

### autoWidth

Make dropdown list width adjust to widest option.

```javascript
$('form').mfs({
    'autoWidth' : true
});
```

### disableTouch

Use native select dropdown on mobile and touch devices.

```javascript
$('form').mfs({
    'disableTouch' : true
});
```

### multipleTitle

Set the title used for the selected option ie 'x selected'. This setting only has effect on select elements with the multiple attribute set.

```javascript
$('form').mfs({
    'multipleTitle' : 'selected'
});
```

### multipleTitleNone

Set an alternative title used for the selected option when no options are selected. This setting only has effect on select elements with the multiple attribute set.

```javascript
$('form').mfs({
    'multipleTitleNone' : 'Make a selection'
});
```

### multipleAutoClose

Set to false to keep a multi select open when selecting options. This setting only has effect on select elements with the multiple attribute set.

```javascript
$('form').mfs({
    'multipleAutoClose' : false
});
```

## Demo

You can preview a live demo at: http://www.binkje.nl/mfs/

## Issues

If you have any ideas or bugs, please submit them to the GitHub issue tracker at https://github.com/MightyMedia/Mighty-Form-Styler/issues.
