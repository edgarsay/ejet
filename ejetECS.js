/*global console, Array, matrixStack, drawImage, loadImageAndCreateTextureInfo,
 ejetInput, drawShape, createTextTextureInfo, drawText*/
'use strict';

var MAX_ENTITYS = 50;

var Component = {
    transform: function (x, y, scaleX, scaleY, rotation) {
        return {
            null: true,
            type: 'transform',
            x: x || 0,
            y: y || 0,
            scaleX: scaleX || 1,
            scaleY: scaleY || 1,
            rotation: rotation || 0
        };
    },
    /**
     * @param {Array} speed - [xSpeed, ySpeed]
     * @param {Array} acceleration - [xAcc, yAcc]
     */
    motion: function (speed, acceleration) {
        return {
            null: true,
            type: 'motion',
            speed: speed || [0, 0],
            acceleration: acceleration || [0, 0]
        };
    },
    sprite: function (textureInfo, width, height, sourceX, sourceY, x, y) {
        if (x !== 0) {
            x = x || -width / 2;
        }
        if (y !== 0) {
            y = y || -height / 2;
        }
        return {
            null: true,
            type: 'sprite',
            textureInfo: textureInfo || {},
            width: width || 0,
            height: height || 0,
            sourceX: sourceX || 0,
            sourceY: sourceY || 0,
            x: x,
            y: y,
            flipX: false,
            flipY: false
        };
    },
    /**
     * @param {String} typeOfShape - 'triangle' or 'square'
     * @param {Number} width
     * @param {Number} height
     * @param {String} color - Hex '#FF0000'
     * @param {Number} offSetX
     * @param {Number} offSetY
     */
    shape: function (typeOfShape, width, height, color, offSetX, offSetY) {
        if (offSetX !== 0) {
            offSetX = offSetX || -width / 2;
        }
        if (offSetY !== 0) {
            offSetY = offSetY || -height / 2;
        }
        return {
            null: true,
            type: 'shape',
            typeOfShape: typeOfShape || 'triangle',
            width: width || 0,
            height: height || 0,
            color: color || '#FF0000', //red
            offSetX: offSetX,
            offSetY: offSetY
        };
    },
    /**
     * @param {String} text
     * @param {Number} width
     * @param {Number} height
     * @param {Number} offSetX
     * @param {Number} offSetY
     * @param {Array<Number>} color = [red, green, blue, alpha]
     * @param {Boolean} pixelart
     */
    text: function (text, width, height, offSetX, offSetY, color, pixelart) {
        text = text || '';
        var newLines = text.match(/\n/g) || [];
        if (offSetX !== 0) {
            offSetX = offSetX || -width / 2;
        }
        if (offSetY !== 0) {
            offSetY = offSetY || (-height / 2 - (newLines.length * 10));
        }
        return {
            null: true,
            type: 'text',
            _text: text,
            textInfo: createTextTextureInfo(text, width, height, pixelart),
            offSetX: offSetX,
            offSetY: offSetY,
            color: color || [1, 1, 1, 1],
            get text() {
                return this._text;
            },
            set text(value) {
                this._text = value;
                this.textInfo = createTextTextureInfo(value, width, height, pixelart);
            }
        };
    },
    /**
     * @param {Array<Object>} sourceFrame - framse em sequencia para animação
     * @example [{x, y, width, height}, ...]
     * @param {Number} fps - frames per second
     * @param {Boolean} loop
     * @param {Boolean} stop
     */
    spriteAnimation: function (sourceFrame, fps, loop, stop) {
        sourceFrame = sourceFrame || [];
        return {
            null: true,
            type: 'spriteAnimation',
            currFrame: 0,
            interval: 0,
            fps: 1000 / (fps || 4),
            frames: sourceFrame,
            length: sourceFrame.length,
            loop: loop || false,
            stop: stop || false,
        };
    },
    /**
     * @param {String} finalText - final text
     * @param {Number} fps - frames per second
     * @param {Boolean} loop
     * @param {Boolean} stop
     */
    textAnimation: function (finalText, fps, loop, stop) {
        finalText = finalText || '';
        return {
            null: true,
            type: 'textAnimation',
            currFrame: 0,
            interval: 0,
            fps: 1000 / (fps || 4),
            _finalText: finalText,
            get finalText(){
                return this._finalText;
            },
            set finalText(value){
                this.currFrame = 0;
                this.length = value.length + 1;
                this._finalText = value;
            },
            length: finalText.length + 1,
            loop: loop || false,
            stop: stop || false,
        };
    },
    hitBox: function (x, y, width, height) {
        if (x !== 0) {
            x = x || -width / 2;
        }
        if (y !== 0) {
            y = y || -height / 2;
        }
        return {
            null: true,
            type: 'hitBox',
            x: x || 0,
            y: y || 0,
            xAbsolute: x + canvas.clientLeft, // + canvas.offsetLeft,
            yAbsolute: y + canvas.clientTop, //+ canvas.offsetTop,
            width: width || 0,
            height: height || 0
        };
    }
};

