"use strict";

/*	This is a port of core-js' original implementation of setImmediate which was used in JSZip until v3.2.0
	My guess is, that core-js was removed from JSZip, since having the entire core-js library for this small feature is a bit overkill.
	The library was instead replaced by set-immediate-shim, which seemingly has immense performance issues.

	I DID NOT CREATE THIS CODE, I SIMPLY REIMPLEMENTED THIS SMALL PORTION OF CORE-JS.


	Copyright (c) 2014-2021 Denis Pushkarev

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
*/

//_cof
var toString = {}.toString;

var cof = function(it) {
    return toString.call(it).slice(8, -1);
};

//a-function
var aFunction = function(it) {
    if (typeof it !== "function") {
        throw TypeError(it + " is not a function!");
    }
    return it;
};

//_ctx
var ctx = function(fn, that, length) {
    aFunction(fn);
    if (that === undefined) {
        return fn;
    }
    switch (length) {
        case 1:
            return function(a) {
                return fn.call(that, a);
            };
        case 2:
            return function(a, b) {
                return fn.call(that, a, b);
            };
        case 3:
            return function(a, b, c) {
                return fn.call(that, a, b, c);
            };
    }
    return function() {
        return fn.apply(that, arguments);
    };
};

//_invoke
var invoke = function(fn, args, that) {
    var un = that === undefined;
    switch (args.length) {
        case 0:
            return un ? fn() : fn.call(that);
        case 1:
            return un ? fn(args[0]) : fn.call(that, args[0]);
        case 2:
            return un ? fn(args[0], args[1]) : fn.call(that, args[0], args[1]);
        case 3:
            return un ?
                fn(args[0], args[1], args[2]) :
                fn.call(that, args[0], args[1], args[2]);
        case 4:
            return un ?
                fn(args[0], args[1], args[2], args[3]) :
                fn.call(that, args[0], args[1], args[2], args[3]);
    }
    return fn.apply(that, args);
};

//_global
var global =
    typeof window !== "undefined" && window.Math === Math ?
        window :
        typeof self !== "undefined" && self.Math === Math ?
        self :
        (function() {
            return this;
        })() || {};

//_html
var html = global.document && document.documentElement;

//_is-object
var isObject = function(it) {
    return typeof it === "object" ? it !== null : typeof it === "function";
};

//_dom-create
var _document = global.document,
    // in old IE typeof document.createElement is 'object'
    is = isObject(_document) && isObject(_document.createElement);
var cel = function(it) {
    return is ? _document.createElement(it) : {};
};

//_task
var process = global.process,
    setTask = global.setImmediate,
    clearTask = global.clearImmediate,
    MessageChannel = global.MessageChannel,
    counter = 0,
    queue = {},
    ONREADYSTATECHANGE = "onreadystatechange",
    defer,
    channel,
    port;
var run = function() {
    var id = +this;
    if (queue.hasOwnProperty(id)) {
        var fn = queue[id];
        delete queue[id];
        fn();
    }
};
var listener = function(event) {
    run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!setTask || !clearTask) {
    setTask = function setImmediate(fn) {
        var args = [],
            i = 1;
        while (arguments.length > i) {
            args.push(arguments[i++]);
        }
        queue[++counter] = function() {
            invoke(fn, args);
        };
        defer(counter);
        return counter;
    };
    clearTask = function clearImmediate(id) {
        delete queue[id];
    };
    // Node.js 0.8-
    if (cof(process) === "process") {
        defer = function(id) {
            process.nextTick(ctx(run, id, 1));
        };
        // Browsers with MessageChannel, includes WebWorkers
    } else if (MessageChannel) {
        channel = new MessageChannel();
        port = channel.port2;
        channel.port1.onmessage = listener;
        defer = ctx(port.postMessage, port, 1);
        // Browsers with postMessage, skip WebWorkers
        // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
    } else if (global.addEventListener && typeof postMessage === "function" && !global.importScripts) {
        defer = function(id) {
            global.postMessage(id + "", "*");
        };
        global.addEventListener("message", listener, false);
        // IE8-
    } else if (ONREADYSTATECHANGE in cel("script")) {
        defer = function(id) {
            html.appendChild(cel("script"))[ONREADYSTATECHANGE] = function() {
                html.removeChild(this);
                run.call(id);
            };
        };
        // Rest old browsers
    } else {
        defer = function(id) {
            setTimeout(ctx(run, id, 1), 0);
        };
    }
}

module.exports = setTask;