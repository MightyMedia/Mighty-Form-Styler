# Mighty Form Styler

Mighty Form Styler jQuery plugin replaces your form select element for a html dropdown list so you can easily and completely style it with css.

Version 1.0

Requires jQuery 1.7 or newer.

Licensed under:
MIT License - http://www.binkje.nl/mfs/license/

## Requirements

* jQuery 1.7+

## Installation

To use Mighty Form Styler make sure you have jQuery 1.7 or newer. Next, add jquery.mfs.min.js to your webpage.

```
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

At this point there are three optiona available.

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

## Demo

You can preview a live demo at: http://www.binkje.nl/mfs

## Issues

If you have any ideas or bugs, please submit them to the GitHub issue tracker at https://github.com/MightyMedia/Mighty-Form-Styler/issues.