var Holder = {},
    EntityCounter = 0,
    cleanAllEntitysComponents = function () {
        Holder = {}
        Object.keys(Component).forEach(function (name) {
            Holder[name] = new Array(MAX_ENTITYS - 1).fill(Component[name]());
        });
        EntityCounter = 0;
    };
cleanAllEntitysComponents();

var Entity = function () {
        var nEntity = {};
        nEntity.id = EntityCounter;
        nEntity.children = [];
        nEntity.add = function (component) {
            try {
                var type = component.type;
                component.null = false;
                Holder[type][nEntity.id] = component;
                return nEntity;
            } catch (error) {
                console.log('componentType: ' + component.type);
                throw new Error(error);
            }
        };
        nEntity.get = function (componentType) {
            try {
                var component = Holder[componentType][nEntity.id];
                if (!component.null) {
                    return component;
                }
                return null;
            } catch (error) {
                console.log('componentType: ' + componentType);
                throw new Error(error);
            }
        };
        nEntity.set = function (component) {
            Holder[component.type][nEntity.id] = component;
        };
        nEntity.remove = function (componentType) {
            Holder[componentType][nEntity.id].null = true;
            return nEntity;
        };

        EntityCounter += 1;

        if (EntityCounter > MAX_ENTITYS) {
            throw Error('Too many Entity! (Increase the MAX_ENTITYS number)');
        }

        return nEntity;
    };

var System = {
    renderSprite: function (entity) {
        var transform = entity.get('transform'),
            sprite = entity.get('sprite');
        if (!transform || !sprite) {
            return;
        }
        var textureInfo = sprite.textureInfo,
            scaleX = transform.scaleX,
            scaleY = transform.scaleY;

        if (sprite.flipX) {
            scaleX *= -1;
        }
        if (sprite.flipY) {
            scaleY *= -1;
        }
        matrixStack.save();
        matrixStack.translate(transform.x, transform.y);
        matrixStack.scale(scaleX, scaleY);
        drawImage(
            textureInfo.texture,
            textureInfo.width,
            textureInfo.height,
            sprite.sourceX,
            sprite.sourceY,
            sprite.width,
            sprite.height,
            sprite.x,
            sprite.y
        );
        matrixStack.restore();
    },
    renderShape: function (entity) {
        var transform = entity.get('transform'),
            shape = entity.get('shape');
        if (!transform || !shape) {
            return;
        }
        matrixStack.save();
        matrixStack.translate(transform.x, transform.y);
        matrixStack.scale(transform.scaleX, transform.scaleY);
        drawShape[shape.typeOfShape](
            transform.x + shape.offSetX,
            transform.y + shape.offSetY,
            shape.width,
            shape.height,
            transform.rotation,
            shape.color
        );
        matrixStack.restore();
    },
    renderText: function (entity) {
        var transform = entity.get('transform'),
            text = entity.get('text');
        if (!transform || !text) {
            return;
        }
        matrixStack.save();
        matrixStack.translate(transform.x, transform.y);
        matrixStack.scale(transform.scaleX, transform.scaleY);
        drawText(text.textInfo, text.offSetX, text.offSetY, text.color);
        matrixStack.restore();
    },
    movement: function (entity, delta, parentMotion) {
        var transform = entity.get('transform'),
            motion = parentMotion || entity.get('motion'),
            children = entity.children;
        if (!transform || !motion) {
            return;
        }

        delta = delta || 1;

        var speed = motion.speed,
            acceleration = motion.acceleration;
        transform.x += speed[0] * delta;
        transform.y += speed[1] * delta;
        speed[0] += acceleration[0] * delta;
        speed[1] += acceleration[1] * delta;
        if (children.length === 0) {
            return;
        }
        children.forEach(function (child) {
            System.movement(child, delta, motion);
        });
    },
    animateSprite: function (entity, delta) {
        var sprite = entity.get('sprite'),
            animation = entity.get('spriteAnimation');
        if (!sprite || !animation || animation.stop) {
            return;
        }

        //update animation
        var interval = animation.interval,
            currFrame = animation.currFrame,
            len = animation.length;
        interval += delta;
        if (interval >= animation.fps) {
            currFrame = (currFrame + 1) % len;
            interval = 0;
            //update sprite on entity if necessary
            var frame = animation.frames[currFrame];
            sprite.sourceX = frame.x;
            sprite.sourceY = frame.y;
        }
        if (!animation.loop && currFrame === len - 1) {
            animation.stop = true;
            currFrame = 0;
        }
        animation.interval = interval;
        animation.currFrame = currFrame;
    },
    animateText: function (entity, delta) {
        var text = entity.get('text'),
            animation = entity.get('textAnimation');
        if (!text || !animation || animation.stop) {
            return;
        }

        //update animation
        var interval = animation.interval,
            currFrame = animation.currFrame,
            len = animation.length;
        interval += delta;
        if (interval >= animation.fps) {
            currFrame = (currFrame + 1) % len;
            interval = 0;
            //update sprite on entity if necessary
            text.text = animation.finalText.slice(0, currFrame);
        }
        if (!animation.loop && currFrame === len - 1) {
            animation.stop = true;
            currFrame = 0;
        }
        animation.interval = interval;
        animation.currFrame = currFrame;
    }
};
