/*global Array*/
'use strict';

var ejetInput = null,
    ejetInputInit = function () {
    var realState = {
        keyStates: new Array(256),
        gamepadStates: new Array(16),
        mouseStates: new Array(3),
        mousePosition: { x: 0, y: 0 }
    };

    // initializes all the keyboard states
    var that = function (){};
    // creates arrays to store information about the state of
    // each of the keys. true if pressed, false otherwise. the
    // *previousKeyStates* array is used to store the state of
    // the keys during the previous update cycle.
    that.keyStates = new Array(256);
    that.previousKeyStates = new Array(256);

    that.gamepadStates = new Array(16);
    that.previousGamepadStates = new Array(16);

    // analogous to *keyStates* and *previousKeyStates*
    that.mouseStates = new Array(3);
    that.previousMouseStates = new Array(3);

    that.useRealState = false;

    that.prototype.mousePosition = {
        x: 0,
        y: 0
    };
    that.mousePosition = that.prototype.mousePosition;

    that.prototype.lastMousePosition = {
        x: 0,
        y: 0
    };
    that.lastMousePosition = that.prototype.lastMousePosition;

    // initializes all the keyStates to their resting
    // position - not pressed
    for (var i = 0; i < that.keyStates.length; i++) {
        that.keyStates[i] = false;
        that.previousKeyStates[i] = false;
    }

    for (var i = 0; i < that.gamepadStates.length; i++) {
        that.gamepadStates[i] = false;
        that.previousGamepadStates[i] = false;
    }

    // same as *keyStates* initialization
    for (var i = 0; i < that.mouseStates.length; i++) {
        that.mouseStates[i] = false;
        that.previousMouseStates[i] = false;
    }

    // checks if the browser is firefox. used for determining some
    // edge cases, as some key codes differ from browser to browser.
    var isFireFox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

    // removes all whitespace from a given string.
    var removeWhiteSpace = function (string) {
        var input = input + "";
        return string.replace(/\s+/, '');
    };

    // replaces all consecutive instances of whitespace in a given
    // string with one space.
    var stripWhiteSpace = function (string) {
        var input = input + "";
        return string.replace(/\s+/, ' ');
    };

    // converts a string to a keycode
    var convertStringToKeycode = function (key) {
        var key = removeWhiteSpace(key);
        key = key.toUpperCase();

        switch (key) {
            case "BACKSPACE":
                return ['key', 8];
            case "SPACEBAR":
                return ['key', 32];
            case "SPACE":
                return ['key', 32];
            case "TAB":
                return ['key', 9];
            case "ENTER":
                return ['key', 13];
            case "SHIFT":
                return ['key', 16];
            case "CONTROL":
                return ['key', 17];
            case "CTRL":
                return ['key', 17];
            case "ALT":
                return ['key', 18];
            case "CAPSLOCK":
                return ['key', 20];
            case "ESCAPE":
                return ['key', 27];
            case "ESC":
                return ['key', 27];
            case "PAGEUP":
                return ['key', 33];
            case "PAGEDOWN":
                return ['key', 34];
            case "ARROWLEFT":
                return ['key', 37];
            case "ARROWUP":
                return ['key', 38];
            case "ARROWRIGHT":
                return ['key', 38];
            case "ARROWDOWN":
                return ['key', 40];
            case "INSERT":
                return ['key', 45];
            case "DELETE":
                return ['key', 46];
            case "+":
                return ['key', isFireFox ? 61 : 187];
            case "=":
                return ['key', isFireFox ? 61 : 187];
            case "-":
                return ['key', isFireFox ? 173 : 189];
            case "[":
                return ['key', 219];
            case "]":
                return ['key', 221];
            case "/":
                return ['key', 191];
            case "\\":
                return ['key', 220];
            default:
                return ['key', key.charCodeAt(0)];
        }
    };

      // converts a string to a gampad button code
    var convertStringToGamepadCode = function (button) {
        var button = removeWhiteSpace(button);
        button = button.toUpperCase();
        switch (button) {
            case "TRIANGLE":
                return ['gamepad', 0];
            case "CIRCLE":
                return ['gamepad', 1];
            case "AXE":
                return ['gamepad', 2];
            case "SQUARE":
                return ['gamepad', 3];
            case "L1":
                return ['gamepad', 4];
            case "R1":
                return ['gamepad', 5];
            case "R2":
                return ['gamepad', 6];
            case "L2":
                return ['gamepad', 7];
            case "RESET":
                return ['gamepad', 8];
            case "START":
                return ['gamepad', 9];
            case "L3":
                return ['gamepad', 10];
            case "R3":
                return ['gamepad', 11];
            case "BUTTONUP":
                return ['gamepad', 12];
            case "BUTTONRIGHT":
                return ['gamepad', 13];
            case "BUTTONDOWN":
                return ['gamepad', 14];
            case "BUTTONLEFT":
                return ['gamepad', 15];
            default:
                return null;
        }
    };

    // converts a string of space separated keys to an array
    // of keycodes which can be used to check their states
    var convertStringToKeyCombo = function (keyCombo) {
        var keyComboString = stripWhiteSpace(keyCombo);
        var combo = keyComboString.split(' ');

        for (var i = 0; i < combo.length; i++) {
            combo[i] = convertStringToKeycode(combo[i]);
        };
        return combo;
    };

    // same as *convertStringToKeyCombo* but with mouse buttons
    var convertStringToButtonCode = function (buttonCode) {
        var code = removeWhiteSpace(buttonCode);
        code = code.toUpperCase();

        switch (code) {
            case "MOUSELEFT":
                return ['mouse', 0];
            case "MOUSEMIDDLE":
                return ['mouse', 1];
            case "MOUSERIGHT":
                return ['mouse', 2];
            default:
                return null;
        }
    };

    var convertStringToCombo = function (combo) {
        var combo = stripWhiteSpace(combo);
        var tokens = combo.split(' ');
        var keysAndButtons = [];

        for (var i = 0; i < tokens.length; i++) {
            var code = convertStringToButtonCode(tokens[i]);
            if (code) {
                keysAndButtons.push(code)
                continue;
            }
            code = convertStringToGamepadCode(tokens[i]);
            if (code) {
                keysAndButtons.push(code)
                continue;
            }
            keysAndButtons.push(convertStringToKeycode(tokens[i]));
        }

        return keysAndButtons;
    }

    var checkCombo = function (combination, mouseStates, keyStates, gamepadStates) {
        var combo = convertStringToCombo(combination),
            inputType = null;
        for (var i = 0; i < combo.length; i++) {
            inputType = combo[0][i];
            if (inputType === 'mouse') {
                if (!mouseStates[combo[i][1]]) {
                    return false;
                }
            } else if (inputType === 'gamepad') {
                if (!gamepadStates[combo[i][1]]) {
                    return false;
                }
            } else {
                if (!keyStates[combo[i][1]]) {
                    return false;
                }
            }
        }
        return true;
    }

    // initializes the *realState* with the default values
    var init = function () {
        for (var i = 0; i < realState.keyStates.length; i++) {
            realState.keyStates[i] = false;
        }

        for (var i = 0; i < realState.mouseStates.length; i++) {
            realState.mouseStates[i] = false;
        }
    };

    // checks whether the given key is down in the given array.
    var isKeyDown = function (key, keyStateArray) {
        var keyCode = convertStringToKeycode(key);
        return keyStazteArray[keyCode];
    };

    // same as *isKeyDown* but with mouse button
    var isButtonDown = function (button, buttonStateArray) {
        var buttonCode = convertStringToButtonCode(button);
        return buttonStateArray[buttonCode];
    };

    // checks if the key was clicked given an array of keystates and
    // an array of previous key states
    var isKeyClicked = function (key, currentKeyStateArray, previousKeyStateArray) {
        return isKeyDown(key, currentKeyStateArray) && !isKeyDown(key, previousKeyStateArray);
    };

    // same as *isKeyClicked* but with mouse buttons
    var isButtonClicked = function (key, currentButtonStateArray, previousButtonStateArray) {
        return isButtonDown(key, currentButtonStateArray) && !isButtonDown(key, previousButtonStateArray);
    };

    that.prototype.isReleased = function (combo) {
        return !checkCombo(combo, that.mouseStates, that.keyStates, that.gamepadStates) &&
            checkCombo(combo, that.previousMouseStates, that.previousKeyStates, that.previousGamepadStates);
    };

    that.prototype.isPressed = function (combo) {
        return checkCombo(combo, that.mouseStates, that.keyStates, that.gamepadStates) &&
            !checkCombo(combo, that.previousMouseStates, that.previousKeyStates, that.gamepadStates);
    };

    that.prototype.isDown = function (combo) {
        if (that.useRealState) {
            that.mousePosition.x = realState.mousePosition.x;
            that.mousePosition.y = realState.mousePosition.y;
            return checkCombo(combo, realState.mouseStates, realState.keyStates, realState.gamepadStates);
        }
        return checkCombo(combo, that.mouseStates, that.keyStates, that.gamepadStates);
    };

    // updates the key and mouse states of the current *pinput* instance.
    // the previous key and mouse states are set to the current ones, and
    // the current ones are set to reflect the actual state of the keyboard
    // and mouse.
    that.prototype.update = function () {
        that.previousKeyStates = that.keyStates.slice(0); // clone()
        that.keyStates = realState.keyStates.slice(0);

        //updata gamepads
        var gamepadStates = that.gamepadStates
        that.previousGamepadStates = gamepadStates.slice(0);
        var gamepads = navigator.getGamepads ? navigator.getGamepads() :
            (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
        if (gamepads[0]) {
            var buttons = gamepads[0].buttons;
            if (buttons) {
                buttons.forEach((button, key) => {
                    gamepadStates[key] = false;
                    if(button.pressed){
                        gamepadStates[key] = true;
                    }
                });
            }
        }
        that.gamepadStates = gamepadStates;

        that.previousMouseStates = that.mouseStates.slice(0);
        that.mouseStates = realState.mouseStates.slice(0);

        that.lastMousePosition.x = that.mousePosition.x;
        that.lastMousePosition.y = that.mousePosition.y;

        that.mousePosition.x = realState.mousePosition.x;
        that.mousePosition.y = realState.mousePosition.y;
    };


    // creates event handlers which update they real state with
    // values corresponding to the state of the mouse and the keyboard
    // at the exact moment in time.

    window.onkeydown = function (e) {
        if (e.which == 18)
            e.preventDefault();
        realState.keyStates[e.which] = true;
    };

    window.onkeyup = function (e) {
        realState.keyStates[e.which] = false;
    };

    canvas.onmousedown = function (e) {
        realState.mouseStates[e.button] = true;
    };

    window.onmouseup = function (e) {
        realState.mouseStates[e.button] = false;
    };

    canvas.onmousemove = function (e) {
        realState.mousePosition.x = e.offsetX;
        realState.mousePosition.y = e.offsetY;
        that.mouseX = e.offsetX;
        that.mouseY = e.offsety;
    }

    /**
     * @param {Entity} entity - entity with a hitBox component
     * @param {Function} action
     */
    that.prototype.onMouseOver = function(entity, action) {
        var hitBox = entity.get('hitBox');
        var transform = entity.get('transform');
        if (!hitBox || !transform) {
            return;
        }
        var x = hitBox.xAbsolute + transform.x,
            y = hitBox.yAbsolute + transform.y,
            mouseX = realState.mousePosition.x,
            mouseY = realState.mousePosition.y;
        if (mouseX > x && mouseX < hitBox.width + x && mouseY > y &&
                mouseY < hitBox.height + y) {
                action();
            }
    }/**
     * 
     * @param {Entity} entity - entity with a hitBox component
     * @param {Function} action
     */
    that.prototype.onClick = function(entity, action) {
        if (!that.mouseStates[0]) {
            return;
        }
        var hitBox = entity.get('hitBox'),
            transform = entity.get('transform');
        if (!hitBox || !transform) {
            return;
        }
        var x = hitBox.xAbsolute + transform.x,
            y = hitBox.yAbsolute + transform.y,
            mouseX = realState.mousePosition.x,
            mouseY = realState.mousePosition.y;
        if (mouseX > x && mouseX < hitBox.width + x && mouseY > y &&
                mouseY < hitBox.height + y) {
                action();
            }
    };

    // initializes *realState*
    init();

    ejetInput = new that;
};