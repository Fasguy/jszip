JSZip [![Build Status](https://api.travis-ci.org/Stuk/jszip.svg?branch=master)](http://travis-ci.org/Stuk/jszip) [![Code Climate](https://codeclimate.com/github/Stuk/jszip/badges/gpa.svg)](https://codeclimate.com/github/Stuk/jszip)
=====

[![Selenium Test Status](https://saucelabs.com/browser-matrix/jszip.svg)](https://saucelabs.com/u/jszip)

A library for creating, reading and editing .zip files with JavaScript, with a
lovely and simple API.

See https://stuk.github.io/jszip for all the documentation.

## Fork Information
In JSZip v3.2.0, the original setImmediate implementation was replaced by set-immediate-shim, which seemingly has immense performance issues. This fork was created to reimplement core-js' setImmediate implementation and restore the original performance from v3.1.5.
It's basically a more up-to-date version of JSZip, with the performance benefits of v3.1.5.

## Usage Example

```javascript
var zip = new JSZip();

zip.file("Hello.txt", "Hello World\n");

var img = zip.folder("images");
img.file("smile.gif", imgData, {base64: true});

zip.generateAsync({type:"blob"}).then(function(content) {
    // see FileSaver.js
    saveAs(content, "example.zip");
});

/*
Results in a zip containing
Hello.txt
images/
    smile.gif
*/
```
License
-------

JSZip is dual-licensed. You may use it under the MIT license *or* the GPLv3
license. See [LICENSE.markdown](LICENSE.markdown).
