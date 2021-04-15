/*global console, Array, matrixStack, drawImage, loadImageAndCreateTextureInfo, ejetInput*/
'use strict';

var MAX_ENTITYS = 200;

var Component = {
    /**
     * @param {Array<Entity>} entitys
     */
    children: function (entitys) {
        return {
            null: true,
            type: 'children',
            entitys: entitys || []
        };
    },
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
        return {
            null: true,
            type: 'sprite',
            textureInfo: textureInfo || {},
            width: width || 0,
            height: height || 0,
            x: x || -width / 2,
            y: y || -height / 2,
            sourceX: sourceX || 0,
            sourceY: sourceY || 0,
            flipX: false,
            flipY: false
        };
    },
    /**
     * @param {Array<Object>} sourceFrame - framse em sequencia para animação
     * @example [{x, y, width, height}, ...]
     */
    animation: function (sourceFrame, fps) {
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
    },
    /**
     * @param {Object} configs - {key:String : action:function, ...}
     */
    controll: function (configs) {
        return {
            null: true,
            type: 'controll',
            configs: configs || {}
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
            id: EntityCounter
        };
        nEntity.addComponent = function (component) {
            component.null = false;
            Holder[component.type][nEntity.id] = component;
            return nEntity;
        };

        nEntity.getComponent = function (componentType) {
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
        nEntity.setComponent = function (component) {
            Holder[component.type][nEntity.id] = component;
        };
        nEntity.removeComponent = function (componentType) {
            Holder[componentType][nEntity.id].null = true;
            return nEntity;
        };

        EntityCounter += 1;

        return nEntity;
    };

var System = {
    render: function (entity) {
        var transform = entity.getComponent('transform'),
            sprite = entity.getComponent('sprite');
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
    movement: function (entity, delta) {
        var transform = entity.getComponent('transform'),
            motion = entity.getComponent('motion');
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
    },
    animate: function (entity, delta) {
        var sprite = entity.getComponent('sprite'),
            animation = entity.getComponent('animation');
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
    },
    controll: function (entity, delta) {
        var controll = entity.getComponent('controll');
        if (!controll) {
            return;
        }
        var configs = controll.configs;
        //rule =[combo:string, state:function, action:function]
        configs.forEach(function (rule) {
            if (ejetInput[rule[1]](rule[0])) {
                rule[2](delta);
            }

        });

    }
};
