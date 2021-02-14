import React, { useState, useEffect, useRef } from 'react';

var vertexShaderText =
[
'precision mediump float;',
'',
'attribute vec2 vertPosition;',
'attribute vec3 vertColor;',
'varying vec3 fragColor;',
'',
'void main()',
'{',
'  fragColor = vertColor;',
'  gl_Position = vec4(vertPosition, 0.0, 1.0);',
'}'
].join('\n');

var fragmentShaderText =
[
'precision mediump float;',
'',
'varying vec3 fragColor;',
'void main()',
'{',
'  gl_FragColor = vec4(fragColor, 1.0);',
'}'
].join('\n');

function GlCanvas() {
  const canvasRef = useRef(null);

  // function vertexShader(vertPosition, vertColor){
  //   return {
  //     fragColor: vertColor,
  //     gl_Position: [vertPosition.x, vertPosition.y, 0.0, 1.0]
  //   }
  // }

  useEffect(() => {
    // alert("effect");
    let canvas = canvasRef.current // TODO: ensure component type is canvas
    let gl = canvas.getContext('webgl');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);

    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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
      // x, y points in counter-clockwise order, R, G, B
      0.0, 0.5,    1.0, 1.0, 0.0,
      -0.5, -0.5,  0.7, 0.0, 1.0,
      0.5, -0.5,   0.1, 1.0, 0.6
    ];

    let triangleVertexBufferObj = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObj);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

    let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    let colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

    gl.vertexAttribPointer(
      positionAttribLocation,
      2, // number of elements per attribute
      gl.FLOAT,
      gl.FALSE, // whether data is normalized
      5 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
      0 // offset from the beginning of a single vertex to this attribute
    );
    gl.vertexAttribPointer(
      colorAttribLocation,
      3, // number of elements per attribute
      gl.FLOAT,
      gl.FALSE, // whether data is normalized
      5 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
      2 * Float32Array.BYTES_PER_ELEMENT // offset from the beginning of a single vertex to this attribute
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    //
    // Main render loop
    //
    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  })


  return (
    <canvas ref={canvasRef} id={"game-surface"} width={800} height={600}>
      Browser does not support HTML5.
    </canvas>
  );
}

export { GlCanvas }