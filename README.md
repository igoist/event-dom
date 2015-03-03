# event-dom

event registration and fire across browsers

[![modulex-event-dom](https://nodei.co/npm/modulex-event-dom.png)](https://npmjs.org/package/modulex-event-dom)
[![NPM downloads](http://img.shields.io/npm/dm/modulex-event-dom.svg)](https://npmjs.org/package/modulex-event-dom)
[![Build Status](https://secure.travis-ci.org/modulex/event-dom.png?branch=master)](https://travis-ci.org/modulex/event-dom)
[![Coverage Status](https://img.shields.io/coveralls/modulex/event-dom.svg)](https://coveralls.io/r/modulex/event-dom?branch=master)
[![Dependency Status](https://gemnasium.com/modulex/event-dom.png)](https://gemnasium.com/modulex/event-dom)
[![node version](https://img.shields.io/badge/node.js-%3E=_0.10-green.svg?style=flat-square)](http://nodejs.org/download/)


## example

```javascript
modulex.use(['event-dom'],function(Event){
    Event.on(document.getElementById('t'),'click',function(){
    });
});
```