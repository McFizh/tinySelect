TinySelect
==========

[![Build Status](https://travis-ci.org/McFizh/tinySelect.svg?branch=master)](https://travis-ci.org/McFizh/tinySelect)

Tiny jquery select component with ajax on demand loading and filtering.

### Construction options:

| option         | description |
| -------------- | ----------- |
| showSearch     | |
| txtLoading     | Text to show while loading ajax request |
| txtAjaxFailure | Text to show, if ajax loading fails |
| dataUrl        | URL where to load content. If value is not set, plugin reads content from select element |
| dataParser     | Custom function to parse data from ajax request |

### Usage example

```
$("#selectElementId").tinyselect({
	showSearch: true,
	txtLoading: "Loading..."
});
```

### Ajax data format

Plugin expects data to be array of objects. Each object should contain attributes 'val' and 'text'. Object can also contain attributes 'selected: true', which selects the element.
