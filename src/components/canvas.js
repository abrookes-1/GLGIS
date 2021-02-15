import React, { useState, useEffect, useRef } from 'react';
import { mat4, glMatrix } from 'gl-matrix';
import { initCanvas } from "../viewer";

function GlCanvas() {
  const canvasRef = useRef(null);
  let [mouse, angle] = useState({})

  useEffect(() => {
    // alert("effect");
    let canvas = canvasRef.current // TODO: ensure component type is canvas
    initCanvas(canvas);
  })

  return (
    <canvas ref={canvasRef} id={"game-surface"} width={800} height={600}>
      Browser does not support HTML5.
    </canvas>
  );
}

function mouseDown(state, event) {
  let x = event.clientX;
  let y = event.clientY;
  let rect = event.target.getBoundingClientRect();

  // check if mouse in canvas bounds
  if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
    state.mouse.lastX = x;
    state.mouse.lastY = y;
    state.dragging = true;
  }
}

function mouseUp(state, event) {
  state.dragging = false;
}

function mouseMove(state, event) {
  let x = event.clientX;
  let y = event.clientY;
  if (state.dragging) {
    let factor = 10 / state.canvas.height;
    let dx = factor * (x - state.mouse.lastX);
    let dy = factor * (y - state.mouse.lastY);

    state.angle.x += dy;
    state.angle.y += dx;
  }
  state.mouse.lastX = x;
  state.mouse.lastY = y;
}

export { GlCanvas }