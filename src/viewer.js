import {glMatrix, mat4} from "gl-matrix";

let vertexShaderText =
[
'precision mediump float;',
'',
'attribute vec3 vertPosition;',
'attribute vec3 vertColor;',
'varying vec3 fragColor;',
'uniform mat4 mWorld;',
'uniform mat4 mView;',
'uniform mat4 mProj;',
'',
'void main()',
'{',
'  fragColor = vertColor;',
'  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
'}'
].join('\n');

let fragmentShaderText =
[
'precision mediump float;',
'',
'varying vec3 fragColor;',
'void main()',
'{',
'  gl_FragColor = vec4(fragColor, 1.0);',
'}'
].join('\n');

let glState = {
  angle: {x: 0, y: 0},
  mouse: {lastX: 0, lastY: 0, dragging: false},
}

let canvas = null;

let initCanvas = (thisCanvas) => {
  canvas = thisCanvas
  let gl = canvas.getContext('webgl');

  canvas.onmousedown = mouseDown;
  canvas.onmouseup = mouseUp;
  canvas.onmousemove = mouseMove;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, window.innerWidth, window.innerHeight);

  gl.clearColor(0.75, 0.85, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  gl.frontFace(gl.CCW);

  // create shaders
  let vertexShader = gl.createShader(gl.VERTEX_SHADER);
  let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(vertexShader, vertexShaderText);
  gl.shaderSource(fragmentShader, fragmentShaderText);

  gl.compileShader(vertexShader);
  // check for compile errors in shaders
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
    return;
  }

  gl.compileShader(fragmentShader);
  // check for compile errors in shaders
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
    return;
  }

  let program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  // check for linker errors
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('ERROR linking program!', gl.getProgramInfoLog(program));
  }
  // TODO: validate in debug only
  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error('ERROR validating program!', gl.getProgramInfoLog(program));
    return;
  }

  //
  // create buffer
  //
  let triangleVertices = [
    // x, y, z points in counter-clockwise order, R, G, B
  // Top
  -1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
  -1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
  1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
  1.0, 1.0, -1.0,    0.5, 0.5, 0.5,

  // Left
  -1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
  -1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
  -1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
  -1.0, 1.0, -1.0,   0.75, 0.25, 0.5,

  // Right
  1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
  1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
  1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
  1.0, 1.0, -1.0,   0.25, 0.25, 0.75,

  // Front
  1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
  1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
  -1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
  -1.0, 1.0, 1.0,    1.0, 0.0, 0.15,

  // Back
  1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
  1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
  -1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
  -1.0, 1.0, -1.0,    0.0, 1.0, 0.15,

  // Bottom
  -1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
  -1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
  1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
  1.0, -1.0, -1.0,    0.5, 0.5, 1.0,
  ];

  let boxIndices = [
    // Top
    0, 1, 2,
    0, 2, 3,

    // Left
    5, 4, 6,
    6, 4, 7,

    // Right
    8, 9, 10,
    8, 10, 11,

    // Front
    13, 12, 14,
    15, 14, 12,

    // Back
    16, 17, 18,
    16, 18, 19,

    // Bottom
    21, 20, 22,
    22, 20, 23
  ];

  let boxVertexBufferObject = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

  let boxIndexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

  let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
  let colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

  gl.vertexAttribPointer(
    positionAttribLocation,
    3, // number of elements per attribute
    gl.FLOAT,
    gl.FALSE, // whether data is normalized
    6 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
    0 // offset from the beginning of a single vertex to this attribute
  );
  gl.vertexAttribPointer(
    colorAttribLocation,
    3, // number of elements per attribute
    gl.FLOAT,
    gl.FALSE, // whether data is normalized
    6 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
    3 * Float32Array.BYTES_PER_ELEMENT // offset from the beginning of a single vertex to this attribute
  );

  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(colorAttribLocation);

  // Tell OpenGL state machine which program should be active
  gl.useProgram(program);

  let matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
  let matViewUniformLocation = gl.getUniformLocation(program, 'mView');
  let matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

  let worldMatrix = new Float32Array(16);
  let viewMatrix = new Float32Array(16);
  let projMatrix = new Float32Array(16);
  mat4.identity(worldMatrix);
  mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]) // pos of viewer, point looking at, up vec
  mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0) // vert FOV, aspect ratio, near plane, far plane

  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

  //
  // Main render loop
  //
  let xRotationMatrix = new Float32Array(16);
  let yRotationMatrix = new Float32Array(16);
  let identityMatrix = new Float32Array(16);

  mat4.identity(identityMatrix);
  let angle = 0;

  let loop = function () {
    // angle = performance.now() / 1000 / 6 * 2 * Math.PI; // delta time
    // angle = 0 / 1000 / 6 * 2 * Math.PI; // delta time
    mat4.rotate(xRotationMatrix, identityMatrix, glState.angle.x, [0, 1, 0]);
    mat4.rotate(yRotationMatrix, identityMatrix, glState.angle.y, [1, 0, 0]);
    mat4.mul(worldMatrix, xRotationMatrix, yRotationMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

function mouseDown(event) {
  let x = event.clientX;
  let y = event.clientY;
  let rect = event.target.getBoundingClientRect();

  // check if mouse in canvas bounds
  if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
    glState.mouse.lastX = x;
    glState.mouse.lastY = y;
    glState.mouse.dragging = true;
  }
}

function mouseUp(event) {
  glState.mouse.dragging = false;
}

function mouseMove(event) {
  let x = event.clientX;
  let y = event.clientY;
  if (glState.mouse.dragging) {
    let factor = 4 / canvas.height;
    let dx = factor * (x - glState.mouse.lastX);
    let dy = factor * (y - glState.mouse.lastY);

    glState.angle.x += dx;
    glState.angle.y += -dy;
  }
  glState.mouse.lastX = x;
  glState.mouse.lastY = y;
}

export {initCanvas}