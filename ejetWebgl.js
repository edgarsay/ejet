/*global EJET, Image, Uint8Array, document, Float32Array, console*/
'use strict';
//utils
var shadersSource = {
    //Shaper
        'vertex-shaper': [
            'attribute vec4 a_position;',
            'attribute vec4 a_color;',
            'uniform mat4 u_matrix;',
            'varying vec4 v_color;',
            'void main() {',
            '// Multiply the position by the matrix.',
            'gl_Position = u_matrix * a_position;',
            '// Pass the color to the fragment shader.',
            'v_color = a_color;',
            '}'
        ].join('\n'),
        'fragment-shaper': [
            'precision mediump float;',
            '// Passed in from the vertex shader.',
            'varying vec4 v_color;',
            'void main() {',
            'gl_FragColor = v_color;',
            '}'
        ].join('\n'),
    //Texture
        'vertex-texture': [
            'attribute vec4 a_position;',
            'attribute vec2 a_texcoord;',
            'uniform mat4 u_matrix;',
            'uniform mat4 u_textureMatrix;',
            'varying vec2 v_texcoord;',
            'void main() {',
            'gl_Position = u_matrix * a_position;',
            'v_texcoord = (u_textureMatrix * vec4(a_texcoord, 0, 1)).xy;',
            '}'
        ].join('\n'),
        'fragment-texture': [
            'precision mediump float;',
            'varying vec2 v_texcoord;',
            'uniform sampler2D texture;',
            'void main() {',
            'if (v_texcoord.x < 0.0 ||',
            'v_texcoord.y < 0.0 ||',
            'v_texcoord.x > 1.0 ||',
            'v_texcoord.y > 1.0) {',
            'gl_FragColor = vec4(0, 0, 0, 0);',
            'return;',
            '}',
            'gl_FragColor = texture2D(texture, v_texcoord);',
            'gl_FragColor.rgb *= gl_FragColor.a;',
            '}'
        ].join('\n')
    },
    createShader = function (gl, type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    },
    createProgram = function (gl, vertexShader, fragmentShader) {
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }

        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    },
    createProgramFrom = function (gl, vertexSourceName, fragmentSourceName) {
        var vertexSource = shadersSource[vertexSourceName],
            fragmentSource = shadersSource[fragmentSourceName];

        if (!vertexSource) {
            throw new Error(vertexSourceName + ' invalid ShadersSource');
        }
        if (!fragmentSourceName) {
            throw new Error(fragmentSourceName + ' invalid ShadersSource');
        }

        var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource),
            fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

        return createProgram(gl, vertexShader, fragmentShader);
    },
    setCanvasSize = function (canvas, width, height) {
        canvas.width = width;
        canvas.style.width = width + 'px';
        canvas.height = height;
        canvas.style.height = height + 'px';
    },
    degreesToRadians = function (angleInDegrees) {
        return angleInDegrees * Math.PI / 180;
    },
    setLoop = function (callback) {
        function loop(timestamp) {
            var delta = timestamp - lastRender;
            callback(delta, timestamp, lastRender);
            lastRender = timestamp;
            window.requestAnimationFrame(loop);
        }
        var lastRender = 0;
        window.requestAnimationFrame(loop);
    };
