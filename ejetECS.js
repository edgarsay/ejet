/*global console, Array, matrixStack, drawImage, loadImageAndCreateTextureInfo, ejetInput, drawShape*/
'use strict';

var MAX_ENTITYS = 200;

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
     * @param {String} typeOfShape - triangle or square
     * @param {Number} width
     * @param {Number} height
     * @param {Number} offSetX
     * @param {Number} offSetY
     */
    shape: function (typeOfShape, width, height, offSetX, offSetY) {
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
            offSetX: offSetX,
            offSetY: offSetY
        };
    },
    /**
     * @param {Array<Object>} sourceFrame - framse em sequencia para animação
     * @example [{x, y, width, height}, ...]
     */
    spriteAnimation: function (sourceFrame, fps) {
        sourceFrame = sourceFrame || [];
        return {
            null: true,
            type: 'animation',
            currFrame: 0,
            interval: 0,
            fps: 1000 / (fps || 4),
            frames: sourceFrame,
            length: sourceFrame.length
        };
    }
};

var Holder = {};
Object.keys(Component).forEach(function (name) {
    Holder[name] = new Array(MAX_ENTITYS).fill(Component[name]());
});

var EntityCounter = 0,
    Entity = function () {
        var nEntity = {
            id: EntityCounter,
            children: []
        };
        nEntity.add = function (component) {
            var type = component.type;
            component.null = false;
            Holder[type][nEntity.id] = component;
            return nEntity;
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

        return nEntity;
    };

var System = {
    render: function (entity) {
        var transform = entity.get('transform'),
            sprite = entity.get('sprite'),
            shape = entity.get('shape');
        if (!transform || (!sprite && !shape)) {
            return;
        }
        if (sprite) { // render SPRITE
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
        }
        if (shape) { // render SHAPE
            matrixStack.save();
            matrixStack.translate(transform.x, transform.y);
            matrixStack.scale(transform.scaleX, transform.scaleY);
            drawShape[shape.typeOfShape](
                transform.x + shape.offSetX,
                transform.y + shape.offSetY,
                shape.width,
                shape.height
                );
            matrixStack.restore();
        }
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
    animate: function (entity, delta) {
        var sprite = entity.get('sprite'),
            animation = entity.get('animation');
        if (!sprite || !animation) {
            return;
        }

        //update animation
        var interval = animation.interval,
            currFrame = animation.currFrame;
        interval += delta;
        if (interval >= animation.fps) {
            currFrame = (currFrame + 1) % animation.length;
            interval = 0;
            //update sprite on entity if necessary
            var frame = animation.frames[currFrame];
            sprite.sourceX = frame.x;
            sprite.sourceY = frame.y;
        }
        animation.interval = interval;
        animation.currFrame = currFrame;
    }
};
