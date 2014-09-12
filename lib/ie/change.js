/**
 * @ignore
 *  change bubble and checkbox/radio fix patch for ie<9
 * @author yiminghe@gmail.com
 */

var DomEvent = require('../base');
var Dom = require('dom');
var Special = DomEvent.Special,
    R_FORM_EL = /^(?:textarea|input|select)$/i;

function isFormElement(n) {
    return R_FORM_EL.test(n.nodeName);
}

function isCheckBoxOrRadio(el) {
    var type = el.type;
    return type === 'checkbox' || type === 'radio';
}

Special.change = {
    setup: function () {
        var self = this;
        if (isFormElement(self)) {
            // checkbox/radio only fires change when blur in ie<9
            // so use another technique from jquery
            if (isCheckBoxOrRadio(self)) {
                // change in ie<9
                // change = propertychange -> click
                DomEvent.on(self, 'propertychange', propertyChange);
                // click may not cause change! (eg: radio)
                DomEvent.on(self, 'click', onClick);
            } else {
                // other form elements use native , do not bubble
                return false;
            }
        } else {
            // if bind on parentNode, lazy bind change event to its form elements
            // note event order : beforeactivate -> change
            // note 2: checkbox/radio is exceptional
            DomEvent.on(self, 'beforeactivate', beforeActivate);
        }
    },
    tearDown: function () {
        var self = this;
        if (isFormElement(self)) {
            if (isCheckBoxOrRadio(self)) {
                DomEvent.remove(self, 'propertychange', propertyChange);
                DomEvent.remove(self, 'click', onClick);
            } else {
                return false;
            }
        } else {
            DomEvent.remove(self, 'beforeactivate', beforeActivate);
            Dom.query('textarea,input,select', self).each(function (fel) {
                if (fel.__changeHandler) {
                    fel.__changeHandler = 0;
                    DomEvent.remove(fel, 'change', {fn: changeHandler, last: 1});
                }
            });
        }
    }
};

function propertyChange(e) {
    // if only checked property 's value is changed
    if (e.originalEvent.propertyName === 'checked') {
        var self = this;
        self.__changed = 1;
        if (self.__changeTimer) {
            clearTimeout(self.__changeTimer);
        }
        // in case program set cause property change
        self.__changeTimer = setTimeout(function () {
            self.__changed = 0;
            self.__changeTimer = null;
        }, 50);
    }
}

function onClick(e) {
    // (only fire change after click on previous unchecked radio)
    if (this.__changed) {
        this.__changed = 0;
        // fire from itself
        DomEvent.fire(this, 'change', e);
    }
}

function beforeActivate(e) {
    var t = e.target;
    if (isFormElement(t) && !t.__changeHandler) {
        t.__changeHandler = 1;
        // lazy bind change, always as last handler among user's handlers
        DomEvent.on(t, 'change', {fn: changeHandler, last: 1});
    }
}

function changeHandler(e) {
    var self = this;

    if (
    // in case stopped by user's callback,same with submit
    // http://bugs.jquery.com/ticket/11049
    // see : test/change/bubble.html
        e.isPropagationStopped() ||
        // checkbox/radio already bubble using another technique
        isCheckBoxOrRadio(self)) {
        return;
    }
    var p;
    if ((p = self.parentNode)) {
        // fire from parent , itself is handled natively
        DomEvent.fire(p, 'change', e);
    }
}