var m4 = {
    identity: function () {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    },
    translation: function (tx, ty, tz) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1
        ];
    },
    xRotation: function (angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        return [
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1
        ];
    },
    yRotation: function (angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        return [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1
        ];
    },
    zRotation: function (angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        return [
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    },
    scaling: function (sx, sy, sz) {
        return [
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, 1
        ];
    },
    translate: function (m, tx, ty, tz) {
        return m4.multiply(m, m4.translation(tx, ty, tz));
    },
    xRotate: function (m, angleInRadians) {
        return m4.multiply(m, m4.xRotation(angleInRadians));
    },
    yRotate: function (m, angleInRadians) {
        return m4.multiply(m, m4.yRotation(angleInRadians));
    },
    zRotate: function (m, angleInRadians) {
        return m4.multiply(m, m4.zRotation(angleInRadians));
    },
    scale: function (m, sx, sy, sz) {
        return m4.multiply(m, m4.scaling(sx, sy, sz));
    },
    multiply: function (a, b) {
        var b00 = b[0 * 4 + 0];
        var b01 = b[0 * 4 + 1];
        var b02 = b[0 * 4 + 2];
        var b03 = b[0 * 4 + 3];
        var b10 = b[1 * 4 + 0];
        var b11 = b[1 * 4 + 1];
        var b12 = b[1 * 4 + 2];
        var b13 = b[1 * 4 + 3];
        var b20 = b[2 * 4 + 0];
        var b21 = b[2 * 4 + 1];
        var b22 = b[2 * 4 + 2];
        var b23 = b[2 * 4 + 3];
        var b30 = b[3 * 4 + 0];
        var b31 = b[3 * 4 + 1];
        var b32 = b[3 * 4 + 2];
        var b33 = b[3 * 4 + 3];
        var a00 = a[0 * 4 + 0];
        var a01 = a[0 * 4 + 1];
        var a02 = a[0 * 4 + 2];
        var a03 = a[0 * 4 + 3];
        var a10 = a[1 * 4 + 0];
        var a11 = a[1 * 4 + 1];
        var a12 = a[1 * 4 + 2];
        var a13 = a[1 * 4 + 3];
        var a20 = a[2 * 4 + 0];
        var a21 = a[2 * 4 + 1];
        var a22 = a[2 * 4 + 2];
        var a23 = a[2 * 4 + 3];
        var a30 = a[3 * 4 + 0];
        var a31 = a[3 * 4 + 1];
        var a32 = a[3 * 4 + 2];
        var a33 = a[3 * 4 + 3];

        return [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33
        ];
    },
    projection: function (width, height, depth) {
        // Note: This matrix flips the Y axis so 0 is at the top.
        return [
            2 / width, 0, 0, 0,
            0, -2 / height, 0, 0,
            0, 0, 2 / depth, 0,
            -1, 1, 0, 1
        ];
    },
    orthographic: function (left, right, bottom, top, near, far) {
        return [
            2 / (right - left), 0, 0, 0,
            0, 2 / (top - bottom), 0, 0,
            0, 0, 2 / (near - far), 0,

            (left + right) / (left - right),
            (bottom + top) / (bottom - top),
            (near + far) / (near - far),
            1
        ];
    }
};

function MatrixStack() {
    this.stack = [];

    // since the stack is empty this will put an initial matrix in it
    this.restore();
}

// Pops the top of the stack restoring the previously saved matrix
MatrixStack.prototype.restore = function () {
    this.stack.pop();
    // Never let the stack be totally empty
    if (this.stack.length < 1) {
        this.stack[0] = m4.identity();
    }
};

// Pushes a copy of the current matrix on the stack
MatrixStack.prototype.save = function () {
    this.stack.push(this.getCurrentMatrix());
};

// Gets a copy of the current matrix (top of the stack)
MatrixStack.prototype.getCurrentMatrix = function () {
    return this.stack[this.stack.length - 1].slice();
};

// Lets us set the current matrix
MatrixStack.prototype.setCurrentMatrix = function (m) {
    this.stack[this.stack.length - 1] = m;
    return m;
};

// Translates the current matrix
MatrixStack.prototype.translate = function (x, y, z) {
    if (z === undefined) {
        z = 0;
    }
    var m = this.getCurrentMatrix();
    this.setCurrentMatrix(m4.translate(m, x, y, z));
};

// Rotates the current matrix around Z
MatrixStack.prototype.rotate = function (angleInRadians) {
    var m = this.getCurrentMatrix();
    this.setCurrentMatrix(m4.zRotate(m, angleInRadians));
};

// Scales the current matrix
MatrixStack.prototype.scale = function (x, y, z) {
    if (z === undefined) {
        z = 1;
    }
    var m = this.getCurrentMatrix();
    this.setCurrentMatrix(m4.scale(m, x, y, z));
};

