# TinySelect

![Test](https://github.com/mcfizh/tinyselect/actions/workflows/test-workflow.yml/badge.svg)

Tiny and zero-dependency jquery select component with ajax on demand loading and filtering. Supports jQuery version 3 (though might work with jquery 2 also)

### Construction options:

| option              | description                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------- |
| showSearch          | Show search box                                                                          |
| searchCaseSensitive | Is search case sensitive (true / false)                                                  |
| searchDebounce      | Debounce time for search (in ms, default 100ms)                                          |
| txtLoading          | Text to show while loading ajax request                                                  |
| txtAjaxFailure      | Text to show, if ajax loading fails                                                      |
| ariaSearchLabel     | Aria label for search box (only for screen readers)                                      |
| dataUrl             | URL where to load content. If value is not set, plugin reads content from select element |
| dataParser          | Custom function to parse data from ajax request                                          |

### Usage example

```
$("#selectElementId").tinyselect({
	showSearch: true,
	txtLoading: "Loading..."
});
```

To change dataUrl, you can also call the plugin like so (once initialized):

```
$("#selectElementId").tinyselect("setDataUrl", "new url goes here");
```

And to remove the plugin and go back to default select, you can use destroy API method:

```
$("#selectElementId").tinyselect("destroy");
```

### Ajax data format

Plugin expects data to be array of objects. Each object should contain attributes 'val' and 'text'. Object can also contain attributes 'selected: true', which selects the element.

### Testing plugin locally

You can test the plugins demo page with included http server:

- npm ci
- npm run demoserver

### Compiling the plugin from source

Run the following commands:

- npm ci
- npm run test
  - This step is optional
- npm run build
