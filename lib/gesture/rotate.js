/**
 * @ignore
 * fired when rotate using two fingers
 * @author yiminghe@gmail.com
 */
var GestureUtil = require('./util');
var DoubleTouch = GestureUtil.DoubleTouch;
var addGestureEvent = GestureUtil.addEvent;
var DomEvent = require('../base');
var ROTATE_START = 'rotateStart',
    ROTATE = 'rotate',
    RAD_2_DEG = 180 / Math.PI,
    ROTATE_END = 'rotateEnd';
var util = require('modulex-util');
var Feature = require('feature');

function Rotate() {
}

util.extend(Rotate, DoubleTouch, {
    requiredGestureType: 'touch',

    move: function (e) {
        var self = this;
        Rotate.superclass.move.apply(self, arguments);
        var touches = self.lastTouches,
            one = touches[0],
            two = touches[1],
            lastAngle = self.lastAngle,
            angle = Math.atan2(two.pageY - one.pageY,
                    two.pageX - one.pageX) * RAD_2_DEG;

        if (lastAngle !== undefined) {
            // more smooth
            // 5 4 3 2 1 -1 -2 -3 -4
            // 170 180 190 200
            var diff = Math.abs(angle - lastAngle);
            var positiveAngle = (angle + 360) % 360;
            var negativeAngle = (angle - 360) % 360;

            // process '>' scenario: top -> bottom
            if (Math.abs(positiveAngle - lastAngle) < diff) {
                angle = positiveAngle;
            } else if (Math.abs(negativeAngle - lastAngle) < diff) {
                // process '>' scenario: bottom -> top
                angle = negativeAngle;
            }
        }

        self.lastAngle = angle;

        if (!self.isStarted) {
            self.isStarted = true;

            self.startAngle = angle;

            self.target = self.getCommonTarget(e);

            /**
             * fired when rotate started
             * @event ROTATE_START
             * @member Event.Gesture.Rotate
             * @param {Event.DomEvent.Object} e
             * @param {Number} e.rotation -360~360 rotate angle relative to pinch start
             * @param {Number} e.angle -360~360 current rotate absolute angle
             */

            /**
             * fired when rotate
             * @event ROTATE
             * @member Event.Gesture.Rotate
             * @param {Event.DomEvent.Object} e
             * @param {Number} e.rotation -360~360 rotate angle relative to pinch start
             * @param {Number} e.angle -360~360 current rotate absolute angle
             */

            /**
             * fired when rotate ended
             * @event ROTATE_END
             * @member Event.Gesture.Rotate
             * @param {Event.DomEvent.Object} e
             * @param {Number} e.rotation -360~360 rotate angle relative to pinch start
             * @param {Number} e.angle -360~360 current rotate absolute angle
             */

            DomEvent.fire(self.target, ROTATE_START, util.mix(e, {
                angle: angle,
                rotation: 0
            }));
        } else {
            DomEvent.fire(self.target, ROTATE, util.mix(e, {
                angle: angle,
                rotation: angle - self.startAngle
            }));
        }
    },

    end: function (e) {
        var self = this;
        Rotate.superclass.end.apply(self, arguments);
        self.lastAngle = undefined;
        DomEvent.fire(self.target, ROTATE_END, util.mix(e, {
            touches: self.lastTouches
        }));
    }
});

function prevent(e) {
    // android can not throttle
    // need preventDefault always
    if (e.targetTouches.length === 2) {
        e.preventDefault();
    }
}

var r = new Rotate();

addGestureEvent([ROTATE_END, ROTATE_START], {
    handle: r
});

var config = {
    handle: r
};
if (Feature.isTouchEventSupported()) {
    config.setup = function () {
        this.addEventListener('touchmove', prevent, false);
    };
    config.tearDown = function () {
        this.removeEventListener('touchmove', prevent, false);
    };
}

addGestureEvent(ROTATE, config);

module.exports = {
    ROTATE_START: ROTATE_START,
    ROTATE: ROTATE,
    ROTATE_END: ROTATE_END
};