// inicalização
var loadImageAndCreateTextureInfo = null, gl = null, canvas = null,
        textureProgram = null, tPosition = null, tTexcoord = null,
        tMatrix = null, tTextureMatrix = null, tTexture = null,
        shaperProgram = null, sPosition = null, sColor = null,
        sMatrix = null, sVColor = null, sPositionBuffer = null,
        sColorBuffer = null, positionBuffer = null, positions = null,
        sPositions = null, sColors = null, trianglesPoints = null,
        texcoordBuffer = null, texcoords = null, drawImage = null,
        drawTriangle = null,drawSquare = null, matrixStack = null,
        init = function (canvasQuerySelector) {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    canvas = document.querySelector(canvasQuerySelector);
    gl = canvas.getContext('webgl', {alpha: false, premultipliedAlpha: false});
    if (!gl) {
        return;
    }

    matrixStack = new MatrixStack();

    // setup GLSL program - Texture
    textureProgram = createProgramFrom(gl, 'vertex-texture', 'fragment-texture');

    // look up where the vertex data needs to go. - At
    tPosition = gl.getAttribLocation(textureProgram, 'a_position');
    tTexcoord = gl.getAttribLocation(textureProgram, 'a_texcoord');

    // lookup uniforms
    tMatrix = gl.getUniformLocation(textureProgram, 'u_matrix');
    tTextureMatrix = gl.getUniformLocation(textureProgram,
            'u_textureMatrix');
    tTexture = gl.getUniformLocation(textureProgram, 'u_texture');

    // Create a buffer.
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Put a unit quad in the buffer
    positions = [
        0, 0,
        0, 1,
        1, 0,
        1, 0,
        0, 1,
        1, 1
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Create a buffer for texture coords
    texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

    // Put texcoords in the buffer
    texcoords = [
        0, 0,
        0, 1,
        1, 0,
        1, 0,
        0, 1,
        1, 1
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);

    // Shaper initialize
    shaperProgram = createProgramFrom(gl, 'vertex-shaper', 'fragment-shaper');
    sPosition = gl.getAttribLocation(shaperProgram, 'a_position');
    sColor = gl.getAttribLocation(shaperProgram, 'a_color');
    sMatrix = gl.getUniformLocation(shaperProgram, 'u_matrix');
    sPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sPositionBuffer);

    //set triangle
    trianglesPoints = [
        // left column front
        0, 0, 0,
        1, 0, 0,
        0.5, -0.8660254037844386, 0
    ];
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            // left column front
            255, 0, 0,
            255, 0, 0,
            255, 0, 0
        ]),
        gl.STATIC_DRAW
    );
     // Create a buffer to put colors in
    sColorBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = colorBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, sColorBuffer);
    // Put geometry data into buffer
    // Fill the buffer with colors for the 'F'.
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Uint8Array([
            255, 0, 0,
            255, 0, 0,
            255, 0, 0
        ]),
        gl.STATIC_DRAW
    );

    loadImageAndCreateTextureInfo = function (url, pixelart) {
        pixelart = pixelart || true;
        var tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

        if (pixelart) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        }

        // Fill the texture with a 1x1 blue pixel.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 255, 255]));

        // let's assume all images are not a power of 2
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        var textureInfo = {
            width: 1,   // we don't know the size until it loads
            height: 1,
            texture: tex
        };
        var img = new Image();
        img.addEventListener('load', function () {
            textureInfo.width = img.width;
            textureInfo.height = img.height;

            gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        });
        img.src = url;

        return textureInfo;
    };
    // Unlike images, textures do not have a width and height associated
    // with them so we'll pass in the width and height of the texture
    drawImage = function (tex,
            texWidth, texHeight,
            srcX, srcY, srcWidth, srcHeight,
            dstX, dstY, dstWidth, dstHeight) {
        if (dstX === undefined) {
            dstX = srcX;
        }
        if (dstY === undefined) {
            dstY = srcY;
        }
        if (srcWidth === undefined) {
            srcWidth = texWidth;
        }
        if (srcHeight === undefined) {
            srcHeight = texHeight;
        }
        if (dstWidth === undefined) {
            dstWidth = srcWidth;
        }
        if (dstHeight === undefined) {
            dstHeight = srcHeight;
        }

        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        // Tell WebGL to use our shader program pair
        gl.useProgram(textureProgram);

        // Setup the attributes to pull data from our buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(tPosition);
        gl.vertexAttribPointer(tPosition, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        gl.enableVertexAttribArray(tTexcoord);
        gl.vertexAttribPointer(tTexcoord, 2, gl.FLOAT, false, 0, 0);

        // this matrix will convert from pixels to clip space
        var matrix = m4.orthographic(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);

        // this matrix moves the origin to the one represented by
        // the current matrix stack.
        matrix = m4.multiply(matrix, matrixStack.getCurrentMatrix());

        // this matrix will translate our quad to dstX, dstY
        matrix = m4.translate(matrix, dstX, dstY, -1); // this matrix will scale our 1 unit quad // from 1 unit to texWidth, texHeight units
        matrix = m4.scale(matrix, dstWidth, dstHeight, 1);

        // Set the matrix.
        gl.uniformMatrix4fv(tMatrix, false, matrix);

        // Because texture coordinates go from 0 to 1
        // and because our texture coordinates are already a unit quad
        // we can select an area of the texture by scaling the unit quad
        // down
        var texMatrix = m4.translation(srcX / texWidth, srcY / texHeight, 0);
        texMatrix = m4.scale(texMatrix, srcWidth / texWidth, srcHeight / texHeight, 1);

        // Set the texture matrix.
        gl.uniformMatrix4fv(tTextureMatrix, false, texMatrix);

        // Tell the shader to get the texture from texture unit 0
        gl.uniform1i(tTexture, 0);

        // draw the quad (2 triangles, 6 vertices)
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    drawTriangle = function (x, y, width, height, rotation) {
        gl.useProgram(shaperProgram);
        // Turn on the position attribute
        gl.enableVertexAttribArray(sPosition);

        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, sPositionBuffer);

        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                0, 1, 0,
                1, 1, 0,
                0.5, 0, 0
            ]),
            gl.STATIC_DRAW
        );

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        gl.vertexAttribPointer(sPosition, 3, gl.FLOAT, false, 0, 0);

        // Turn on the color attribute
        gl.enableVertexAttribArray(sColor);

        // Bind the color buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, sColorBuffer);

        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Uint8Array([
                255, 0, 0,
                255, 0, 0,
                255, 0, 0
            ]),
            gl.STATIC_DRAW
        );

        gl.vertexAttribPointer(sColor, 3, gl.UNSIGNED_BYTE, true, 0, 0);

        var matrix = m4.orthographic(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);
        matrix = m4.zRotate(matrix, rotation || 0);
        matrix = m4.translate(matrix, x, y, 0);
        matrix = m4.scale(matrix, width, height, 1);

        // Set the matrix.
        gl.uniformMatrix4fv(sMatrix, false, matrix);

        // Draw the geometry.
        var count = 3;
        gl.drawArrays(gl.TRIANGLES, 0, count);
    };
    drawSquare = function (x, y, width, height, rotation) {
        gl.useProgram(shaperProgram);
        // Turn on the position attribute
        gl.enableVertexAttribArray(sPosition);

        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, sPositionBuffer);

        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                0, 0, 0,
                0, 1, 0,
                1, 0, 0,
                1, 0, 0,
                0, 1, 0,
                1, 1, 0
            ]),
            gl.STATIC_DRAW
        );

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        gl.vertexAttribPointer(sPosition, 3, gl.FLOAT, false, 0, 0);

        // Turn on the color attribute
        gl.enableVertexAttribArray(sColor);

        // Bind the color buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, sColorBuffer);

        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Uint8Array([
                255, 0, 0,
                255, 0, 0,
                255, 0, 0,
                255, 0, 0,
                255, 0, 0,
                255, 0, 0
            ]),
            gl.STATIC_DRAW
        );

        gl.vertexAttribPointer(sColor, 3, gl.UNSIGNED_BYTE, true, 0, 0);

        var matrix = m4.orthographic(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);
        matrix = m4.zRotate(matrix, rotation || 0);
        matrix = m4.translate(matrix, x, y, 0);
        matrix = m4.scale(matrix, width, height, 1);

        // Set the matrix.
        gl.uniformMatrix4fv(sMatrix, false, matrix);

        // Draw the geometry.
        var count = 6;
        gl.drawArrays(gl.TRIANGLES, 0, count);
    }
};